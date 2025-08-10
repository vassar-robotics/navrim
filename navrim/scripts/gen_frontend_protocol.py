import shutil
import subprocess
from pathlib import Path

from navrim.util import get_project_path

pydantic2ts = shutil.which("pydantic2ts")
json2ts = shutil.which("json2ts")


def pydantic_to_typescript(source_path: Path, target_path: Path):
    print(
        " ".join(
            [
                pydantic2ts,
                "--module",
                source_path.as_posix(),
                "--output",
                target_path.as_posix(),
                "--json2ts-cmd",
                json2ts
            ]
        )
    )
    subprocess.run(
        [
            pydantic2ts,
            "--module",
            source_path,
            "--output",
            target_path,
            "--json2ts-cmd",
            json2ts,
        ]
    )


if __name__ == "__main__":
    pydantic_to_typescript(
        get_project_path().parent / "navrim" / "navrim" / "protocol" / "request.py",
        get_project_path().parent / "dashboard" / "src" / "protocol" / "request.ts",
    )
    pydantic_to_typescript(
        get_project_path().parent / "navrim" / "navrim" / "protocol" / "response.py",
        get_project_path().parent / "dashboard" / "src" / "protocol" / "response.ts",
    )
