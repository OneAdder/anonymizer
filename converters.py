from pathlib import Path
from subprocess import run, CompletedProcess
from typing import Union


def anything2pdf(
        input_path: Union[str, Path],
        output_path: Union[str, Path]) -> CompletedProcess:
    """Конвертер для входных данных в разных форматах

    Для работы необходим установленный `LibreOffice`,
    а так же утилита `unoconv`. Поддерживается куча форматов,
    за большей информацией: `unoconv --show`.
    """
    p = run(
        ['unoconv', '--output', str(output_path), str(input_path)],
        capture_output=True,
    )
    if p.returncode:
        raise OSError('Работа unoconv завершилась со следующей ошибкой: '
                      f'{p.stderr.decode("utf-8")}')
    return p
