# click2edit

Tiny React library for inline content editing on small websites.  
Works in local mode (`localStorage`) or global mode (built-in Node server).

## Install

```bash
npm i click2edit
```

## Local mode (v0.1 style)

```tsx
import { editable, EditableProvider, Editable, EditableList } from "click2edit";

editable.init({
  password: "secret123",
  storageKey: "__editable_content__",
});

export function App() {
  return (
    <EditableProvider>
      <h2>
        Cena: <Editable id="pricing.basic" defaultValue="199 zl" />
      </h2>
      <EditableList
        id="pricing.features"
        defaultValue={["SEO", "Hosting", "Support"]}
      />
    </EditableProvider>
  );
}
```

## Global mode (Node backend, no extra packages)

1) Start a tiny server (same project, same install):

```js
// server.mjs
import { createEditableServer } from "click2edit/server";

createEditableServer({
  port: 3001,
  endpoint: "/__editable",
  password: "secret123",
  filePath: "editable-content.json",
  corsOrigin: "*",
}).start();
```

Run:

```bash
node server.mjs
```

2) Point React app to HTTP storage:

```tsx
import {
  editable,
  httpAdapter,
  EditableProvider,
  Editable,
  EditableList,
} from "click2edit";

editable.init({
  password: "secret123",
  storageAdapter: httpAdapter({
    url: "http://localhost:3001/__editable",
    password: "secret123",
  }),
});
```

Now when owner edits content, data is written to `editable-content.json` on server and visible for all visitors.

No extra backend packages are required - Node built-ins only.

## Behavior

- Normal mode: renders plain text/list only
- Edit mode toggle: `Cmd/Ctrl + Shift + E`
- Password prompt when entering edit mode
- Click to edit, blur to save, `Esc` to cancel
- Data stored via selected storage adapter (`localStorage` or HTTP)
- Edit session stored in `sessionStorage`

## Mini demo (local)

```bash
npm install
npm run demo
```

Then open the URL from Vite (usually `http://localhost:5173`).

Demo credentials:
- Shortcut: `Cmd/Ctrl + Shift + E`
- Password: `demo123`

## Vercel demo with `httpAdapter`

This repository includes:
- `demo/` static frontend using `httpAdapter({ url: "/api/editable" })`
- `api/editable.ts` serverless endpoint for global content storage
- `vercel.json` build config for deploying the demo

### Deploy steps

1. Push this repo to GitHub.
2. Import project in Vercel.
3. Add environment variables in Vercel project settings:
   - `EDITABLE_PASSWORD` (example: `demo123`)
   - `BLOB_READ_WRITE_TOKEN` (from Vercel Blob)
4. Deploy.

After deploy, content edited in one browser will be visible for all users (global storage in Vercel Blob).

## Security

Simple by design: password check, no encryption, no users/roles.  
Use only for non-sensitive marketing content.

## Publish

```bash
npm run build
npm publish --access public
```
