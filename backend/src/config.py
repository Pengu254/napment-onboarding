"""
Application configuration using Pydantic Settings.
"""

from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8001
    SECRET_KEY: str = "change-me-in-production"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
    ]
    
    # Database (optional - can use in-memory for simple setups)
    DATABASE_URL: str = ""
    
    # Shopify OAuth
    SHOPIFY_CLIENT_ID: str = ""
    SHOPIFY_CLIENT_SECRET: str = ""
    SHOPIFY_SCOPES: str = "read_products,read_orders,read_customers"
    
    # WooCommerce (for future)
    WOOCOMMERCE_CLIENT_ID: str = ""
    WOOCOMMERCE_CLIENT_SECRET: str = ""
    
    # Napment Platform Integration
    NAPMENT_API_URL: str = "https://api.bobbi.live"
    NAPMENT_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()

