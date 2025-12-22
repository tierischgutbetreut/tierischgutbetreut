# Tierbetreuung webdesign

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/tigubes-projects/v0-tierbetreuung-webdesign)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/nsJHaZ0ySzW)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/tigubes-projects/v0-tierbetreuung-webdesign](https://vercel.com/tigubes-projects/v0-tierbetreuung-webdesign)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/nsJHaZ0ySzW](https://v0.dev/chat/projects/nsJHaZ0ySzW)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Umgebungsvariablen

### Erforderlich

| Variable | Beschreibung |
|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key |
| `RESEND_API_KEY` | Resend API-Schlüssel für E-Mails |

### Google Places API (Optional)

Für die Integration von Google Bewertungen:

| Variable | Beschreibung |
|----------|--------------|
| `GOOGLE_PLACES_API_KEY` | Google Cloud API-Schlüssel |
| `GOOGLE_PLACE_ID` | Place ID des Geschäfts |

#### Setup Google Places API

1. **Google Cloud Console** öffnen: https://console.cloud.google.com/
2. **Projekt erstellen** oder bestehendes auswählen
3. **Places API aktivieren** unter APIs & Dienste > Bibliothek
4. **API-Schlüssel erstellen** unter APIs & Dienste > Anmeldedaten
5. **Schlüssel einschränken** (empfohlen):
   - Anwendungseinschränkungen: HTTP-Referrer oder Server-IP
   - API-Einschränkungen: Nur "Places API"

#### Place ID finden

- **Place ID Finder**: https://developers.google.com/maps/documentation/places/web-service/place-id
- **Google Maps**: Geschäft suchen, in der URL nach dem Teil `!1s` suchen

#### Kosten

- Google bietet **200$/Monat Freikontingent**
- Place Details Request: **$0.017 pro Anfrage**
- Mit 1h-Caching: ca. 720 Anfragen/Monat = ~**$12/Monat**