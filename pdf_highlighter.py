from copy import deepcopy
from pathlib import Path
from typing import Iterable, List, Optional, Tuple
from pdf2image.pdf2image import convert_from_path
from PIL import ImageDraw, PpmImagePlugin


class PDFHighlighter:
    DPI = 300
    BLURRED_COLOUR = (0, 255, 0, 64)
    HIDDEN_COLOUR = (0, 0, 0, 255)

    _BLURRED_FILENAME = 'blurred.pdf'
    _HIDDEN_FILENAME = 'hidden.pdf'

    def __init__(self,
                 input_path: Path,
                 output_path: Path,
                 coordinates: List[List[Tuple[int, int, int, int]]]):
        self._coordinates = coordinates
        self._input_images = convert_from_path(input_path, dpi=self.DPI)
        if len(self._coordinates) != len(self._input_images):
            raise ValueError('Количество страниц в PDF не совпадает с '
                             'количеством страниц в поданных координатах')
        self.blurred_images = list(self._highlight(self.BLURRED_COLOUR))
        self.hidden_images = list(self._highlight(self.HIDDEN_COLOUR))
        self.blurred_pdf = self.to_pdf(self.blurred_images,
                                       output_path / self._BLURRED_FILENAME)
        self.hidden_pdf = self.to_pdf(self.hidden_images,
                                      output_path / self._HIDDEN_FILENAME)

    def _highlight(self, colour: Tuple[int, int, int, int],
                   ) -> Iterable[PpmImagePlugin.PpmImageFile]:
        for page_image, page_coordinates in zip(deepcopy(self._input_images),
                                                self._coordinates):
            canvas = ImageDraw.Draw(page_image, 'RGBA')
            for coordinates in page_coordinates:
                canvas.rectangle(coordinates, fill=colour)
            yield page_image

    @staticmethod
    def to_pdf(images: List[PpmImagePlugin.PpmImageFile],
               output_path: Path) -> Optional[Path]:
        if not images:
            return
        first_image = images[0]
        other_images = images[1:]
        first_image.save(
            output_path, "PDF", resolution=PDFHighlighter.DPI,
            save_all=True, append_images=other_images)