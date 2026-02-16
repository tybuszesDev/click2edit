export type EditableContent = Record<string, unknown>;

export type StorageAdapter = {
  load: () => Promise<EditableContent> | EditableContent;
  save: (content: EditableContent) => Promise<void> | void;
};

const isBrowser = () => typeof window !== "undefined";

const safeParse = (input: string | null): EditableContent => {
  if (!input) return {};
  try {
    const parsed = JSON.parse(input) as EditableContent;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

export const localStorageAdapter = (storageKey = "__editable_content__"): StorageAdapter => ({
  load: () => {
    if (!isBrowser()) return {};
    return safeParse(localStorage.getItem(storageKey));
  },
  save: (content) => {
    if (!isBrowser()) return;
    localStorage.setItem(storageKey, JSON.stringify(content));
  },
});

type HttpAdapterOptions = { url: string; password?: string };

export const httpAdapter = ({ url, password }: HttpAdapterOptions): StorageAdapter => {
  const headers: HeadersInit = { "content-type": "application/json" };
  if (password) headers["x-editable-password"] = password;

  return {
    load: async () => {
      const res = await fetch(url, { method: "GET", headers, credentials: "same-origin" });
      if (!res.ok) return {};
      const data = (await res.json()) as EditableContent;
      return data && typeof data === "object" ? data : {};
    },
    save: async (content) => {
      await fetch(url, {
        method: "PUT",
        headers,
        credentials: "same-origin",
        body: JSON.stringify(content),
      });
    },
  };
};
