import os
from datetime import datetime
from pathlib import Path
from flask import abort, jsonify, request, send_file, Flask
from pdf2image import convert_from_path
from pytesseract import image_to_data, Output

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


@app.route('/')
def sdf():
    return 'Артём, привет'


@app.route('/anonymize', methods=['POST'])
def anonymize():
    if 'file' not in request.files:
        abort(400, 'Поля `file` нет в реквесте')
    file = request.files['file']
    input_path = INPUT_PATH / f'{datetime.now().timestamp()}_{file.filename}'
    file.save(input_path)
    images = convert_from_path(input_path, dpi=PDFHighlighter.DPI)
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
    highlighter = PDFHighlighter(input_data=images, output_path=OUTPUT_PATH, coordinates=coordinates)
    return jsonify({'blurred': str(highlighter.blurred_pdf),
                    'hidden': str(highlighter.hidden_pdf),
                    })


@app.route('/load_pdf', methods=['GET'])
def load_pdf():
    filename = request.args.get('name')
    if not filename:
        abort(405, 'В запросе не подано имя файла ("name")')
    file_path = OUTPUT_PATH / filename
    if not file_path.exists():
        abort(404, f'Нет такого файла {filename}')
    return send_file(file_path)


@app.route('/list_pdf', methods=['GET'])
def list_pdf():
    return jsonify(os.listdir(OUTPUT_PATH))


if __name__ == '__main__':
    app.run(port=8080)
