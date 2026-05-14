# EchoFrame Contextual Deployments

EchoFrame now ships as a static interactive app with one shared runtime and three deployment contexts.

## External

- Entry point: `deployments/external/index.html`
- Audience: public creators
- Behavior: creator-first story, avatar, voice, render, and export manifest workflow
- Storage: browser `localStorage` under `echoframe:external`

## Internal

- Entry point: `deployments/internal/index.html`
- Audience: operators, reviewers, and private deployment users
- Behavior: all creator controls plus queue priority, webhook, consent gate, private source vault, C2PA, watermark, and audit payload controls
- Storage: browser `localStorage` under `echoframe:internal`

## Canvas App

- Entry point: `deployments/canvas-app/index.html`
- Manifest: `deployments/canvas-app/manifest.json`
- Audience: embedded host surfaces
- Behavior: compact layout with story, avatar, render, and host bridge controls
- Storage: browser `localStorage` under `echoframe:canvas`

The Canvas App exposes:

```js
window.EchoFrameCanvasApp.getPayload()
window.EchoFrameCanvasApp.setContext(payload)
```

It also supports `window.postMessage`:

- Inbound: `{ source: "echoframe-host", type: "ECHOF_FRAME_CONTEXT", payload }`
- Outbound: `{ source: "echoframe-canvas-app", type: "ECHOF_FRAME_UPDATE", payload }`
- Outbound: `{ source: "echoframe-canvas-app", type: "ECHOF_FRAME_SAVE", payload }`

## Local Run

```bash
npm run check
npm start
```

The server listens on `PORT`, defaulting to `8080` for Cloud Run. For a local fixed port in PowerShell:

```powershell
$env:PORT = "4173"
node server.cjs
```

In PowerShell environments that block `npm.ps1`, run `npm.cmd run check` and `npm.cmd start`.

Then open:

- `http://localhost:4173/`
- `http://localhost:4173/deployments/external/`
- `http://localhost:4173/deployments/internal/`
- `http://localhost:4173/deployments/canvas-app/`
- `http://localhost:4173/healthz`

## Google Cloud Run

This static frontend is packaged as a dependency-free Node service for Cloud Run. It serves only the app entrypoints, `assets/`, `deployments/`, `contextual-deployments.json`, `/healthz`, `/healthz/`, and `/_healthz`.

On the managed `run.app` domain, Google may answer the exact `/healthz` path before it reaches the container. Use `/healthz/` or `/_healthz` as pass-through health endpoints when verifying the deployed service.

```bash
gcloud config set project interactive-web-apps
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
gcloud run deploy echoframe --source . --region us-central1 --allow-unauthenticated
```

Cloud Run injects `PORT`; `server.cjs` binds `0.0.0.0:$PORT` and is safe to run locally or in the container image.
