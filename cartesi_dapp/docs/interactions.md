# Interactions


## Register Solver (socio)

Person who needs to pay with fiat should register first. Transaction:

Address: DApp address
Sender: 0xfiatprovider1
Function: addInput
Payload:

```
{
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
        ...
    ]
}
```

## List Available Fiat Providers

GET node/inspect/fiat_providers?token=USDT

Response:
- List of all token providers with

Example:
```
[
    {
        "fiat_provider": "0xfiatprovider1"
        "rate": 28.1,
        "available_fiat": 1000.0,
    },
    {
        "fiat_provider": "0xfiatprovider2"
        "rate": 30,
        "available_fiat": 100000.0,
    }
]
```

## Customer initiates the transaction

Address: DApp address
Sender: 0xcustomer1
Function: depositERC20Tokens
Value: desired fiat value / rate, in the selected token
Payload:
```
{
    "op": "start_transaction",

    "fiat_provider": "0xfiatprovider1",
    "fiat_value": "500",
    "payment_details": "pay 500 tl to bank account 12345",
    "payment_code": "{qr code content}",
}
```
Notice: transaction id

## FiatProviders list outstanding transactions

GET node/inspect/transactions/{fiat_provider_address}

Response:

```
{
    "transaction": "transaction id",
    "fiat_provider": "0xfiatprovider1",
    "fiat_value": "500",
    "payment_details": "pay 500 tl to bank account 12345",
    "payment_code": "{qr code content}",
}
```

## FiatProvider submit payment

Transaction:

Address: DApp address
Sender: 0xfiatprovider1
Function: addInput
Payload:

```
{
    "op": "pay",
    "transaction": "transaction_id",
    "proof": "{proof_picture}",
}
```

## Approve Payment


Transaction:

Address: DApp address
Sender: 0xfiatprovider1
Function: addInput
Payload:

```
{
    "op": "approve_payment",
    "transaction": "transaction_id",
}
```
