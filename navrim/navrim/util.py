from pathlib import Path


def get_home_app_path() -> Path:
    app_home = Path.home() / ".navrim"
    app_home.mkdir(parents=True, exist_ok=True)
    return app_home
