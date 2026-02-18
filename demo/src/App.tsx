import React from "react";
import {
  editable,
  httpAdapter,
  localStorageAdapter,
  vercelPasswordAuth,
  type EditableContent,
  type StorageAdapter,
} from "../../src/index";
import {
  Editable,
  EditableList,
  EditableProvider,
  useEditableMode,
} from "../../src/react";

const localAdapter = localStorageAdapter("__editable_demo_content__");
const remoteAdapter = httpAdapter({ url: "/api/editable" });
const authorizeRemote = vercelPasswordAuth({ endpoint: "/api/editable" });

const hybridAdapter: StorageAdapter = {
  async load() {
    try {
      const remote = await remoteAdapter.load();
      if (Object.keys(remote).length > 0) return remote;
    } catch {
      // Keep local fallback for pure Vite local demo.
    }
    return localAdapter.load();
  },
  async save(content: EditableContent) {
    localAdapter.save(content);
    try {
      await remoteAdapter.save(content);
    } catch {
      // Keep local fallback for pure Vite local demo.
    }
  },
};

editable.init({
  authorize: async (password) => {
    try {
      return await authorizeRemote(password);
    } catch {
      // Keep local edit workflow in pure Vite mode without API.
      return window.location.hostname === "localhost";
    }
  },
  storageAdapter: hybridAdapter,
});

const defaultFeatures = ["SEO on-page", "Hosting setup", "1 runda poprawek"];

const reset = () => {
  localStorage.removeItem("__editable_demo_content__");
  sessionStorage.removeItem("__editable_session__");
  window.location.reload();
};

export function App() {
  return (
    <EditableProvider>
      <DemoContent />
    </EditableProvider>
  );
}

function DemoContent() {
  const { editor, editing } = useEditableMode();

  return (
    <>
      <div className="status-row">
        <div className="status-chip">{editing ? "Edit mode: ON" : "Edit mode: OFF"}</div>
        <div className="status-chip subtle">Storage: API + local fallback</div>
        <button className="button button-secondary" onClick={() => editor.toggleEdit()}>
          Toggle edit mode
        </button>
      </div>
      <main className="page">
        <header className="hero">
          <div className="badge">Click2edit Demo</div>
          <h1 className="hero-title">
            <Editable id="hero.title" defaultValue="Modern websites that you can edit in seconds" />
          </h1>
          <p className="hero-copy">
            <Editable
              id="hero.description"
              multiline
              defaultValue="No CMS panel. No extra dashboard. Just click content, edit, and save instantly."
            />
          </p>
          <div className="hero-actions">
            <button className="button button-primary">Get started</button>
            <button className="button button-secondary">Book a call</button>
          </div>
        </header>

        <section className="grid">
          <article className="card card-price">
            <h2>Starter package</h2>
            <p className="muted">Perfect for local business landing pages</p>
            <p className="price">
              <span>from</span> <Editable id="pricing.basic" defaultValue="199 zl" />
            </p>
            <EditableList id="pricing.features" defaultValue={defaultFeatures} />
          </article>

          <article className="card card-panel">
            <h3>How to edit</h3>
            <ol>
              <li>Press Cmd/Ctrl + Shift + E</li>
              <li>Type your server password (stored only in backend env)</li>
              <li>Click any highlighted text to edit</li>
              <li>Blur to save, ESC to cancel</li>
            </ol>
            <button className="button button-ghost" onClick={reset}>
              Reset local/session storage
            </button>
          </article>
        </section>
      </main>
    </>
  );
}
