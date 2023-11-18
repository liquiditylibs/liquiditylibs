import pytest
import json

from cartesi.testclient import TestClient

from liquidity.dapp import dapp

# from liquidity.config import settings


CUSTOMER_ADDRESS = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8"
PROVIDER_1_ADDRESS = "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"
PROVIDER_2_ADDRESS = "0x90f79bf6eb2c4f870365e785982e1f101e93b906"


ETH_unit = int(1e18)
USDC_unit = int(1e6)


@pytest.fixture(scope='session')
def dapp_client() -> TestClient:
    client = TestClient(dapp)
    return client


@pytest.fixture
def project_register_fiat_provider_payload() -> str:
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
    project_register_fiat_provider_payload: str
):
    dapp_client.send_advance(
        hex_payload=project_register_fiat_provider_payload,
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
