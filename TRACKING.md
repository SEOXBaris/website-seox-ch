# Conversion-Tracking — myonepager.ch

Stand: 2026-05-20

## Übersicht

| System | ID | Zweck |
|---|---|---|
| Google Tag Manager | `GTM-K7P9WXMP` | Container (lädt GA4) |
| Google Analytics 4 | `G-ZXJ8M0WV1P` | Web-Analytics / Reporting |
| Meta Pixel | `376009897763234` | Conversion-Tracking für Meta Ads (Client) |
| Meta Conversions API | Pixel `376009897763234` | Server-seitige Spiegelung (iOS-/Cookie-resistent) |

## Meta-Events

| Event | Auslöser | Pixel (Client) | CAPI (Server) | Wert |
|---|---|---|---|---|
| `PageView` | Jeder Seitenaufruf | ✓ | – | – |
| `InitiateCheckout` | Bestell-Wizard `/bestellen` geöffnet | ✓ | – | – |
| `Lead` | Kontaktformular + jede Bestellung | ✓ | ✓ | – |
| `Purchase` | Bestell-Wizard abgeschickt | ✓ | ✓ | Paket-Total in CHF |

- **Enterprise / «Preis auf Anfrage»**: feuert nur `Lead` (kein `Purchase`, da kein Wert).
- **Deduplizierung**: Pixel und CAPI senden pro Conversion dieselbe `event_id` → Meta zählt nicht doppelt.
- **Match-Qualität**: CAPI sendet gehashte (SHA-256) E-Mail, Telefon, Vor-/Nachname plus `client_ip_address` und `client_user_agent`.

## Wo im Code

| Datei | Inhalt |
|---|---|
| `src/app/layout.tsx` | Pixel-Basiscode + `PageView` (Konstante `META_PIXEL_ID`), GTM, noscript-Fallbacks |
| `src/app/bestellen/Wizard.tsx` | `InitiateCheckout` (Mount), `Lead` + `Purchase` (Submit), `event_id`-Erzeugung, `fbTrack()`-Helper |
| `src/components/sections/PageScript.html` | Kontaktformular: `Lead` bei Erfolg + `fbEventId` im Payload |
| `src/app/api/contact/route.ts` | Conversions API: `sendMetaCapi()` spiegelt `Lead`/`Purchase` server-seitig |

## Conversion-Funnel

Beide Wege landen nach erfolgreichem Submit auf `/danke`:
- **Kontaktformular** (Homepage) → `Lead`
- **Bestell-Wizard** (`/bestellen`) → `Lead` + `Purchase` (mit Wert)

Der Wizard übernimmt Vorauswahl aus dem Konfigurator via
`/bestellen?paket=<slug>&modus=<leasing|einmalig>&addons=<id1,id2>`.

## Secrets / Env

| Variable | Ort | Zweck |
|---|---|---|
| `META_CAPI_TOKEN` | Vercel Production-Env + macOS Keychain (`META_CAPI_TOKEN`) | CAPI-Zugriffstoken (geheim) |

- Pixel-ID ist öffentlich → im Code hardcodiert (kein Env nötig).
- Token neu setzen:
  ```
  security add-generic-password -a "$USER" -s "META_CAPI_TOKEN" -w 'TOKEN' -U
  TOKEN=$(security find-generic-password -s "META_CAPI_TOKEN" -w)
  printf '%s' "$TOKEN" | vercel env add META_CAPI_TOKEN production
  vercel --prod --yes   # Redeploy, damit das neue Env greift
  ```
- **Wichtig**: Env-Änderungen wirken erst nach einem neuen Deployment.
- CAPI ist graceful: ohne `META_CAPI_TOKEN` wird nur der Client-Pixel genutzt, kein Fehler.

## Verifizieren (vor Kampagnenstart)

1. Meta **Events Manager → Datenquellen → Pixel `376009897763234` → «Testereignisse»**
2. `https://www.myonepager.ch` öffnen, Bestell-Wizard durchklicken + abschicken
3. Erwartung: `PageView`, `InitiateCheckout`, `Lead`, `Purchase` — jeweils mit **Browser** (Pixel) **und Server** (CAPI), markiert als «dedupliziert»
4. Reguläre Server-Events erscheinen in der Übersicht innert ~20 Min.

## Kampagnen-Empfehlung

- Start: Optimierungsziel **Lead** (breitestes Signal).
- Ab ~50 Conversions/Woche: auf **Purchase / Wert** umstellen (ROAS-Optimierung).
- **InitiateCheckout** als Custom Audience fürs Retargeting (Wizard-Abbrecher).
