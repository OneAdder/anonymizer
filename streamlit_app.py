# streamlit==0.82.0
# pytesseract==0.3.7

import base64
import tempfile

import cv2
import numpy
from allennlp.data.dataset_readers.dataset_utils.span_utils import iob1_tags_to_spans
from fpdf import FPDF

import streamlit as st
import time
import numpy as np
from pdf2image import convert_from_bytes

import pytesseract
from pytesseract import Output

from predictor import NewsNER


@st.cache(allow_output_mutation=True)
def get_predictor():
    return NewsNER("/media/yaroslav/data/models/anonym_dit/collection3_and_137_dit_docs/")


progress_bar = st.sidebar.progress(0)
# status_text = st.sidebar.empty()
# last_rows = np.random.randn(1, 1)
# chart = st.line_chart(last_rows)

file = st.file_uploader('document to anonymize', type='pdf')

# pages = convert_from_bytes(file.read(), 200)

# for i in range(1, 101):
#     new_rows = last_rows[-1, :] + np.random.randn(5, 1).cumsum(axis=0)
#     status_text.text("%i%% Complete" % i)
#     chart.add_rows(new_rows)
#     progress_bar.progress(i)
#     last_rows = new_rows
#     time.sleep(0.05)
#

# Streamlit widgets automatically run the script from top to bottom. Since
# this button is not connected to any other logic, it just causes a plain
# rerun.
format=(595, 841)
if file:
    images = convert_from_bytes(file.read())
    n_steps = 100 // (len(images) * 2)
    pdf = FPDF(unit='pt')
    tempdir = tempfile.mkdtemp()
    predictor = get_predictor()
    result_images = []
    counter = 0
    for i, image in enumerate(images):
        image = cv2.cvtColor(numpy.array(image), cv2.COLOR_RGB2BGR)
        # image = cv2.resize(image, format, interpolation=cv2.INTER_CUBIC)
        ocr_result = pytesseract.image_to_data(image, output_type=Output.DICT, lang='rus')

        counter += n_steps
        progress_bar.progress(n_steps)
        inputs = [word for word in ocr_result['text'] if word.strip()]  # exclude top-level bboxes
        tags = predictor.predict(inputs)
        spans = iob1_tags_to_spans(tags)
        n_extracted_entities = len([span for span in spans if span[0] == 'PER'])
        # print('hello anonymizer')
        counter += n_steps
        progress_bar.progress(n_steps)
        equals = [not tag.endswith('PER') for tag in tags]

        token_counter = 0
        n_boxes = len(ocr_result['level'])
        for i, word in enumerate(ocr_result['text']):
            (x, y, w, h) = (
                ocr_result['left'][i],
                ocr_result['top'][i],
                ocr_result['width'][i],
                ocr_result['height'][i]
            )
            color = 2
            cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), color)
            if word.strip():

                if not equals[token_counter]:
                    color = -1
                    cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), color)

                token_counter += 1
        result_images.append(image)
    captions = [f'anonymized doc page {i}' for i in range(len(result_images))]
    st.image(result_images, caption=captions)
    #     fname = tempdir + f'/page_{i}.jpg'
    #     # pdf.fw = image.shape[1]
    #     # pdf.fh = image.shape[0]
    #     cv2.imwrite(fname, image)
    #     pdf.add_page()
    #     pdf.image(fname, 0, 0, image.shape[1], image.shape[0])
    #     progress_bar.progress(i + 2)
    # pdf.output(tempdir + '/result.pdf', dest='F')
    # with open(tempdir + '/result.pdf', 'rb') as f:
    #     result = f.read()
    # base64_pdf = base64.b64encode(result).decode('utf-8')
    # pdf_display = f'<iframe src="data:application/pdf;base64,{base64_pdf}" width="1000" height="1000" type="application/pdf"></iframe>'

    # st.markdown(pdf_display, unsafe_allow_html=True)
progress_bar.empty()
st.button("Re-run")
