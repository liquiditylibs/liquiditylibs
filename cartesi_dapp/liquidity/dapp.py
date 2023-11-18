import logging
import json

from cartesi import (
    DApp,
    Rollup,
    RollupData,
    JSONRouter,
    URLRouter,
    URLParameters,
)

# from .config import settings

from . import liquidity_db
from . import models


LOGGER = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)
dapp = DApp()

jsonrouter = JSONRouter()
urlrouter = URLRouter()

dapp.add_router(jsonrouter)
dapp.add_router(urlrouter)


def str2hex(str):
    """Encodes a string as a hex string"""
    return "0x" + str.encode("utf-8").hex()


@jsonrouter.advance(route_dict={'op': 'register_fiat'})
def register_fiat(rollup: Rollup, data: RollupData) -> bool:
    payload = models.RegisterFiatProviderPayload.parse_obj(
        data.json_payload()
    )

    provider = liquidity_db.get_fiat_provider_by_address(
        data.metadata.msg_sender
    )

    if provider is None:
        provider = models.FiatProvider(
            provider_address=data.metadata.msg_sender,
            fiat_currency=payload.fiat_currency,
            available_fiat=payload.available_fiat,
            wanted_cryptos=payload.wanted_cryptos,
        )
    else:
        provider.fiat_currency = payload.fiat_currency
        provider.available_fiat = payload.available_fiat
        provider.wanted_cryptos = payload.wanted_cryptos

    liquidity_db.register_fiat_provider(provider)
    return True


@urlrouter.inspect(path='fiat_providers/{token}')
def list_providers(rollup: Rollup, data: RollupData, params: URLParameters):

    token = params.path_params['token'].upper()

    LOGGER.info('Listing providers for token %s', token)

    out_providers = []

    providers = liquidity_db.list_providers_for_token(token)
    for provider in providers:
        for crypto in provider.wanted_cryptos:
            if crypto.token == token:
                out = models.FiatProviderOutput(
                    provider_address=provider.provider_address,
                    fiat_currency=provider.fiat_currency,
                    fiat_rate=crypto.fiat_rate,
                    available_fiat=provider.available_fiat,
                )
                out_providers.append(out)
                break

    out_providers.sort(key=lambda x: x.fiat_rate)

    # Generate Report
    report_payload = json.dumps([x.dict() for x in out_providers])
    report_payload = '0x' + report_payload.encode('utf-8').hex()
    rollup.report(payload=report_payload)

    return True


if __name__ == '__main__':
    dapp.run()
