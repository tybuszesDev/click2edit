import React from "react";
type InitOptions = {
    password: string;
    storageKey?: string;
    sessionKey?: string;
};
type EditableContextValue = {
    editing: boolean;
    toggleEdit: () => void;
    storageKey: string;
};
export declare const editable: {
    init(options: InitOptions): void;
};
export declare function EditableProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare const useEditableMode: () => EditableContextValue;
export {};
