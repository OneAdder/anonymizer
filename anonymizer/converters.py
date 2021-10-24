from pathlib import Path
from subprocess import run, CompletedProcess
from typing import Optional


def anything2pdf(
        input_path: Path,
        output_path: Path) -> Optional[CompletedProcess]:
    """Конвертер для входных данных в разных форматах

    Для работы необходим установленный `LibreOffice`,
    а так же утилита `unoserver` (должна быть запущена). Поддерживается куча форматов,
    за большей информацией: `unoconv --show`.
    Если поданный файл и так пдфка, она просто скопируется.
    """
    if input_path.suffix == '.pdf':
        output_path.write_bytes(input_path.read_bytes())
        return
    p = run(
        ['unoconvert', str(input_path), str(output_path)],
        capture_output=True,
    )
    if p.returncode:
        raise OSError('Работа unoconvert завершилась со следующей ошибкой: '
                      f'{p.stderr.decode("utf-8")}')
    return p
