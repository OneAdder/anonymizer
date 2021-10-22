import copy
import json
import os
from copy import deepcopy
from pathlib import Path
from typing import List, Union, Dict, Optional

from allennlp.common import Params
from allennlp.common.checks import ConfigurationError
from allennlp.data import DatasetReader
from allennlp.data.tokenizers import WhitespaceTokenizer
from allennlp.data.tokenizers import Token, Tokenizer
from allennlp.models import Model
from allennlp.predictors import Predictor

overrides = {}


def load_predictor(
    prefix: str,
    name: str,
    dataset_reader: Optional[Union[DatasetReader, str]] = None,
    device: str = "cpu",
    overrides: Union[str, Dict] = None,
    **kwargs,
) -> Predictor:

    if isinstance(overrides, str):
        overrides = json.loads(overrides)
    overrides = deepcopy(overrides) or {}
    config_path = os.path.join(prefix, "config.json")
    config_contents = Path(config_path).read_text()
    print(overrides)
    overrides = json.dumps(overrides)
    params = Params.from_file(
        config_path, params_overrides=overrides
    )

    dataset_reader = dataset_reader or "train"
    if isinstance(dataset_reader, str):
        if dataset_reader not in ["train", "valid"]:
            raise ConfigurationError(f"Unknown dataset reader type: {dataset_reader}")
        reader_params = copy.deepcopy(
            params[
                "dataset_reader"
                if dataset_reader == "train"
                else "validation_dataset_reader"
            ]
        )
        print(reader_params)
        dataset_reader = DatasetReader.from_params(reader_params)
    model_type = params["model"]["type"]

    descendant_cls = Model.by_name(model_type)
    model = descendant_cls._load(params, prefix)

    model.eval()
    model = model.to(device)
    predictor = Predictor.by_name(name)(model, dataset_reader, **kwargs)
    return predictor


@Tokenizer.register("space_coords_tokenizer")
class CoordsWhitespaceTokenizer(WhitespaceTokenizer):

    def tokenize(self, text: str) -> List[Token]:
        start = 0
        tokens = super(CoordsWhitespaceTokenizer, self).tokenize(text)
        for token in tokens:
            token.idx = text.find(token.text, start)
            token.idx_end = token.idx + len(token.text)
            start = token.idx_end
        return tokens


class NewsNER:

    def __init__(self, path, device: str = "cpu", n_iterations: int =1):
        token_window = 252
        self._token_window = token_window
        self._zero_overlap = False
        self._overlap = self._token_window // 3
        self.n_iterations = n_iterations
        overrides = {}
        overrides.pop("dataset_reader.tokenizer.model_name")
        overrides['dataset_reader.token_indexers.tokens.type'] = 'pretrained_transformer_mismatched'
        # overrides['dataset_reader.min_len'] = token_window
        # overrides['dataset_reader.max_len'] = token_window
        overrides['model.text_field_embedder.token_embedders.tokens.type'] = 'pretrained_transformer_mismatched'
        overrides['dataset_reader.tokenizer'] = "space_coords_tokenizer"
        # TODO: хранить проивольную модель отдельно от берта
        self.predictor = load_predictor(
            path,
            "PO_anonymizer",
            # max_sequence_length=512,
            overrides=overrides,
            device=device,
            token_window=token_window,
        )
        self._inner_tokenizer = CoordsWhitespaceTokenizer()

    def predict(self, tokens: List[Token]) -> List[str]:
        """
        This wrapper does not handle models other than `crf_tagger`-like predictor
        :param tokens: list of document tokens
        :return: simplified predictions. Note that as for now, we do not need
            complex structure
        """
        tokens = self._inner_tokenizer.tokenize(' '.join([token.text for token in tokens]))
        n = len(tokens)
        start = 0
        end = 0
        instances = []
        while end < n:
            end = min(start + self._token_window, n)
            instances.append(self.predictor._dataset_reader.text_to_instance(tokens[start:end], None))
            if self._zero_overlap:
                start += self._token_window
            else:
                start = start + self._overlap
        result = self.predictor._inner_predict(instances, ' '.join([token.text for token in tokens]))
        simplified_predictions: List[str] = [
            tag.strip() for tag in result['tags']
        ]
        return simplified_predictions
