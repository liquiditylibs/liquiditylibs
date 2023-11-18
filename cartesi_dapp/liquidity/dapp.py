import logging
import json

from cartesi import (
    abi,
    DApp,
    Rollup,
    RollupData,
    JSONRouter,
    ABIRouter,
    URLRouter,
    URLParameters,
)

from .config import settings

from . import liquidity_db
from . import models


LOGGER = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)
dapp = DApp()

abirouter = ABIRouter()
jsonrouter = JSONRouter()
urlrouter = URLRouter()

dapp.add_router(abirouter)
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


@abirouter.advance(msg_sender=settings.ERC20_PORTAL_ADDRESS)
def deposit_erc20(rollup: Rollup, data: RollupData) -> bool:

    # Decode data (this should be done by the framework in the future)
    payload = data.bytes_payload()
    LOGGER.debug("Deposit ERC20 Payload: %s", payload.hex())

    deposit: models.DepositERC20Payload = abi.decode_to_model(
        data=payload,
        model=models.DepositERC20Payload,
        packed=True
    )

    try:
        start_trans_data = deposit.execLayerData.decode('utf-8')
        start_trans = models.StartTransactionPayload.parse_obj(
            json.loads(start_trans_data)
        )
    except Exception:
        LOGGER.error("Error parsing StartTransactionPayload", exc_info=True)
        # TODO: voucher to return the value
        raise

    LOGGER.info(repr(start_trans))

    # Register transaction
    trans = liquidity_db.create_transaction(
        customer_address=deposit.sender,
        fiat_provider_address=start_trans.fiat_provider,
        fiat_amount=start_trans.fiat_amount,
        token_amount=deposit.depositAmount,
        token_address=deposit.token,
    )

    resp = {
        'transaction_id': trans.transaction_id,
    }

    resp_payload = str2hex(json.dumps(resp))
    rollup.notice(payload=resp_payload)
    return True


if __name__ == '__main__':
    dapp.run()
