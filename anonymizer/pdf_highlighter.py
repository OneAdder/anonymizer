from copy import deepcopy
from pathlib import Path
from typing import Iterable, List, Mapping, Optional, Tuple, Union
from pdf2image.pdf2image import convert_from_path
from PIL import ImageDraw, PpmImagePlugin


class PDFHighlighter:
    DPI = 200
    BLURRED_COLOUR_MAPPING = {
        'ORG': (255, 0, 0, 64),
        'PER': (0, 255, 0, 64),
        'LOC': (255, 158, 27, 64),
    }
    HIDDEN_COLOUR_MAPPING = {
        'ORG': (0, 0, 0, 255),
        'PER': (0, 0, 0, 255),
        'LOC': (0, 0, 0, 255),
    }
    NULL_COLOUR = (0, 0, 0, 0)

    BLURRED_FILENAME = 'blurred.pdf'
    HIDDEN_FILENAME = 'hidden.pdf'

    def __init__(self,
                 input_data: Union[Path, List[PpmImagePlugin.PpmImageFile]],
                 output_path: Path,
                 coordinates: List[List[
                     Tuple[Tuple[int, int, int, int], str]
                 ]]):
        self._coordinates = coordinates
        self._input_images = convert_from_path(input_data, dpi=self.DPI) \
            if isinstance(input_data, Path) else input_data
        if len(self._coordinates) != len(self._input_images):
            raise ValueError('Количество страниц в PDF не совпадает с '
                             'количеством страниц в поданных координатах')
        self.blurred_images = list(self._highlight(self.BLURRED_COLOUR_MAPPING))
        self.hidden_images = list(self._highlight(self.HIDDEN_COLOUR_MAPPING))
        self.blurred_pdf = output_path / self.BLURRED_FILENAME
        self.to_pdf(self.blurred_images, output_path / self.BLURRED_FILENAME)
        self.hidden_pdf = output_path / self.HIDDEN_FILENAME
        self.to_pdf(self.hidden_images, output_path / self.HIDDEN_FILENAME)

    def _highlight(self,
                   colour_mapping: Mapping[str, Tuple[int, int, int, int]],
                   ) -> Iterable[PpmImagePlugin.PpmImageFile]:
        for page_image, page_coordinates in zip(deepcopy(self._input_images),
                                                self._coordinates):
            canvas = ImageDraw.Draw(page_image, 'RGBA')
            for coordinates, tag in page_coordinates:
                canvas.rectangle(
                    coordinates,
                    fill=colour_mapping.get(tag, self.NULL_COLOUR),
                )
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
