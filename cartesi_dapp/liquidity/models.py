"""
Data models for operations
"""
from enum import Enum
from typing import Literal
from uuid import uuid4

from cartesi import abi
from pydantic import BaseModel, Field


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


class DepositERC20Payload(BaseModel):
    success: abi.Bool
    token: abi.Address
    sender: abi.Address
    depositAmount: abi.UInt256
    execLayerData: bytes


class StartTransactionPayload(BaseModel):
    fiat_provider: str
    fiat_amount: float
    payment_details: str
    payment_code: str


class TransactionState(str, Enum):
    outstanding = 'outstanding'
    pending_confirmation = 'pending_confirmation'
    confirmed = 'confirmed'
    rejected = 'rejected'


class Transaction(BaseModel):
    transaction_id: str = Field(default_factory=lambda: str(uuid4()))

    customer_address: str
    fiat_provider: str
    fiat_amount: float
    token_amount: int
    token_address: str
    state: TransactionState = TransactionState.outstanding
    receipt: str = None


class FinishTransactionPayload(BaseModel):
    op: Literal['finish_transaction']
    transaction_id: str
    receipt: str


class FinishedTransactionPayload(BaseModel):
    pass
