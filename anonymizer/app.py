import os
import traceback
from datetime import datetime
from pathlib import Path
from typing import List, Tuple
from flask import abort, jsonify, request, send_file, Flask
from pdf2image import convert_from_path
from PIL import PpmImagePlugin
from pytesseract import image_to_data, Output

from anonymizer.converters import anything2pdf
from anonymizer.pdf_highlighter import PDFHighlighter
from anonymizer.predictor import NewsNER

ROOT_PATH = Path(__file__).parent.parent.resolve()
INPUT_PATH = ROOT_PATH / 'INPUT'
INPUT_PATH.mkdir(exist_ok=True)
OUTPUT_PATH = ROOT_PATH / 'OUTPUT'
OUTPUT_PATH.mkdir(exist_ok=True)
if not os.environ.get('PRETRAINED_TRANSFORMERS_DIR'):
    os.environ['PRETRAINED_TRANSFORMERS_DIR'] = str(ROOT_PATH / 'rubert_base_cased')
PREDICTOR = NewsNER(ROOT_PATH / 'model' / 'model')
app = Flask(__name__)


def run_model(images: List[PpmImagePlugin.PpmImageFile]
              ) -> List[List[Tuple[int, int, int, int]]]:
    coordinates = []
    for i, image in enumerate(images):
        ocr_result = image_to_data(image, output_type=Output.DICT, lang='rus')
        inputs = [word for word in ocr_result['text'] if word.strip()]
        tags = PREDICTOR.predict(inputs)
        equals = [not tag.endswith('PER') for tag in tags]
        token_counter = 0
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
                    page.append((x, y, x + w, y + h))
                token_counter += 1
        coordinates.append(page)
    return coordinates


@app.route('/')
def index():
    api = '/ -- описание апи<br>' \
          '/api/anonymize -- обезличивание, постовая ручка, принимает запрос с файлом (pdf и все форматы либроффиса)<br>' \
          '/api/list_pdfs -- гетовая ручка, список обезличенных пдфок, без параметров<br>' \
          '/api/load_pdf -- гетовая ручка, два параметра: имя файла (как из ручки выше) и параметр hidden,' \
          '\t если он задан, то отдам пдфку с полностью закрашенными с сущностями, если нет, то наполовину (обе нужны для демо)'
    return api


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
    images = convert_from_path(input_path, dpi=PDFHighlighter.DPI)
    try:
        coordinates = run_model(images)
    except Exception:
        traceback.print_exc()
        abort(500, 'не удалось произвести обезличивание')
    pdf_path = OUTPUT_PATH / f'{datetime.now().timestamp()}_{file.filename}'
    pdf_path.mkdir()
    highlighter = PDFHighlighter(
        input_data=images,
        output_path=pdf_path,
        coordinates=coordinates)
    return jsonify({'filename': highlighter.blurred_pdf.parent.name,
                    'input': input_path.name})


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
