from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json


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
    NODE_ID: str = "N03"
    SITE_ID: str = "S03"
    ZONE_ID: str = "B"
    POPULATION_DEVICE_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
