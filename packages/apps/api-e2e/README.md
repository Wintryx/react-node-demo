# API E2E App (`packages/apps/api-e2e`)

## Zweck

Diese App enthält **End-to-End-Tests** für die Backend-API.
Sie testet das Verhalten der laufenden API über HTTP (Black-Box), nicht nur einzelne Klassen.

Kurz gesagt:

- `api`: implementiert das Backend
- `api-e2e`: testet das Backend gegen echte Endpunkte

## Ausführen

Aus dem Workspace-Root:

```bash
npx nx run api-e2e:e2e
```

Der E2E-Run erwartet standardmäßig die API auf Port `3000`.
Die Test-Setup-Dateien setzen dafür die HTTP-Basisadresse auf `http://localhost:3000`.

## Aktueller Scope

- Smoke-/Health-Test für die API
- Basisstruktur für weitere Endpunkt-Tests (Employees, später Tasks/Auth)
