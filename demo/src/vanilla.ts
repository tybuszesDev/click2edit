import {
  editable,
  httpAdapter,
  localStorageAdapter,
  vercelPasswordAuth,
  type EditableContent,
  type StorageAdapter,
} from "../../src/index";

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
      return window.location.hostname === "localhost";
    }
  },
  storageAdapter: hybridAdapter,
});

editable.mount(document);

const modeChip = document.getElementById("mode-chip");
const updateModeChip = () => {
  if (!modeChip) return;
  modeChip.textContent = editable.isEditing() ? "Edit mode: ON" : "Edit mode: OFF";
};

editable.subscribe(updateModeChip);
updateModeChip();

document.getElementById("toggle-edit")?.addEventListener("click", () => {
  editable.toggleEdit();
});

document.getElementById("reset-storage")?.addEventListener("click", () => {
  localStorage.removeItem("__editable_demo_content__");
  sessionStorage.removeItem("__editable_session__");
  window.location.reload();
});
