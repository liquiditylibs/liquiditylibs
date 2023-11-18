"""
Data models for operations
"""
from typing import Literal

from pydantic import BaseModel


class WantedCrypto(BaseModel):
    token: str
    address: str
    fiat_rate: float


class RegisterFiatProviderPayload(BaseModel):
    """Payload for register_fiat_provider"""
    op: Literal['register_fiat']
    fiat_currency: str
    available_fiat: float
    wanted_cryptos: list[WantedCrypto]


class FiatProvider(BaseModel):
    provider_address: str
    fiat_currency: str
    available_fiat: float
    wanted_cryptos: list[WantedCrypto]


class FiatProviderOutput(BaseModel):
    provider_address: str
    fiat_currency: str
    fiat_rate: float
    available_fiat: float
