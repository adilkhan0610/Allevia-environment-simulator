from typing import List, Union
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json
import os


class Settings(BaseSettings):
    APP_NAME: str = "ALLEVIA Environment Simulator"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # Allowed CORS Origins
    ALLOWED_ORIGINS: Union[List[str], str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    
    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            try:
                return json.loads(v)
            except Exception:
                return ["http://localhost:5173", "http://127.0.0.1:5173"]
        elif isinstance(v, list):
            return v
        return ["http://localhost:5173", "http://127.0.0.1:5173"]

    SIMULATOR_SECRET: str = "local-dev-simulator-secret-key-32-chars-min"
    SESSION_TTL_MINUTES: int = 60
    DEFAULT_DEVICE_ID: str = "ALLEVIA-SIM-001"
    TELEMETRY_SOURCE: str = "simulated"

    # Population Backend Integration
    POPULATION_BACKEND_INTEGRATION_ENABLED: bool = True
    POPULATION_API_BASE_URL: str = "http://localhost:8000"
    NODE_ID: str = "N02"
    SITE_ID: str = "S03"
    ZONE_ID: str = "B"
    POPULATION_DEVICE_KEY: str = ""

    # Scheduler Protected Tick Token
    TICK_TOKEN: str = ""

    @model_validator(mode="after")
    def validate_production_config(self) -> "Settings":
        # Resolve POPULATION_API_BASE if POPULATION_API_BASE_URL wasn't explicitly given
        alt_base = os.environ.get("POPULATION_API_BASE")
        if alt_base and self.POPULATION_API_BASE_URL == "http://localhost:8000":
            self.POPULATION_API_BASE_URL = alt_base

        if self.APP_ENV.lower() == "production":
            if (
                not self.POPULATION_API_BASE_URL
                or "localhost" in self.POPULATION_API_BASE_URL
                or "127.0.0.1" in self.POPULATION_API_BASE_URL
            ):
                raise ValueError(
                    "Production configuration error: POPULATION_API_BASE_URL / POPULATION_API_BASE "
                    "cannot default to localhost in production mode."
                )
            if not self.POPULATION_DEVICE_KEY:
                raise ValueError(
                    "Production configuration error: POPULATION_DEVICE_KEY must be set in production mode."
                )
        return self

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
