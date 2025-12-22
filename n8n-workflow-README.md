# n8n Workflow: Kontaktformular zu Supabase

Dieser Workflow empfängt Kontaktanfragen vom Next.js Kontaktformular und speichert sie in der Supabase-Datenbank.

## Installation

1. **n8n öffnen** und zu "Workflows" navigieren
2. **"Import from File"** klicken
3. Die Datei `n8n-workflow-contact-to-supabase.json` auswählen
4. Workflow importieren

## Konfiguration

### 1. Webhook-URL abrufen

1. Den Workflow aktivieren
2. Auf den **Webhook-Node** klicken
3. Die **Webhook-URL** kopieren (z.B. `https://your-n8n-instance.com/webhook/contact`)
4. Diese URL in `.env.local` als `CONTACT_WEBHOOK_URL` setzen

### 2. Supabase API Key prüfen

Der Workflow verwendet bereits die Supabase-URL und den API-Key. Falls sich diese ändern:

1. **Supabase Insert Node** öffnen
2. **URL** anpassen: `https://YOUR_PROJECT.supabase.co/rest/v1/contact_requests`
3. **Header** anpassen:
   - `apikey`: Ihr Supabase anon key
   - `Authorization`: `Bearer YOUR_SUPABASE_ANON_KEY`

### 3. Workflow aktivieren

1. Den **Toggle-Switch** oben rechts aktivieren
2. Der Workflow ist jetzt bereit, Anfragen zu empfangen

## Workflow-Struktur

```
Webhook (POST /contact)
  ↓
Validierung (Pflichtfelder prüfen)
  ├─→ [Fehler] → Fehler Antwort (400)
  └─→ [OK] → Daten vorbereiten
              ↓
         Supabase Insert
              ↓
         Fehler prüfen
              ├─→ [OK] → Erfolg Antwort (200)
              └─→ [Fehler] → DB Fehler Antwort (500)
```

## Datenfelder

Der Workflow verarbeitet folgende Felder:

### Basis-Felder
- `name` (Pflichtfeld)
- `vorname` (Optional)
- `email` (Pflichtfeld)
- `phone` (Pflichtfeld)
- `service` (Pflichtfeld)
- `pet` (Optional)
- `message` (Pflichtfeld)
- `availability` (Pflichtfeld)
- `privacy` (Pflichtfeld)

### Hundepension-Felder
- `anzahlTiere` (Optional)
- `tiernamen` (Optional)
- `schulferienBW` (Boolean, Optional)
- `konkreterUrlaub` (Optional: "ja"/"nein")
- `urlaubVon` (Date, Optional)
- `urlaubBis` (Date, Optional)
- `intaktKastriert` (Optional)
- `alter` (Optional)

### Metadaten
- `ip` (Optional)
- `userAgent` (Optional)
- `timestamp` (Optional, wird automatisch gesetzt)

## Testen

### Manueller Test

1. Workflow aktivieren
2. Webhook-URL kopieren
3. Mit einem Tool wie Postman oder curl testen:

```bash
curl -X POST https://your-n8n-instance.com/webhook/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max Mustermann",
    "vorname": "Max",
    "email": "max@example.com",
    "phone": "0123456789",
    "service": "hundepension",
    "message": "Test-Nachricht",
    "availability": "Mo-Fr 18-20 Uhr",
    "privacy": true,
    "anzahlTiere": "1",
    "tiernamen": "Bello",
    "alter": "5",
    "intaktKastriert": "kastriert",
    "konkreterUrlaub": "ja",
    "urlaubVon": "2025-12-15",
    "urlaubBis": "2025-12-22"
  }'
```

### Erwartete Antworten

**Erfolg (200):**
```json
{
  "success": true,
  "message": "Anfrage erfolgreich gespeichert",
  "id": 123
}
```

**Fehler - Pflichtfelder fehlen (400):**
```json
{
  "success": false,
  "error": "Pflichtfelder fehlen"
}
```

**Fehler - Datenbank (500):**
```json
{
  "success": false,
  "error": "Fehler beim Speichern in Datenbank",
  "details": "..."
}
```

## Fehlerbehebung

### Workflow empfängt keine Daten
- Prüfen Sie, ob der Workflow aktiviert ist
- Prüfen Sie die Webhook-URL in `.env.local`
- Prüfen Sie die n8n-Logs für Fehler

### Daten werden nicht gespeichert
- Prüfen Sie die Supabase-URL und API-Keys
- Prüfen Sie die RLS-Policies in Supabase
- Prüfen Sie die n8n-Execution-Logs

### Datumsfelder werden falsch formatiert
- Der Code-Node konvertiert automatisch ISO-Strings zu YYYY-MM-DD
- Prüfen Sie die Eingabedaten im Webhook-Node

## Erweiterungen

Mögliche Erweiterungen:
- **E-Mail-Benachrichtigung** bei neuen Anfragen
- **Slack/Discord-Notification** für wichtige Anfragen
- **Datenbereinigung** vor dem Speichern
- **Duplikat-Prüfung** basierend auf E-Mail
- **Automatische Antwort-E-Mail** an den Kunden

