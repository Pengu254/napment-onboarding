"""
Application configuration using Pydantic Settings.
"""

from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator
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
    
    # CORS - accepts comma-separated string or list
    CORS_ORIGINS: str = "http://localhost:3001,http://localhost:5173"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS as list."""
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
    
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

