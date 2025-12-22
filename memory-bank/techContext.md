# Tech-Context: Tigube Homepage

## Technologie-Stack

### Frontend Framework
- **Next.js 15.2.4** - React Meta-Framework
- **React 19** - UI Library
- **TypeScript** - Typsicherheit und bessere DX

### Styling & UI
- **Tailwind CSS** - Utility-First CSS Framework
- **Radix UI** - Unstyled, accessible UI Primitives
- **shadcn/ui** - Wiederverwendbare Komponenten
- **Lucide React** - Icon Library
- **next-themes** - Theme Management

### Entwicklungstools
- **ESLint** - Code Linting
- **Prettier** - Code Formatting (implizit)
- **TypeScript Compiler** - Type Checking

### Package Manager
- **pnpm** - Schneller, effizienter Package Manager
- **npm** - Fallback (package-lock.json vorhanden)

## Abhängigkeiten

### Core Dependencies
```json
{
  "next": "15.2.4",
  "react": "^19",
  "react-dom": "^19",
  "typescript": "^5"
}
```

### UI & Styling
```json
{
  "tailwindcss": "^3.4.1",
  "autoprefixer": "^10.4.20",
  "postcss": "^8",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.454.0",
  "next-themes": "latest"
}
```

### Radix UI Komponenten
- Alle Radix UI Pakete auf "latest"
- Vollständige Komponentenbibliothek verfügbar
- Accessibility-first Ansatz

### Backend & Datenbank
- **Supabase** - PostgreSQL-Datenbank mit MCP-Integration
- **Next.js API Routes** - Server-Side API-Endpoints
- **Webhook-Support** - Externe Service-Integration

## Entwicklungsumgebung

### Lokale Entwicklung
```bash
# Development Server starten
npm run dev
# oder
pnpm dev

# Build für Produktion
npm run build
pnpm build

# Linting
npm run lint
pnpm lint
```

### Ordnerstruktur
```
homepage/
├── app/              # Next.js App Router
├── components/       # React Komponenten
├── lib/             # Utilities
├── hooks/           # Custom React Hooks
├── public/          # Statische Assets
├── styles/          # Globale Styles
└── memory-bank/     # Projektdokumentation
```

## Konfigurationsdateien

### Next.js Konfiguration
- `next.config.mjs` - Next.js Einstellungen
- `tsconfig.json` - TypeScript Konfiguration
- `tailwind.config.ts` - Tailwind CSS Einstellungen
- `postcss.config.mjs` - PostCSS Konfiguration

### Komponenten-Konfiguration
- `components.json` - shadcn/ui Konfiguration
- Custom Farben und Themes definiert

## Deployment

### Vercel Deployment
- Automatisches Deployment bei Git Push
- Preview-Deployments für Pull Requests
- Optimierte Performance durch Vercel Edge Network

### Build-Optimierungen
- Automatische Code-Splitting
- Image Optimization durch Next.js
- Static Site Generation wo möglich

## Performance-Considerations

### Bundle Size
- Tree-shaking für unused Code
- Dynamic Imports für große Komponenten
- Optimierte Radix UI Imports

### Runtime Performance
- React 19 Concurrent Features
- Optimized Re-renders
- Lazy Loading für Images

## Browser-Unterstützung

### Moderne Browser
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Browser
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

## Entwicklungs-Guidelines

### Code Style
- TypeScript strict mode
- Functional Components mit Hooks
- Konsistente Naming Conventions

### Komponenten-Struktur
```tsx
// Imports
import { ... } from "..."

// Types/Interfaces
interface ComponentProps {
  // ...
}

// Component
export function Component({ props }: ComponentProps) {
  // Hooks
  // Event Handlers
  // Render
  return (
    // JSX
  )
}
```

### Styling-Conventions
- Tailwind Classes für Styling
- Responsive Design mit Breakpoint-Prefixes
- Konsistente Spacing und Farben

## Sicherheit

### Content Security Policy
- Next.js Standard-Sicherheitsheader
- Sichere externe Ressourcen

### Data Handling
- Keine sensiblen Daten im Frontend
- Sichere Formular-Übertragung
- Webhook-Secret für zusätzliche Sicherheit (optional)
- RLS (Row Level Security) in Supabase aktiviert
- Validierung auf Client- und Server-Side

### Datenbank-Sicherheit
- RLS-Policies für `contact_requests` Tabelle
- Öffentliche INSERT für Formular-Submission
- Authentifizierte SELECT für Admin-Zugriff
- Service Role für Backend-Operationen

## Monitoring & Analytics

### Performance Monitoring
- Next.js Analytics (optional)
- Core Web Vitals Tracking

### Error Tracking
- Console-basierte Fehlerbehandlung
- Graceful Degradation für UI-Komponenten 