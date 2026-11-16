from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


class BME280Readings(BaseModel):
    temperature_c: float = Field(..., ge=-40.0, le=85.0)
    humidity_pct: float = Field(..., ge=0.0, le=100.0)
    pressure_hpa: float = Field(..., ge=300.0, le=1100.0)


class SensorReadings(BaseModel):
    bme280: BME280Readings
    mq2_raw: int = Field(..., ge=0, le=1023, description="10-bit raw ADC reading")
    mq7_raw: int = Field(..., ge=0, le=1023, description="10-bit raw ADC reading")
    mq135_raw: int = Field(..., ge=0, le=1023, description="10-bit raw ADC reading")
    ir_state: int = Field(..., ge=0, le=1, description="Digital beam break: 0=clear, 1=broken")
    battery_voltage_v: float = Field(5.0, ge=0.0, le=5.5)


class TelemetryPacket(BaseModel):
    packet_id: str
    session_id: str
    device_id: str
    sequence_number: int
    timestamp: datetime
    source: Literal["simulated"] = "simulated"
    readings: SensorReadings
    simulated_tier: str = "GREEN"
    sim_time_sec: float = 0.0


class WebSocketEvent(BaseModel):
    event_type: str
    session_id: str
    timestamp: datetime
    payload: dict
