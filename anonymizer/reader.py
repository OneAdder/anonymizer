import faulthandler
import logging
import os
import pickle
import random
import sys
from functools import partial
from itertools import chain
from pathlib import Path
from typing import Dict, List, Sequence, Iterable, Set

import numpy as np
from allennlp.common.checks import ConfigurationError
from allennlp.common.file_utils import cached_path
from allennlp.data import Tokenizer
from allennlp.data.dataset_readers.dataset_reader import DatasetReader
from allennlp.data.dataset_readers.dataset_utils.span_utils import iob1_tags_to_spans
from allennlp.data.fields import TextField, SequenceLabelField
from allennlp.data.instance import Instance
from allennlp.data.token_indexers import TokenIndexer, SingleIdTokenIndexer
from allennlp.data.tokenizers import Token

from overrides import overrides

faulthandler.enable(file=sys.__stderr__)

logger = logging.getLogger(__name__)  # pylint: disable=invalid-name

MIN_SEQUENCE_LEN = 100
MAX_SEQUENCE_LEN = 480

TOKEN_COLUMN = 0
LABEL_COLUMN = 1


class DocumentWiseDatasetReader(DatasetReader):
    """
    Just a wrapper aroung DatasetReader that allows reading from separate files.
    It implements ``_read`` method only, ``_text_to_instance`` must be implemented in children class
    along with ``_read_file``
    """

    def __init__(
        self, document_wise: bool = False, pattern: str = "*", lazy: bool = False
    ):
        super(DocumentWiseDatasetReader, self).__init__(lazy=lazy)
        self.document_wise = document_wise
        self.pattern = pattern

    def _read_file(self, file_path: str) -> Iterable[Instance]:
        raise NotImplementedError

    def _read(self, path: str) -> Iterable[Instance]:
        # we implement this method and let child class implement ``_read_file`` for reading each file.
        file = None
        try:
            if self.document_wise:
                if not Path(path).exists():
                    raise RuntimeError(f"Path {path} does not exist!")
                if not Path(path).is_dir():
                    raise RuntimeError(
                        f"Path {path} must be a directory when document_wise"
                    )
                yield from chain.from_iterable(
                    self._read_file(str(file))
                    for file in sorted(Path(path).glob(self.pattern))
                )
            else:
                yield from self._read_file(path)
        except Exception as e:
            # catch everything because we raise Exception anyway
            if file is not None:
                print(f"Exception {e} occured on file {file}")
            raise


@DatasetReader.register("document_wise_conll")
class DocumentWiseConllReader(DocumentWiseDatasetReader):
    def __init__(
        self,
        tokenizer: Tokenizer,
        token_indexers: Dict[str, TokenIndexer] = None,
        feature_labels: Sequence[str] = (),
        lazy: bool = True,
        augment: int = 0,
        document_wise: bool = True,
        coding_scheme: str = "IOB1",
        label_namespace: str = "labels",
        min_sequence_len: int = 100,
        max_sequence_len: int = 500,
        token_column: int = 0,
        label_column: int = 1,
        labels_whitelist: Set[str] = None,
        labels_blacklist: Set[str] = None,
        mask_entities_tokens_prob: float = 0.0,
        mask_token: str = '[MASK]'
    ) -> None:

        """
        Read whole document and create a _single_ data instance from it.
        Useful when training on a document level objective.
        During reading, following token-level augmentations may be applied:
        - random drop
        - random affix with some vocabulary

        :param augment: whether to augment dataset. Default is zero (no augmentation at all),
            must be positive integer. When specified `augment` and `lazy`, augmentations become online.
        """

        super().__init__(lazy=lazy, document_wise=document_wise)
        self._token_indexers = token_indexers or {"tokens": SingleIdTokenIndexer()}
        self.feature_labels = set(feature_labels)
        self.coding_scheme = coding_scheme
        self.label_namespace = label_namespace
        self._original_coding_scheme = "IOB1"
        self.min_sequence_len = min_sequence_len
        self.max_sequence_len = max_sequence_len
        self.token_column = token_column
        self.label_column = label_column
        self._mask_spans_prob = mask_entities_tokens_prob
        self._augment = augment
        self._augment_affix = None
        self._augment_drop = None
        self._footer_augmentations = None
        self._mask_token = mask_token
        self.tokenizer = tokenizer
        self._tokenizer = tokenizer
        if labels_whitelist and labels_blacklist and labels_whitelist & labels_whitelist:
            raise ConfigurationError(f'Blacklist {labels_blacklist} and whitelist {labels_whitelist}'
                                     f'has non-zero intersection: {labels_blacklist & labels_whitelist}')
        self._labels_whitelist = labels_whitelist
        self._labels_blacklist = labels_blacklist

    @overrides
    def _read_file(self, file_path: str) -> Iterable[Instance]:
        # if `file_path` is a URL, redirect to the cache
        file_path = cached_path(file_path)

        if os.path.isfile(file_path):
            with open(file_path) as f:
                text = f.read().split('\n')
                datka_len = 0
                all_file_datka = []
                for line in text:
                    if not (line.startswith("-DOCSTART") or line in ("\n", "")):
                        datka = line.rstrip("\n").strip(' ')
                        if '\t' in datka:
                            datka = datka.split("\t")
                        else:
                            datka = datka.split(' ')
                        all_file_datka.append(
                            (datka[TOKEN_COLUMN], datka[self.label_column])
                        )
                        datka_len += 1
                tokens = self.tokenizer.tokenize(' '.join(tup[0] for tup in all_file_datka))
                while datka_len > 0:
                    if datka_len < self.max_sequence_len:
                        tmp_text = " ".join([d[0] for d in all_file_datka])
                        tokens = self.tokenizer.tokenize(tmp_text)
                        if len(tokens) < self.max_sequence_len:
                            current_piece_len = datka_len
                        else:
                            current_piece_len = np.random.randint(
                                MIN_SEQUENCE_LEN, self.max_sequence_len
                            )
                            current_piece_len = min(current_piece_len, datka_len)
                    else:
                        current_piece_len = np.random.randint(
                            MIN_SEQUENCE_LEN, self.max_sequence_len
                        )
                        current_piece_len = min(current_piece_len, datka_len)

                    while current_piece_len > 30:
                        tmp_text = " ".join(
                            [d[0] for d in all_file_datka[:current_piece_len]]
                        )
                        tokens = self.tokenizer.tokenize(tmp_text)
                        if len(tokens) < self.max_sequence_len:
                            current_piece_len = len(tokens)
                            break
                        current_piece_len = current_piece_len - 10

                    datka_len = datka_len - current_piece_len
                    yield self.text_to_instance(
                        [tok for tok in tokens[:current_piece_len]],
                        [d[1] for d in all_file_datka[:current_piece_len]],
                    )
                    all_file_datka = all_file_datka[current_piece_len:]
                    tokens = tokens[current_piece_len:]

    def text_to_instance(self, tokens: List[Token], tags: List[str] = None) -> Instance:
        sentence_field = TextField(tokens, self._token_indexers)
        fields = {"tokens": sentence_field}
        if self._mask_spans_prob > 0:
            spans = iob1_tags_to_spans(tags)
            for span in spans:
                if random.uniform(0, 1) < self._mask_spans_prob:
                    for idx in range(*span[1]):
                        tokens[idx].text = self._mask_token
        if tags:
            if self._labels_blacklist:
                tags = [tag if tag[2:] not in self._labels_blacklist else 'O' for tag in tags]
            if self._labels_whitelist:
                tags = [tag if tag[2:] in self._labels_whitelist else 'O' for tag in tags]
            label_field = SequenceLabelField(labels=tags, sequence_field=sentence_field)
            fields["tags"] = label_field

        return Instance(fields)
