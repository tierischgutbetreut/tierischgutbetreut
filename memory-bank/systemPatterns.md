# System-Patterns: Tigube Homepage

## Architektur-Übersicht

### Next.js App Router Struktur
```
app/
├── layout.tsx          # Root Layout mit Navigation/Footer
├── page.tsx           # Homepage mit allen Sektionen
├── globals.css        # Globale Styles
└── leistungen/
    └── page.tsx       # Detailseite für Services
```

### Komponenten-Architektur
```
components/
├── ui/                # Radix UI Komponenten (shadcn/ui)
├── hero.tsx          # Hero-Sektion
├── services.tsx      # Services-Übersicht
├── about.tsx         # Über uns Sektion
├── testimonials.tsx  # Kundenbewertungen
├── contact.tsx       # Kontaktformular
├── navigation.tsx    # Header Navigation
└── footer.tsx        # Footer
```

## Design-Patterns

### Farbschema
- **Primärfarbe**: Sage (Grün-Töne) - vermittelt Natur und Vertrauen
- **Sekundärfarbe**: Grau-Töne für Text und Akzente
- **Sage-50 bis Sage-900**: Verschiedene Abstufungen für Konsistenz

### Typographie
- **Raleway**: Hauptschrift für Headlines und wichtige Texte
- **Sans-Serif**: Fallback für bessere Lesbarkeit
- Gewichte: 400 (normal), 500 (medium), 700 (bold), 900 (black)

### Layout-Patterns
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Spacing**: Konsistente `py-16 lg:py-24` für Sektionen
- **Grid**: Responsive Grids mit `grid md:grid-cols-2 lg:grid-cols-4`

## Komponenten-Patterns

### Card-Pattern
```tsx
<Card className="border-sage-200 hover:shadow-lg transition-shadow">
  <CardHeader>
    <Icon className="h-12 w-12 text-sage-600" />
    <CardTitle>Titel</CardTitle>
  </CardHeader>
  <CardContent>
    Inhalt
  </CardContent>
</Card>
```

### Button-Pattern
```tsx
// Primär-Button
<Button className="bg-sage-600 hover:bg-sage-700 text-white">
  Hauptaktion
</Button>

// Sekundär-Button
<Button variant="outline" className="border-sage-300 text-sage-700 hover:bg-sage-50">
  Sekundäraktion
</Button>
```

### Trust-Indicator-Pattern
```tsx
<div className="flex items-center gap-2 text-sage-700">
  <Icon className="h-5 w-5 text-sage-600" />
  <span>Vertrauenselement</span>
</div>
```

### Modal-Pattern
```tsx
// Booking Modal mit humorvollem Content
<BookingModal animalType="dog">
  <Button className="bg-sage-600 hover:bg-sage-700">
    Jetzt Kennenlerntermin buchen
  </Button>
</BookingModal>

// Modal Content wird basierend auf animalType angepasst
// - dog: "Wuff! Zeit für ein erstes Beschnuppern"  
// - cat: "Miau! Zeit für eine königliche Audienz"
```

## Responsive Design-Patterns

### Breakpoints
- **Mobile**: Standard (< 768px)
- **Tablet**: `md:` (768px+)
- **Desktop**: `lg:` (1024px+)
- **Large Desktop**: `xl:` (1280px+)

### Grid-Responsivität
```tsx
// Services: 1 → 2 → 4 Spalten
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

// Hero: 1 → 2 Spalten
<div className="grid lg:grid-cols-2 gap-12">

// Stats: 1 → 3 Spalten
<div className="grid md:grid-cols-3 gap-8">
```

## State Management

### Lokaler State
- Komponenten verwenden React hooks für lokalen State
- Keine globale State-Management-Lösung erforderlich
- Form-State wird lokal in Komponenten verwaltet
- Kontaktformular verwendet useState für alle Felder

### Form-State-Pattern
```tsx
const [formData, setFormData] = useState({
  name: "",
  vorname: "",
  email: "",
  // ... weitere Felder
})

// Conditional Fields basierend auf Service-Auswahl
{formData.service === "hundepension" && (
  // Zusätzliche Felder
)}
```

### Theme Management
- `next-themes` für Dark/Light Mode Support
- ThemeProvider im Layout integriert

## Performance-Patterns

### Image Optimization
```tsx
<Image
  src="/images/hero-pets.jpg"
  alt="Beschreibung"
  width={600}
  height={400}
  className="rounded-2xl"
  priority // Für Above-the-fold Images
/>
```

### Code Splitting
- Automatisches Code Splitting durch Next.js
- Komponenten werden lazy geladen
- Route-basiertes Splitting

## SEO-Patterns

### Metadata
```tsx
export const metadata: Metadata = {
  title: "Tierisch Gut Betreut - Liebevolle Tierbetreuung in Moos",
  description: "Professionelle Tierbetreuung für Hunde und Katzen...",
  keywords: "Tierbetreuung Moos, Hundepension, Katzenbetreuung"
}
```

### Strukturierte Daten
- Schema.org Markup für lokale Geschäfte
- Rich Snippets für bessere Suchresultate

## Accessibility-Patterns

### ARIA-Labels
- Semantische HTML-Elemente
- Proper heading hierarchy (h1 → h2 → h3)
- Alt-Texte für alle Bilder

### Keyboard Navigation
- Fokus-Management für interaktive Elemente
- Tab-Navigation funktioniert durchgängig

## API & Backend-Patterns

### Webhook-Integration
```tsx
// API Route: app/api/contact/route.ts
export async function POST(request: NextRequest) {
  // Validierung
  // Webhook-Request vorbereiten
  // Daten an Webhook senden
  // Fehlerbehandlung
}
```

### Formular-Submission
- Client-Side Validierung vor Submit
- Server-Side Validierung in API-Route
- Loading States während Submission
- Success/Error Messages für User-Feedback
- Formular-Reset nach erfolgreichem Submit

### Datenbank-Integration
- Supabase für Datenbank-Operationen
- RLS (Row Level Security) aktiviert
- Policies für öffentliche INSERT und authentifizierte SELECT
- Automatische Timestamps (created_at, updated_at)

## Deployment-Patterns

### Vercel Integration
- Automatisches Deployment bei Git Push
- Preview-Deployments für Branches
- Optimierte Build-Konfiguration

### Environment Variables
- Sichere Konfiguration für API Keys
- Verschiedene Umgebungen (dev, staging, prod)
- `.env.example` für Webhook-Konfiguration vorhanden
- `CONTACT_WEBHOOK_URL` - URL für Webhook-Endpoint
- `CONTACT_WEBHOOK_SECRET` - Optional: Secret für zusätzliche Sicherheit 