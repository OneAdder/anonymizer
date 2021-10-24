import copy
import json
import os
from copy import deepcopy
from pathlib import Path
from typing import List, Union, Dict, Optional, Tuple

from allennlp.common import Params, JsonDict
from allennlp.common.checks import ConfigurationError
from allennlp.data import DatasetReader, Instance
from allennlp.data.tokenizers import WhitespaceTokenizer, PretrainedTransformerTokenizer
from allennlp.data.tokenizers import Token, Tokenizer
from allennlp.models import Model
from allennlp.predictors import Predictor

from anonymizer.reader import DocumentWiseConllReader
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


@Tokenizer.register("whitespace_coords")
class CoordsWhitespaceTokenizer(WhitespaceTokenizer):

    def tokenize(self, text: str) -> List[Token]:
        start = 0
        tokens = super(CoordsWhitespaceTokenizer, self).tokenize(text)
        for token in tokens:
            token.idx = text.find(token.text, start)
            token.idx_end = token.idx + len(token.text)
            start = token.idx_end
        return tokens


@Predictor.register("long_sequence")
class LongSequencePredictor(Predictor):

    def __init__(
            self,
            model: Model,
            dataset_reader: DatasetReader,
            token_window: int = 400,
            zero_overlap: bool = False,
            return_entities = True,
            batch_size: int = 6,
            tags_separator: str = "||",
            output_tag: str = "OUT"):
        super().__init__(model, dataset_reader)
        self._token_window = None
        self._overlap = None
        self.token_window = token_window
        self._tokenizer = self._dataset_reader._tokenizer
        self._batch_size = batch_size
        self._transformer_tokenizer = False
        self._zero_overlap = zero_overlap
        self._return_entities = return_entities
        self.tags_separator = tags_separator
        self.output_tag = output_tag
        if isinstance(self._tokenizer, PretrainedTransformerTokenizer):
            self._transformer_tokenizer = True

    @property
    def token_window(self) -> int:
        return self._token_window

    @token_window.setter
    def token_window(self, value: int):
        if value < 3:
            raise ConfigurationError("token_window must be bigger than 2.")
        self._token_window = value
        self._overlap = value // 3

    def _predict_on_instances(self, instances: List[Instance]) -> List[JsonDict]:
        predictions = []
        for i in range(len(instances) // self._batch_size + 1):
            batch = instances[i * self._batch_size: (i + 1) * self._batch_size]
            if batch == []:
                break
            predictions += self._model.forward_on_instances(batch)
        return predictions

    def strip_special_tokens(self, tokens: List[Token], tags: List[str]) -> Tuple[List[Token], List[str]]:
        if not self._transformer_tokenizer:
            return tokens, tags
        return tokens[1:-1], tags[1:-1]

    @staticmethod
    def _reconstruct_zero_overlap(instances: List[Instance],
                                  predictions: List[JsonDict]) -> Tuple[List[Token], List[str]]:
        """
        Создает массивы токенов и предсказаний с нулевым перекрытием.
        """
        document_tokens = []
        document_tags = []
        for instance, prediction in zip(instances, predictions):
            document_tokens += instance["tokens"].tokens
            document_tags += prediction["tags"]
        return document_tokens, document_tags

    def _reconstruct_with_overlap(self,
                                  instances: List[Instance],
                                  predictions: List[JsonDict]) -> Tuple[List[Token], List[str]]:
        if len(instances) == 1:
            return instances[0]["tokens"].tokens, predictions[0]["tags"]
        document_tokens = []
        document_tags = []

        if len(instances) == 2:
            document_tokens += instances[0]["tokens"].tokens[:self._overlap * 2]
            document_tokens += instances[1]["tokens"].tokens[self._overlap:]
            document_tags += predictions[0]["tags"][:self._overlap * 2]
            document_tags += predictions[1]["tags"][self._overlap:]
            return document_tokens, document_tags[:len(document_tokens)]

        for i, (instance, prediction) in enumerate(zip(instances, predictions)):
            instance_tokens = instance["tokens"].tokens
            instance_tags = prediction["tags"]
            instance_tokens, instance_tags = self.strip_special_tokens(instance_tokens, instance_tags)
            if i == 0:
                # Первый инстанс, берем первые 2/3
                positions = slice(0, self._overlap * 2)
            elif i == len(instances) - 1:
                # Последний инстанс, берем последние 2/3
                positions = slice(self._overlap, len(instance_tags) + 1)
            else:
                # Промежуточный инстанс, берем только серединную треть
                positions = slice(self._overlap, self._overlap * 2)
            document_tokens += instance_tokens[positions]
            document_tags += instance_tags[positions]

        return document_tokens, document_tags

    def _inner_predict(self, instances: List[Instance], text: str) -> JsonDict:
        predictions: List[JsonDict] = self._predict_on_instances(instances)
        assert len(instances) == len(predictions), (len(instances), len(predictions))

        if self._zero_overlap:
            document_tokens, document_tags = self._reconstruct_zero_overlap(instances, predictions)
        else:
            document_tokens, document_tags = self._reconstruct_with_overlap(instances, predictions)

        assert len(document_tokens) == len(document_tags), (document_tokens, document_tags)
        output_dict = {
            "tags": document_tags,
            "tokens": document_tokens
        }
        return output_dict

    def get_tokens(self, text: List[str]) -> List[Token]:
        tokens = []
        for lineno, line in enumerate(text):
            line_tokens = self._tokenizer.tokenize(line)
            for token in line_tokens:
                token.idx = (lineno, token.idx)
                token.idx_end = (lineno, token.idx_end)
                tokens.append(token)
        return tokens

    def predict_json(self, inputs: JsonDict) -> JsonDict:
        text = "".join(inputs["text"])
        if not text or text.isspace():
            return {"entities": [], "tags": []}
        instances: List[Instance] = self._json_to_instance(inputs)
        return self._inner_predict(instances, inputs["text"])

    def _json_to_instance(self, json_dict: JsonDict) -> List[Instance]:
        text: List[str] = json_dict["text"]
        tokens = self.get_tokens(text)
        n = len(tokens)
        start = 0
        end = 0
        instances = []
        while end < n:
            end = min(start + self._token_window, n)
            instances.append(self._dataset_reader.text_to_instance(tokens[start:end], None))
            if self._zero_overlap:
                start += self._token_window
            else:
                start = start + self._overlap
        return instances


class NewsNER:

    def __init__(self, path, device: str = "cpu", n_iterations: int =1):
        token_window = 252
        self._token_window = token_window
        self._zero_overlap = False
        self._overlap = self._token_window // 3
        self.n_iterations = n_iterations
        overrides = {
            "dataset_reader.token_indexers.tokens.model_name": os.environ['PRETRAINED_TRANSFORMERS_DIR'],
            "model.text_field_embedder.token_embedders.tokens.model_name": os.environ['PRETRAINED_TRANSFORMERS_DIR']
        }
        # overrides.pop("dataset_reader.tokenizer.model_name")
        overrides['dataset_reader.token_indexers.tokens.type'] = 'pretrained_transformer_mismatched'
        # overrides['dataset_reader.min_len'] = token_window
        # overrides['dataset_reader.max_len'] = token_window
        overrides['model.text_field_embedder.token_embedders.tokens.type'] = 'pretrained_transformer_mismatched'
        overrides['dataset_reader.tokenizer'] = "whitespace_coords"
        # TODO: хранить проивольную модель отдельно от берта
        self.predictor = load_predictor(
            path,
            "long_sequence",
            # max_sequence_length=512,
            overrides=overrides,
            device=device,
            token_window=token_window,
        )
        self._inner_tokenizer = CoordsWhitespaceTokenizer()

    def predict(self, tokens: List[str]) -> List[str]:
        """
        This wrapper does not handle models other than `crf_tagger`-like predictor
        :param tokens: list of document tokens
        :return: simplified predictions. Note that as for now, we do not need
            complex structure
        """
        tokens = self._inner_tokenizer.tokenize(' '.join(tokens))
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


if __name__ == '__main__':
    obj = NewsNER("/media/yaroslav/data/models/anonym_dit/collection3_and_137_dit_docs/")
