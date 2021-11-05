from functools import lru_cache
from pathlib import Path

import numpy as np
import re

from collections import defaultdict
from typing import List, Dict, Any, Set

from allennlp.data.dataset_readers.dataset_utils.span_utils import iob1_tags_to_spans

from anonymizer import ROOT_PATH


@lru_cache()
def get_opencorpora_vocab() -> Set:
    return set(Path(ROOT_PATH / 'files/opencorpora_vocab.txt').read_text().split())


def get_oov_ratio(tokens) -> float:
    """
    Calculates how many tokens from tesseract predict are in fact OOV tokens for Opencorpora.
    High OOV ratio may suggest poor OCR quality and therefore may require validation
    """
    vocab = get_opencorpora_vocab()
    counter = oov = 0
    for word in tokens:
        if word:
            word = re.sub('[^а-яА-Яa-zA-Z]+', '', word.lower())
            counter += 1
            oov += word.lower() not in vocab
    return oov / float(counter)


def gather_data_for_confidence(all_tags: List[List[str]], ocr_result: List, confidences: List[int], tokens: List[str]) \
        -> Dict[str, Any]:
    result = {}

    flattened_tags = []
    for tags in all_tags:
        flattened_tags.extend(tags)
    spans = iob1_tags_to_spans(flattened_tags)
    entity_counts = defaultdict(list)
    for span in spans:
        entity_counts[span[0]].append(span)

    result['num_pages'] = len(ocr_result)
    result['num_spans'] = len(entity_counts['PER'])
    result['spans'] = spans
    result['num_one_token_spans'] = len([span for span in spans if span[1][1] - span[1][0] == 0])
    result['oov_ratio'] = get_oov_ratio(tokens)

    cleaned_confs = [i for i in confidences if isinstance(i, int)]
    result['ocr_confidences_mean'] = np.array(cleaned_confs).mean()
    return result
