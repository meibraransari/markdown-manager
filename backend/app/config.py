import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    host: str = "0.0.0.0"
    port: int = 8000
    markdown_root: str = "/workspace"
    log_level: str = "info"
    max_file_size_mb: int = 20
    enable_autosave: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def absolute_markdown_root(self) -> Path:
        return Path(self.markdown_root).resolve()

settings = Settings()
