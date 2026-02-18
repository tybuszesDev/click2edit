export type EditableContent = Record<string, unknown>;
export type StorageAdapter = {
    load: () => Promise<EditableContent> | EditableContent;
    save: (content: EditableContent) => Promise<void> | void;
};
export declare const localStorageAdapter: (storageKey?: string) => StorageAdapter;
type HttpAdapterOptions = {
    url: string;
    password?: string;
};
export declare const httpAdapter: ({ url, password }: HttpAdapterOptions) => StorageAdapter;
type HttpPasswordAuthOptions = {
    url: string;
    passwordField?: string;
};
export declare const httpPasswordAuth: ({ url, passwordField, }: HttpPasswordAuthOptions) => (password: string) => Promise<boolean>;
type VercelAdapterOptions = {
    password?: string;
    endpoint?: string;
};
export declare const vercelAdapter: ({ password, endpoint, }?: VercelAdapterOptions) => StorageAdapter;
type VercelPasswordAuthOptions = {
    endpoint?: string;
};
export declare const vercelPasswordAuth: ({ endpoint, }?: VercelPasswordAuthOptions) => (password: string) => Promise<boolean>;
export {};
