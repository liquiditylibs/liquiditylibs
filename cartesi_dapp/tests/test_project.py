from math import floor
import pytest
import json

from cartesi import abi
from cartesi.testclient import TestClient

from liquidity.dapp import dapp
from liquidity import models

from liquidity.config import settings


CUSTOMER_ADDRESS = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8"
PROVIDER_1_ADDRESS = "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"
PROVIDER_2_ADDRESS = "0x90f79bf6eb2c4f870365e785982e1f101e93b906"

USDC_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"


ETH_unit = int(1e18)
USDC_unit = int(1e6)


@pytest.fixture(scope='session')
def dapp_client() -> TestClient:
    client = TestClient(dapp)
    return client


@pytest.fixture
def register_fiat_provider_payload() -> str:
    """Generate a project creation payload"""

    payload_data = {
        "op": "register_fiat",

        "fiat_currency": "TL",
        "available_fiat": 1000.0,

        "wanted_cryptos": [
            {
                "token": "USDT",
                "address": "0x123123123",
                "fiat_rate": 28.1,
            },
            {
                "token": "USDC",
                "address": "0x123123123",
                "fiat_rate": 29.1,
            },
        ]
    }
    payload = '0x' + json.dumps(payload_data).encode('ascii').hex()
    return payload


def test_should_register_fiat_provider(
    dapp_client: TestClient,
    register_fiat_provider_payload: str
):
    dapp_client.send_advance(
        hex_payload=register_fiat_provider_payload,
        msg_sender=PROVIDER_1_ADDRESS
    )

    assert dapp_client.rollup.status


@pytest.mark.order(after='test_should_register_fiat_provider')
def test_should_list_projects_for_usdc(dapp_client: TestClient):
    path = 'fiat_providers/USDC'
    inspect_payload = '0x' + path.encode('ascii').hex()
    dapp_client.send_inspect(hex_payload=inspect_payload)

    assert dapp_client.rollup.status

    report = dapp_client.rollup.reports[-1]['data']['payload']
    report = bytes.fromhex(report[2:])
    report = json.loads(report.decode('utf-8'))

    assert isinstance(report, list)
    p0 = report[0]
    assert isinstance(p0, dict)
    assert p0['provider_address'] == PROVIDER_1_ADDRESS
    assert p0['fiat_rate'] == 29.1


@pytest.fixture
def start_transaction_payload() -> str:

    start_trans_data = {
        "fiat_provider": PROVIDER_1_ADDRESS,
        "fiat_amount": "500",
        "payment_details": "pay 500 tl to bank account 12345",
        "payment_code": "{qr code content}",
    }

    start_trans_bytes = json.dumps(start_trans_data).encode('utf-8')

    amount = int((floor(1000*500/29.1)/1000) * USDC_unit)

    deposit = models.DepositERC20Payload(
        success=True,
        token=USDC_ADDRESS,
        sender=CUSTOMER_ADDRESS,
        depositAmount=amount,
        execLayerData=start_trans_bytes,
    )

    payload = abi.encode_model(deposit, packed=True)
    return '0x' + payload.hex()


@pytest.mark.order(after='test_should_list_projects_for_usdc')
def test_should_start_transaction(
    dapp_client: TestClient,
    start_transaction_payload,
):
    dapp_client.send_advance(
        hex_payload=start_transaction_payload,
        msg_sender=settings.ERC20_PORTAL_ADDRESS,
    )

    assert dapp_client.rollup.status

    notice = dapp_client.rollup.notices[-1]['data']['payload']
    notice = bytes.fromhex(notice[2:])
    notice = json.loads(notice.decode('utf-8'))
    assert 'transaction_id' in notice


@pytest.mark.order(after='test_should_start_transaction')
def test_should_list_transactions_1(dapp_client: TestClient):

    path = f'fiat_provider/{PROVIDER_1_ADDRESS}'
    inspect_payload = '0x' + path.encode('ascii').hex()
    dapp_client.send_inspect(hex_payload=inspect_payload)

    assert dapp_client.rollup.status

    report = dapp_client.rollup.reports[-1]['data']['payload']
    report = bytes.fromhex(report[2:])
    report = json.loads(report.decode('utf-8'))

    assert isinstance(report, list)
    assert len(report) == 1
    assert report[0]['state'] == 'outstanding'


def finish_transaction_payload(transaction_id: str) -> str:
    payload_data = {
        'op': 'finish_transaction',
        'transaction_id': transaction_id,
        'receipt': '<base64 encoded data of receipt photo>',
    }

    payload = '0x' + json.dumps(payload_data).encode('ascii').hex()
    return payload


def confirm_transaction_payload(transaction_id: str) -> str:
    payload_data = {
        'op': 'confirm_transaction',
        'transaction_id': transaction_id,
    }

    payload = '0x' + json.dumps(payload_data).encode('ascii').hex()
    return payload


@pytest.mark.order(after='test_should_start_transaction')
def test_should_finish_transaction(dapp_client: TestClient):

    # Get transaction id
    path = f'fiat_provider/{PROVIDER_1_ADDRESS}'
    inspect_payload = '0x' + path.encode('ascii').hex()
    dapp_client.send_inspect(hex_payload=inspect_payload)

    assert dapp_client.rollup.status

    report = dapp_client.rollup.reports[-1]['data']['payload']
    report = bytes.fromhex(report[2:])
    transaction = json.loads(report.decode('utf-8'))[0]

    assert 'transaction_id' in transaction
    assert transaction['state'] == 'outstanding'

    payload = finish_transaction_payload(transaction['transaction_id'])

    # Send the finalization
    dapp_client.send_advance(
        hex_payload=payload,
        msg_sender=PROVIDER_1_ADDRESS,
    )

    assert dapp_client.rollup.status


@pytest.mark.order(after='test_should_finish_transaction')
def test_should_confirm_transaction(dapp_client: TestClient):

    # Get transaction id
    path = f'fiat_provider/{PROVIDER_1_ADDRESS}'
    inspect_payload = '0x' + path.encode('ascii').hex()
    dapp_client.send_inspect(hex_payload=inspect_payload)

    assert dapp_client.rollup.status

    report = dapp_client.rollup.reports[-1]['data']['payload']
    report = bytes.fromhex(report[2:])
    transaction = json.loads(report.decode('utf-8'))[0]

    assert 'transaction_id' in transaction
    assert transaction['state'] == 'pending_confirmation'

    payload = confirm_transaction_payload(transaction['transaction_id'])

    # Send the finalization
    dapp_client.send_advance(
        hex_payload=payload,
        msg_sender=CUSTOMER_ADDRESS,
    )

    assert dapp_client.rollup.status

    voucher = dapp_client.rollup.vouchers[-1]['data']['payload']
    assert voucher
