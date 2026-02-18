const isBrowser = () => typeof window !== "undefined";
const safeParse = (input) => {
    if (!input)
        return {};
    try {
        const parsed = JSON.parse(input);
        return parsed && typeof parsed === "object" ? parsed : {};
    }
    catch {
        return {};
    }
};
export const localStorageAdapter = (storageKey = "__editable_content__") => ({
    load: () => {
        if (!isBrowser())
            return {};
        return safeParse(localStorage.getItem(storageKey));
    },
    save: (content) => {
        if (!isBrowser())
            return;
        localStorage.setItem(storageKey, JSON.stringify(content));
    },
});
export const httpAdapter = ({ url, password }) => {
    const headers = { "content-type": "application/json" };
    if (password)
        headers["x-editable-password"] = password;
    return {
        load: async () => {
            const res = await fetch(url, { method: "GET", headers, credentials: "same-origin" });
            if (!res.ok)
                return {};
            const data = (await res.json());
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
export const httpPasswordAuth = ({ url, passwordField = "password", }) => async (password) => {
    const res = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ [passwordField]: password }),
    });
    return res.ok;
};
export const vercelAdapter = ({ password, endpoint = "/api/editable", } = {}) => httpAdapter({
    url: endpoint,
    password,
});
export const vercelPasswordAuth = ({ endpoint = "/api/editable", } = {}) => httpPasswordAuth({
    url: endpoint,
});
