import json
import os
import traceback
import warnings
from datetime import datetime
from pathlib import Path
from typing import List, Tuple, Dict, Any

import gc
import yargy.tokenizer as ya
import numpy as np
from allennlp.data.dataset_readers.dataset_utils.span_utils import iob1_tags_to_spans
from flask import abort, jsonify, request, send_file, Flask
from pdf2image import convert_from_path
from PIL import PpmImagePlugin
from pytesseract import image_to_data, Output

from anonymizer.converters import anything2pdf
from anonymizer.pdf_highlighter import PDFHighlighter
from anonymizer.predictor import NewsNER
from confidence import gather_data_for_confidence

ROOT_PATH = Path(__file__).parent.parent.resolve()
INPUT_PATH = ROOT_PATH / 'INPUT'
INPUT_PATH.mkdir(exist_ok=True)
OUTPUT_PATH = ROOT_PATH / 'OUTPUT'
OUTPUT_PATH.mkdir(exist_ok=True)
if not os.environ.get('PRETRAINED_TRANSFORMERS_DIR'):
    os.environ['PRETRAINED_TRANSFORMERS_DIR'] = str(ROOT_PATH / 'pretrained_transformers_dir/rubert')
# PREDICTOR = NewsNER("/media/yaroslav/data/models/anonym_dit/collection3_and_137_dit_docs/")
PREDICTOR = NewsNER(ROOT_PATH / 'model' / 'model')
app = Flask(__name__, static_url_path='', static_folder='front')
TOKENIZER = ya.Tokenizer()


def repeat_to_length(string_to_expand: str, length: int) -> str:
    return (string_to_expand * length)[:length]


def requires_validation(all_tags: List[List[str]], ocr_result: List, ocr_confidences: List[int]) -> Tuple[bool, Dict]:
    """
    Вычисляем reject option -- нужно ли отправлять документ на валидацию.
    На валидацю отправляются документы по следующим признакам:
    - длина документа в страницах
    - число извлеченных сущностей. Мотивация: чем больше сущностей запредиктила модель,
        тем больше сущностей в документе, тем выше вероятность, что модель ошиблась где-то
    - число однотокенных сущностей. В документах всегда имена идут полностью или сокращённо,
        таким образом, наличие однотокенных сущностей свидетельствует об аномалиях OCR,
        и таким документам нужна верификация
    """
    # remove everything except PER
    confidence_features = gather_data_for_confidence(all_tags, ocr_result, ocr_confidences)
    not_sure = False
    if not ocr_result:
        not_sure = True
    if confidence_features['num_pages'] > 7:
        not_sure = True
    if confidence_features['num_spans'] > 40:
        not_sure = True
    if confidence_features['num_one_token_spans'] > 20:
        not_sure = True
    if confidence_features['ocr_confidences_mean'] < 88:
        not_sure = True
    return not_sure, confidence_features


def build_input_to_model(inputs: List[str]) -> List[List]:
    tokens2_iter = TOKENIZER(' '.join(inputs))
    ress = []
    for token in tokens2_iter:
        if token.type != "EOL":
            ress.append(list((token.value, *token.span)))
    return ress


def anonymize_tokens(model_inputs: List[List], predictions: List[str]) -> List[str]:
    new_tokens = []
    for token, tag in zip(model_inputs, predictions):
        if tag != 'O':
            new_tokens.append(repeat_to_length(tag[2:], len(token[0])))
        else:
            new_tokens.append(token[0])
    return new_tokens


def build_anonymized_tokens(real_inputs, model_inputs: List[List], new_tokens: List[str]) -> Tuple[List[str], List[str]]:
    orig_length = len(' '.join(real_inputs))
    anonymized = [' '] * orig_length
    # for multi-label anonymization we need to retain information which labels
    # correspond to which `tesseract` tokens
    labels = [' '] * orig_length
    for value, token_info in zip(new_tokens, model_inputs):
        anonymized[token_info[1]:token_info[2]] = list(value)
        # for PER label, we will have 'P'
        labels[token_info[1]:token_info[2]] = [value[0] if char else ' ' for char in value]
    new_tesseract_tokens = ''.join(anonymized).split(' ')
    labels = ''.join(labels).split(' ')
    return new_tesseract_tokens, labels


def get_original_label(label: str) -> str:
    if label.startswith('P'):
        return 'PER'
    elif label.startswith('L'):
        return 'LOC'
    elif label.startswith('O'):
        return 'ORG'
    else:
        return ''


def run_model(images: List[PpmImagePlugin.PpmImageFile]
              ) -> Tuple[List[List[Tuple[Tuple[int, int, int, int], str]]], bool, Dict[str, Any]]:
    coordinates = []
    tags_list = []
    confidences = []
    for i, image in enumerate(images):
        ocr_result = image_to_data(image, output_type=Output.DICT, lang='rus')
        inputs = [word.strip() for word in ocr_result['text'] if word.strip()]
        model_inputs = build_input_to_model(inputs)
        tags = PREDICTOR.predict([t[0] for t in model_inputs])
        anonymized_tokens = anonymize_tokens(model_inputs, tags)
        original_anonymized_tokens, labels = build_anonymized_tokens(inputs, model_inputs, anonymized_tokens)
        assert len(inputs) == len(original_anonymized_tokens)
        equals = [before == after for before, after in zip(inputs, original_anonymized_tokens)]
        token_counter = 0
        confidences.extend(ocr_result['conf'])
        page = []
        for j, word in enumerate(ocr_result['text']):
            (x, y, w, h) = (
                ocr_result['left'][j],
                ocr_result['top'][j],
                ocr_result['width'][j],
                ocr_result['height'][j]
            )
            if word.strip():
                if not equals[token_counter]:
                    page.append(((x, y, x + w, y + h), get_original_label(labels[token_counter])))
                token_counter += 1
        coordinates.append(page)
        tags_list.append(tags)
    not_sure, features = requires_validation(tags_list, coordinates, confidences)
    return coordinates, not_sure, features


@app.route('/')
def index():
    return (ROOT_PATH / 'anonymizer' / 'front' / 'index.html').read_text()


@app.route('/api/anonymize', methods=['POST'])
def anonymize():
    if 'file' not in request.files:
        abort(400, 'Поля `file` нет в реквесте')
    file = request.files['file']
    filename = f'{datetime.now().timestamp()}_{file.filename}'
    raw_path = INPUT_PATH / filename
    file.save(raw_path)
    input_path = INPUT_PATH / f'{raw_path.name}.pdf'
    # в конвертере есть байпасс, пдфки он жевать не будет, только пересохранит
    anything2pdf(raw_path, input_path)
    images = convert_from_path(input_path)  #, dpi=PDFHighlighter.DPI)
    try:
        coordinates, not_sure, confidence_features = run_model(images)
    except Exception as e:
        traceback.print_exc()
        warnings.warn(f'Произошла ошибка: {e}')
        coordinates, not_sure, confidence_features = [[]] * len(images), True, {}
    pdf_path = OUTPUT_PATH / f'{datetime.now().timestamp()}_{file.filename}'
    pdf_path.mkdir()
    confidence_path = pdf_path / 'confidences.json'
    confidence_path.write_text(json.dumps(confidence_features, indent=4, ensure_ascii=False))
    highlighter = PDFHighlighter(
        input_data=images,
        output_path=pdf_path,
        coordinates=coordinates,
        not_sure=not_sure,
    )
    gc.collect()
    return jsonify({'filename': highlighter.blurred_pdf.parent.name,
                    'input': input_path.name,
                    'not_sure': not_sure})


@app.route('/api/load_pdf', methods=['GET'])
def load_pdf():
    name = request.args.get('name')
    hidden = request.args.get('hidden')
    raw = request.args.get('raw')
    if not name:
        abort(405, 'В запросе не подано имя файла ("name")')
    file_path = INPUT_PATH / name if raw else OUTPUT_PATH / name
    if not file_path.exists():
        abort(404, f'Нет такого файла {name}')
    if raw:
        filename = file_path
    elif hidden:
        filename = file_path / PDFHighlighter.HIDDEN_FILENAME
    else:
        filename = file_path / PDFHighlighter.BLURRED_FILENAME
    return send_file(filename)


@app.route('/api/list_pdf', methods=['GET'])
def list_pdf():
    return jsonify(os.listdir(OUTPUT_PATH))


if __name__ == '__main__':
    app.run(port=8080)
