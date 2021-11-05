import numpy as np

from collections import defaultdict
from typing import List, Dict, Any

from allennlp.data.dataset_readers.dataset_utils.span_utils import iob1_tags_to_spans


def gather_data_for_confidence(all_tags: List[List[str]], ocr_result: List, confidences: List[int]) -> Dict[str, Any]:
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

    cleaned_confs = [i for i in confidences if isinstance(i, int)]
    result['ocr_confidences_mean'] = np.array(cleaned_confs).mean()
    return result
