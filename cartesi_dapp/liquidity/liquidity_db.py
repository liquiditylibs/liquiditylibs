"""
In-memoy data store for Liquidity Libs
"""

from . import models

PROVIDERS_BY_ADDR: dict[str, models.FiatProvider] = {}
TRANSACTIONS: dict[str, models.Transaction] = {}


def get_fiat_provider_by_address(address: str) -> models.FiatProvider | None:
    address = address.lower()
    return PROVIDERS_BY_ADDR.get(address)


def register_fiat_provider(provider: models.FiatProvider):
    PROVIDERS_BY_ADDR[provider.provider_address] = provider


def list_providers_for_token(token: str) -> list[models.FiatProvider]:
    token = token.upper()

    results = []

    for provider in PROVIDERS_BY_ADDR.values():
        for crypto in provider.wanted_cryptos:
            if crypto.token == token:
                results.append(provider)
                break
    return results


def create_transaction(
    customer_address: str,
    fiat_provider_address: str,
    fiat_amount: float,
    token_amount: int,
    token_address: str,
):
    trans = models.Transaction(
        customer_address=customer_address,
        fiat_provider=fiat_provider_address,
        fiat_amount=fiat_amount,
        token_amount=token_amount,
        token_address=token_address
    )
    TRANSACTIONS[trans.transaction_id] = trans
    return trans


def list_transactions_for_provider(fiat_provider: str):
    fiat_provider = fiat_provider.lower()
    resp = []

    for trans in TRANSACTIONS.values():
        if trans.fiat_provider == fiat_provider:
            resp.append(trans)

    return resp


def get_transaction(transaction_id: str) -> models.Transaction | None:
    return TRANSACTIONS.get(transaction_id)
