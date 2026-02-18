# click2edit

Lightweight inline content editing for small websites:
- `click2edit` -> framework-agnostic vanilla core
- `click2edit/react` -> optional React adapter
- `click2edit/server` -> tiny Node server for global persistence (optional)

No admin panel. No CMS requirement. Pluggable storage.

## Install

```bash
npm i click2edit
```

## What You Get

- Click-to-edit text and list fields
- Edit mode protected by password (server-side auth supported)
- Keyboard toggle: `Cmd/Ctrl + Shift + E`
- Save on blur, cancel with `Esc`
- Storage adapters:
  - local (`localStorage`)
  - HTTP API
  - Vercel API route helper
  - custom adapter

## Core API (Vanilla / Any JS Stack)

```ts
import { editable, vercelAdapter, vercelPasswordAuth } from "click2edit";

editable.init({
  authorize: vercelPasswordAuth({ endpoint: "/api/editable" }),
  sessionKey: "__editable_session__",
  storageAdapter: vercelAdapter({
    endpoint: "/api/editable",
  }),
});

const unmount = editable.mount(document);
// unmount() when needed
```

### Vanilla Markup

```html
<h2 data-editable="pricing.basic" data-editable-default="199 zl">199 zl</h2>

<p
  data-editable="hero.description"
  data-editable-default="Fast edits without CMS"
  data-editable-multiline="true"
>
  Fast edits without CMS
</p>

<ul data-editable-list="pricing.features" data-editable-default="SEO|Hosting|Support">
  <li>SEO</li>
  <li>Hosting</li>
  <li>Support</li>
</ul>
```

## React Adapter

```tsx
import { editable, vercelAdapter, vercelPasswordAuth } from "click2edit";
import { EditableProvider, Editable, EditableList } from "click2edit/react";

editable.init({
  authorize: vercelPasswordAuth({ endpoint: "/api/editable" }),
  storageAdapter: vercelAdapter({
    endpoint: "/api/editable",
  }),
});

export function App() {
  return (
    <EditableProvider>
      <Editable id="pricing.basic" defaultValue="199 zl" />
      <Editable
        id="hero.description"
        defaultValue="Fast edits without CMS"
        multiline
      />
      <EditableList
        id="pricing.features"
        defaultValue={["SEO", "Hosting", "Support"]}
      />
    </EditableProvider>
  );
}
```

## Storage Adapters

```ts
import {
  localStorageAdapter,
  httpAdapter,
  vercelAdapter,
  httpPasswordAuth,
  vercelPasswordAuth,
  type StorageAdapter,
} from "click2edit";

const local = localStorageAdapter("__editable_content__");
const http = httpAdapter({ url: "https://example.com/api/editable", password: "secret123" });
const vercel = vercelAdapter({ endpoint: "/api/editable" });
const auth = httpPasswordAuth({ url: "https://example.com/api/editable" });
const vercelAuth = vercelPasswordAuth({ endpoint: "/api/editable" });

const custom: StorageAdapter = {
  async load() { return {}; },
  async save(content) { /* your backend save */ },
};
```

### `editable.init(...)` Options

- `password?: string` -> client-side fallback password (visible in frontend bundle)
- `authorize?: (password) => Promise<boolean> | boolean` -> preferred server-side auth
- `storageKey?: string` -> local adapter key fallback
- `sessionKey?: string` -> sessionStorage key for edit mode
- `storageAdapter?: StorageAdapter` -> custom source of truth

## Optional Node Server (`click2edit/server`)

```js
import { createEditableServer } from "click2edit/server";

createEditableServer({
  port: 3001,
  endpoint: "/__editable",
  password: "secret123",
  filePath: "editable-content.json",
  corsOrigin: "*",
}).start();
```

Then use:

```ts
import { editable, httpAdapter } from "click2edit";

editable.init({
  password: "secret123",
  storageAdapter: httpAdapter({
    url: "http://localhost:3001/__editable",
    password: "secret123",
  }),
});
```

## Vercel Global Setup

Frontend:
- use `vercelAdapter({ endpoint: "/api/editable" })`
- set `authorize: vercelPasswordAuth({ endpoint: "/api/editable" })`

Backend:
- `api/editable.ts` in this repo

Required env on Vercel:
- `EDITABLE_PASSWORD`
- `click2edit_READ_WRITE_TOKEN` or `BLOB_READ_WRITE_TOKEN`
- (optional) `EDITABLE_SESSION_SECRET`

## Local Demo

```bash
npm install
npm run demo
```

Pages:
- React demo: `http://localhost:5173/`
- Vanilla demo: `http://localhost:5173/vanilla.html`

Demo password:
- local pure Vite mode: any password (dev fallback)
- deployed mode: value from backend env `EDITABLE_PASSWORD`

## QA Checklist Before Release

1) Build package:

```bash
npm run build
```

2) Open demo pages and verify:
- React demo: `http://localhost:5173/`
- Vanilla demo: `http://localhost:5173/vanilla.html`
- toggle edit mode, edit text/list, blur save, `Esc` cancel
- refresh page and verify persisted values

3) If using global mode, verify API:

```bash
curl -i https://your-app.vercel.app/api/editable -H "x-editable-password: <password>"
curl -i -X PUT https://your-app.vercel.app/api/editable \
  -H "content-type: application/json" \
  -H "x-editable-password: <password>" \
  -d '{"pricing.basic":"299 zl"}'
```

## Build / Publish

```bash
npm run build
npm publish --access public
```

## Release Flow (Git + npm)

```bash
# 1) review changes
git status

# 2) stage only project files (recommended explicit list)
git add src api demo README.md package.json package-lock.json tsconfig.build.json vercel.json server

# 3) commit
git commit -m "feat: universal core + react adapter + server-side auth"

# 4) push
git push

# 5) version bump (choose one)
npm version patch
# or npm version minor

# 6) publish
npm publish --access public
```

After publish:
- test in a clean sample app (`npm i click2edit@latest`)
- verify `import { editable } from "click2edit"` and `import { Editable } from "click2edit/react"` both work.

## Troubleshooting

- **Demo fails in old Node runtime**
  - Use Node `>=18` (recommended `20+`) for modern Vite.
- **Edits work only locally**
  - Ensure `storageAdapter` is HTTP/Vercel-based and backend is reachable.
- **Unauthorized on API**
  - Verify `EDITABLE_PASSWORD` and request auth flow (`authorize` or legacy header).
- **Vercel Blob overwrite error**
  - Ensure API uses `allowOverwrite: true` in `put(...)`.

## Security Notes

This package is intentionally simple:
- if you use `password` option, it is frontend-visible by design
- for hidden password use `authorize` with server-side validation
- no users/roles
- no encryption

Use for non-sensitive marketing content.
