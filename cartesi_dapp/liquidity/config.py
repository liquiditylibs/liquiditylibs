from pydantic import BaseSettings


class Settings(BaseSettings):
    ERC20_PORTAL_ADDRESS: str = '0x9c21aeb2093c32ddbc53eef24b873bdcd1ada1db'
    RELAY_ADDRESS: str = '0xf5de34d6bbc0446e2a45719e718efebaae179dae'


settings = Settings()
