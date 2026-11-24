import hmac
import logging
import sys
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Header, HTTPException, status
from app.core.config import settings

logger = logging.getLogger(__name__)

# Ensure repository root is on sys.path so simulator_worker can be cleanly imported
repo_root = Path(__file__).resolve().parents[4]
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from simulator_worker import run_one_cycle

router = APIRouter(prefix="/internal", tags=["Internal"])


@router.post("/tick")
async def trigger_internal_tick(x_tick_token: Optional[str] = Header(None, alias="X-Tick-Token")):
    """
    Protected scheduler tick endpoint:
    - Performs exactly ONE simulation cycle for simulated nodes N01-N05.
    - Requires X-Tick-Token header matching TICK_TOKEN env var (constant-time compare).
    - Returns 401 Unauthorized if missing or invalid. Never logs the token.
    - Protected by concurrency lock and minute alignment; returns status: "skipped" on repeated call in same minute.
    """
    expected_token = (settings.TICK_TOKEN or "").strip()

    # Reject if no token configured or header missing
    if not expected_token or not x_tick_token:
        logger.warning("Internal tick rejected: missing X-Tick-Token header or server TICK_TOKEN not configured")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing tick token"
        )

    # Constant-time comparison to prevent timing side-channel attacks. NEVER log the token value.
    if not hmac.compare_digest(x_tick_token.strip().encode("utf-8"), expected_token.encode("utf-8")):
        logger.warning("Internal tick rejected: token verification failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing tick token"
        )

    try:
        logger.info("Internal tick authentication successful; executing simulation cycle")
        result = run_one_cycle()
        return result
    except ValueError as ve:
        logger.error("Configuration error in simulation cycle: %s", ve)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(ve)
        )
    except Exception as exc:
        logger.error("Unexpected error in simulation cycle: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Simulation tick execution failed"
        )
