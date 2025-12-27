"""
API Routes for Napment Onboarding
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
import secrets
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================================================
# Enums & Models
# ============================================================================

class Platform(str, Enum):
    """Supported e-commerce platforms."""
    SHOPIFY = "shopify"
    WOOCOMMERCE = "woocommerce"
    MAGENTO = "magento"
    CUSTOM = "custom"


class OnboardingStep(str, Enum):
    """Onboarding steps."""
    WELCOME = "welcome"
    PLATFORM_SELECT = "platform_select"
    PLATFORM_CONNECT = "platform_connect"
    BRAND_CONFIG = "brand_config"
    AGENT_CONFIG = "agent_config"
    REVIEW = "review"
    COMPLETE = "complete"


class OnboardingSession(BaseModel):
    """Onboarding session data."""
    session_id: str
    current_step: OnboardingStep = OnboardingStep.WELCOME
    platform: Optional[Platform] = None
    shop_name: Optional[str] = None
    shop_domain: Optional[str] = None
    email: Optional[str] = None
    is_connected: bool = False
    brand_config: Optional[dict] = None
    agent_config: Optional[dict] = None


class CreateSessionRequest(BaseModel):
    """Request to create a new onboarding session."""
    email: Optional[str] = None


class UpdateSessionRequest(BaseModel):
    """Request to update onboarding session."""
    current_step: Optional[OnboardingStep] = None
    platform: Optional[Platform] = None
    shop_name: Optional[str] = None
    shop_domain: Optional[str] = None
    email: Optional[str] = None
    brand_config: Optional[dict] = None
    agent_config: Optional[dict] = None


class ShopifyConnectRequest(BaseModel):
    """Request to initiate Shopify OAuth."""
    shop_domain: str = Field(..., description="Shopify store domain (e.g., mystore.myshopify.com)")


class ShopifyCallbackRequest(BaseModel):
    """Shopify OAuth callback data."""
    code: str
    shop: str
    state: str


# ============================================================================
# In-Memory Session Storage (replace with DB in production)
# ============================================================================

sessions: dict[str, OnboardingSession] = {}


# ============================================================================
# Session Endpoints
# ============================================================================

@router.post("/sessions", response_model=OnboardingSession)
async def create_session(request: CreateSessionRequest):
    """Create a new onboarding session."""
    session_id = secrets.token_urlsafe(16)
    session = OnboardingSession(
        session_id=session_id,
        email=request.email
    )
    sessions[session_id] = session
    logger.info(f"Created onboarding session: {session_id}")
    return session


@router.get("/sessions/{session_id}", response_model=OnboardingSession)
async def get_session(session_id: str):
    """Get onboarding session by ID."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return sessions[session_id]


@router.patch("/sessions/{session_id}", response_model=OnboardingSession)
async def update_session(session_id: str, request: UpdateSessionRequest):
    """Update onboarding session."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    update_data = request.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(session, field, value)
    
    sessions[session_id] = session
    logger.info(f"Updated session {session_id}: {update_data}")
    return session


# ============================================================================
# Platform Connection Endpoints
# ============================================================================

@router.get("/platforms")
async def list_platforms():
    """List available e-commerce platforms."""
    return {
        "platforms": [
            {
                "id": Platform.SHOPIFY,
                "name": "Shopify",
                "description": "Maailman suosituin verkkokauppa-alusta",
                "icon": "shopify",
                "supported": True,
                "features": [
                    "Tuotteiden synkronointi",
                    "Tilausten hallinta",
                    "Asiakastiedot",
                    "Teeman integraatio"
                ]
            },
            {
                "id": Platform.WOOCOMMERCE,
                "name": "WooCommerce",
                "description": "WordPress-pohjainen verkkokauppa",
                "icon": "woocommerce",
                "supported": True,
                "features": [
                    "REST API -integraatio",
                    "Tuotteiden synkronointi",
                    "Tilausten hallinta"
                ]
            },
            {
                "id": Platform.MAGENTO,
                "name": "Magento",
                "description": "Enterprise-tason verkkokauppa",
                "icon": "magento",
                "supported": False,
                "features": ["Tulossa pian..."]
            },
            {
                "id": Platform.CUSTOM,
                "name": "Oma alusta",
                "description": "Räätälöity API-integraatio",
                "icon": "code",
                "supported": True,
                "features": [
                    "REST API",
                    "GraphQL",
                    "Webhook-tuki"
                ]
            }
        ]
    }


@router.post("/platforms/shopify/auth-url")
async def get_shopify_auth_url(request: ShopifyConnectRequest, session_id: str = Query(...)):
    """Generate Shopify OAuth authorization URL."""
    from src.config import settings
    
    if not settings.SHOPIFY_CLIENT_ID:
        raise HTTPException(
            status_code=500, 
            detail="Shopify OAuth not configured"
        )
    
    # Generate state token for CSRF protection
    state = secrets.token_urlsafe(32)
    
    # Store state in session
    if session_id in sessions:
        sessions[session_id].shop_domain = request.shop_domain
    
    # Build OAuth URL
    shop = request.shop_domain.replace("https://", "").replace("http://", "")
    if not shop.endswith(".myshopify.com"):
        shop = f"{shop}.myshopify.com"
    
    redirect_uri = f"{settings.NAPMENT_API_URL}/api/v1/platforms/shopify/callback"
    
    auth_url = (
        f"https://{shop}/admin/oauth/authorize"
        f"?client_id={settings.SHOPIFY_CLIENT_ID}"
        f"&scope={settings.SHOPIFY_SCOPES}"
        f"&redirect_uri={redirect_uri}"
        f"&state={state}"
    )
    
    return {
        "auth_url": auth_url,
        "state": state,
        "shop": shop
    }


@router.get("/platforms/shopify/callback")
async def shopify_oauth_callback(
    code: str = Query(...),
    shop: str = Query(...),
    state: str = Query(...)
):
    """Handle Shopify OAuth callback."""
    # In production, verify state token and exchange code for access token
    logger.info(f"Shopify OAuth callback received for shop: {shop}")
    
    return {
        "status": "success",
        "message": "Shopify connected successfully",
        "shop": shop
    }


# ============================================================================
# Configuration Endpoints
# ============================================================================

@router.get("/config/brand-templates")
async def get_brand_templates():
    """Get available brand configuration templates."""
    return {
        "templates": [
            {
                "id": "modern-dark",
                "name": "Moderni tumma",
                "description": "Tyylikäs tumma teema",
                "colors": {
                    "primary": "#8B5CF6",
                    "secondary": "#EC4899",
                    "background": "#0F0F0F",
                    "surface": "#1A1A1A"
                }
            },
            {
                "id": "clean-light",
                "name": "Puhdas vaalea",
                "description": "Minimalistinen vaalea teema",
                "colors": {
                    "primary": "#2563EB",
                    "secondary": "#10B981",
                    "background": "#FFFFFF",
                    "surface": "#F3F4F6"
                }
            },
            {
                "id": "elegant-luxury",
                "name": "Elegantti luksus",
                "description": "Ylellinen kulta-musta teema",
                "colors": {
                    "primary": "#D4AF37",
                    "secondary": "#C0C0C0",
                    "background": "#0A0A0A",
                    "surface": "#1F1F1F"
                }
            }
        ]
    }


@router.get("/config/agent-personas")
async def get_agent_personas():
    """Get available AI agent personas."""
    return {
        "personas": [
            {
                "id": "friendly-helper",
                "name": "Ystävällinen avustaja",
                "description": "Lämmin ja avulias tyyli",
                "traits": ["Ystävällinen", "Kärsivällinen", "Kannustava"],
                "example": "Hei! Miten voin auttaa sinua löytämään täydellisen tuotteen? 😊"
            },
            {
                "id": "professional-expert",
                "name": "Ammattilainen",
                "description": "Asiantunteva ja tehokas",
                "traits": ["Asiantunteva", "Tehokas", "Asiallinen"],
                "example": "Tervetuloa! Kerro mitä etsit, niin löydän sinulle parhaat vaihtoehdot."
            },
            {
                "id": "casual-buddy",
                "name": "Rento kaveri",
                "description": "Rento ja humoristinen tyyli",
                "traits": ["Rento", "Humoristinen", "Helposti lähestyttävä"],
                "example": "Moro! Mitäs täältä tänään lähetään hakemaan? 🛒"
            }
        ]
    }


# ============================================================================
# Deployment Endpoints
# ============================================================================

@router.post("/deploy/{session_id}")
async def deploy_configuration(session_id: str):
    """Deploy the onboarding configuration to Napment platform."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    
    if not session.is_connected:
        raise HTTPException(
            status_code=400, 
            detail="Platform not connected. Complete connection first."
        )
    
    # In production, this would:
    # 1. Create/update merchant account in Napment
    # 2. Configure Agent Core with brand settings
    # 3. Deploy storefront with configurations
    # 4. Return access credentials
    
    logger.info(f"Deploying configuration for session {session_id}")
    
    return {
        "status": "deployed",
        "session_id": session_id,
        "shop": session.shop_name,
        "urls": {
            "storefront": f"https://{session.shop_domain.replace('.myshopify.com', '')}.bobbi.live",
            "admin": f"https://admin.bobbi.live/{session_id}",
            "api": f"https://api.bobbi.live"
        },
        "next_steps": [
            "Lisää Napment-widget Shopify-teemaasi",
            "Testaa AI-assistenttia storefrontissa",
            "Seuraa analytiikkaa admin-paneelista"
        ]
    }

