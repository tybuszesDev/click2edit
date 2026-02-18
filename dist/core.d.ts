import { type StorageAdapter } from "./storage.js";
type InitOptions = {
    password?: string;
    storageKey?: string;
    sessionKey?: string;
    storageAdapter?: StorageAdapter;
    authorize?: (password: string) => Promise<boolean> | boolean;
};
type Listener = () => void;
export type EditableInstance = {
    init: (options: InitOptions) => void;
    subscribe: (listener: Listener) => () => void;
    isEditing: () => boolean;
    toggleEdit: () => void;
    getValue: <T>(id: string, defaultValue: T) => T;
    saveValue: <T>(id: string, next: T) => Promise<void>;
    mount: (root?: ParentNode) => () => void;
    load: () => Promise<void>;
};
export declare function createEditable(): EditableInstance;
export declare const editable: EditableInstance;
export {};
