"""
In-memoy data store for Liquidity Libs
"""

from . import models

PROVIDERS_BY_ADDR: dict[str, models.FiatProvider] = {}


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
