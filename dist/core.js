import { localStorageAdapter } from "./storage.js";
const isBrowser = () => typeof window !== "undefined";
export function createEditable() {
    const config = {
        password: "",
        storageKey: "__editable_content__",
        sessionKey: "__editable_session__",
        storageAdapter: undefined,
        authorize: undefined,
    };
    let content = {};
    let loaded = false;
    let loadingPromise = null;
    let editing = false;
    const listeners = new Set();
    const mountedRoots = new Set();
    const adapter = () => config.storageAdapter ?? localStorageAdapter(config.storageKey);
    const notify = () => listeners.forEach((listener) => listener());
    const load = async () => {
        if (loaded)
            return;
        if (loadingPromise)
            return loadingPromise;
        loadingPromise = Promise.resolve(adapter().load())
            .then((next) => {
            content = next || {};
            loaded = true;
        })
            .catch(() => {
            loaded = true;
        })
            .finally(() => {
            loadingPromise = null;
            notify();
        });
        return loadingPromise;
    };
    const persistSession = () => {
        if (!isBrowser())
            return;
        if (editing)
            sessionStorage.setItem(config.sessionKey, "1");
        else
            sessionStorage.removeItem(config.sessionKey);
    };
    const saveValue = async (id, next) => {
        await load();
        content = { ...content, [id]: next };
        notify();
        await Promise.resolve(adapter().save(content)).catch(() => { });
    };
    const getValue = (id, defaultValue) => content[id] ?? defaultValue;
    const applyInlineStyles = (node) => {
        node.style.cursor = editing ? "text" : "";
        node.style.border = editing ? "1px solid rgba(59,130,246,0.35)" : "";
        node.style.borderRadius = editing ? "8px" : "";
        node.style.padding = editing ? "2px 6px" : "";
        node.style.background = editing ? "rgba(59,130,246,0.07)" : "";
        node.style.transition = "all 160ms ease";
    };
    const applyListStyles = (node) => {
        node.style.cursor = editing ? "text" : "";
        node.style.border = editing ? "1px solid rgba(59,130,246,0.35)" : "";
        node.style.borderRadius = editing ? "10px" : "";
        node.style.padding = editing ? "10px 12px" : "";
        node.style.background = editing ? "rgba(59,130,246,0.07)" : "";
        node.style.transition = "all 160ms ease";
    };
    const openInlineEditor = (node, id, multiline) => {
        const initial = getValue(id, node.dataset.editableValue || node.textContent || "");
        const input = document.createElement(multiline ? "textarea" : "input");
        input.value = initial;
        input.style.width = "100%";
        input.style.font = "inherit";
        input.style.borderRadius = "10px";
        input.style.border = "1px solid #93c5fd";
        input.style.padding = "8px 10px";
        input.style.outline = "none";
        input.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
        if (input instanceof HTMLTextAreaElement)
            input.style.minHeight = "88px";
        const cancel = () => renderMountedRoots();
        const commit = async () => {
            await saveValue(id, input.value);
            renderMountedRoots();
        };
        input.addEventListener("blur", () => {
            void commit();
        });
        input.addEventListener("keydown", (e) => {
            const key = e.key;
            if (key === "Escape")
                cancel();
            if (key === "Enter" && !(input instanceof HTMLTextAreaElement))
                void commit();
        });
        node.replaceChildren(input);
        input.focus();
        input.select();
    };
    const openListEditor = (node, id) => {
        const items = getValue(id, []);
        const draft = items.length ? items.join("\n") : Array.from(node.querySelectorAll("li")).map((x) => x.textContent || "").join("\n");
        const textarea = document.createElement("textarea");
        textarea.value = draft;
        textarea.style.width = "100%";
        textarea.style.minHeight = "110px";
        textarea.style.font = "inherit";
        textarea.style.borderRadius = "10px";
        textarea.style.border = "1px solid #93c5fd";
        textarea.style.padding = "8px 10px";
        textarea.style.outline = "none";
        textarea.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
        const cancel = () => renderMountedRoots();
        const commit = async () => {
            const next = textarea.value
                .split("\n")
                .map((x) => x.trim())
                .filter(Boolean);
            await saveValue(id, next);
            renderMountedRoots();
        };
        textarea.addEventListener("blur", () => {
            void commit();
        });
        textarea.addEventListener("keydown", (e) => {
            if (e.key === "Escape")
                cancel();
        });
        node.replaceChildren(textarea);
        textarea.focus();
    };
    const renderMountedRoots = () => {
        mountedRoots.forEach(({ root }) => {
            root.querySelectorAll("[data-editable]").forEach((node) => {
                const id = node.dataset.editable || "";
                const fallback = node.dataset.editableDefault || node.textContent || "";
                const value = getValue(id, fallback);
                node.textContent = value;
                applyInlineStyles(node);
            });
            root.querySelectorAll("[data-editable-list]").forEach((node) => {
                const id = node.dataset.editableList || "";
                const fallback = (node.dataset.editableDefault || "")
                    .split("|")
                    .map((x) => x.trim())
                    .filter(Boolean);
                const items = getValue(id, fallback);
                node.replaceChildren(...items.map((item) => {
                    const li = document.createElement("li");
                    li.textContent = item;
                    return li;
                }));
                applyListStyles(node);
            });
        });
    };
    const mount = (root = document) => {
        const clickHandler = (event) => {
            if (!editing)
                return;
            const target = event.target;
            if (!target)
                return;
            const field = target.closest("[data-editable]");
            const list = target.closest("[data-editable-list]");
            if (field) {
                event.preventDefault();
                const id = field.dataset.editable || "";
                openInlineEditor(field, id, field.dataset.editableMultiline === "true");
            }
            else if (list) {
                event.preventDefault();
                const id = list.dataset.editableList || "";
                openListEditor(list, id);
            }
        };
        const mounted = { root, clickHandler };
        mountedRoots.add(mounted);
        root.addEventListener("click", clickHandler);
        void load().then(renderMountedRoots);
        const unsub = subscribe(renderMountedRoots);
        return () => {
            unsub();
            mountedRoots.delete(mounted);
            root.removeEventListener("click", clickHandler);
        };
    };
    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };
    const toggleEdit = () => {
        if (!isBrowser())
            return;
        if (!editing) {
            const attemptEnable = async () => {
                const entered = window.prompt("Editable password:") || "";
                if (!entered)
                    return;
                if (config.authorize) {
                    const ok = await Promise.resolve(config.authorize(entered)).catch(() => false);
                    if (!ok)
                        return;
                }
                else {
                    const ok = !config.password || entered === config.password;
                    if (!ok)
                        return;
                }
                editing = true;
                persistSession();
                notify();
            };
            void attemptEnable();
            return;
        }
        editing = !editing;
        persistSession();
        notify();
    };
    const init = (options) => {
        Object.assign(config, options);
        if (isBrowser())
            editing = sessionStorage.getItem(config.sessionKey) === "1";
        loaded = false;
        void load();
        notify();
    };
    if (isBrowser()) {
        window.addEventListener("keydown", (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "e") {
                e.preventDefault();
                toggleEdit();
            }
        });
    }
    return {
        init,
        subscribe,
        isEditing: () => editing,
        toggleEdit,
        getValue,
        saveValue,
        mount,
        load,
    };
}
export const editable = createEditable();
