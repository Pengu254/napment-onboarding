# 🚀 Napment Onboarding

> Verkkokaupan pystytys- ja konfiguraatiotyökalu kauppiaille

## 🎯 Tarkoitus

Napment Onboarding auttaa uusia kauppiaita:
1. Yhdistämään verkkokauppa-alustansa (Shopify, WooCommerce, jne.)
2. Konfiguroimaan AI-assistentin
3. Mukauttamaan brändi-asetukset
4. Käynnistämään Napment-alustan

## 🏗️ Arkkitehtuuri

```
┌─────────────────────────────────────────────────────────────┐
│                    ONBOARDING STACK                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────┐    ┌─────────────────┐               │
│   │   Frontend      │    │    Backend      │               │
│   │   (React)       │◄──►│   (FastAPI)     │               │
│   │   :3001         │    │   :8001         │               │
│   └─────────────────┘    └────────┬────────┘               │
│                                   │                         │
│                          ┌────────▼────────┐               │
│                          │   PostgreSQL    │               │
│                          │   (optional)    │               │
│                          └─────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Projektit

| Komponentti | Kuvaus | Teknologia |
|-------------|--------|------------|
| **Backend** | API ja onboarding-logiikka | Python, FastAPI |
| **Frontend** | Wizard UI | TypeScript, React, Vite |

## 🚀 Käynnistys (Kehitys)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🌐 Tuotanto (Hetzner)

### Ympäristöt

| Ympäristö | Frontend | Backend |
|-----------|----------|---------|
| **Staging** | staging-onboarding.bobbi.live | staging-onboarding-api.bobbi.live |
| **Production** | onboarding.bobbi.live | onboarding-api.bobbi.live |

### Deployment

```bash
# Staging
./deploy.sh staging

# Production
./deploy.sh production
```

## 📋 Ympäristömuuttujat

| Muuttuja | Kuvaus | Pakollinen |
|----------|--------|------------|
| `DATABASE_URL` | PostgreSQL connection string | ❌ |
| `SECRET_KEY` | JWT signing key | ✅ |
| `SHOPIFY_CLIENT_ID` | Shopify OAuth App ID | ✅ |
| `SHOPIFY_CLIENT_SECRET` | Shopify OAuth Secret | ✅ |

## 📄 Lisenssi

Private - All rights reserved

## 👥 Tiimi

Napment Team ❤️

