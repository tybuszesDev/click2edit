import React from "react";
import { type EditableInstance } from "./core.js";
type EditableProviderProps = {
    children: React.ReactNode;
    editor?: EditableInstance;
};
type EditableContextValue = {
    editor: EditableInstance;
    editing: boolean;
};
export declare function EditableProvider({ children, editor }: EditableProviderProps): import("react/jsx-runtime").JSX.Element;
export declare const useEditableMode: () => EditableContextValue;
type EditableProps = {
    id: string;
    defaultValue: string;
    multiline?: boolean;
};
type EditableListProps = {
    id: string;
    defaultValue: string[];
};
export declare function Editable({ id, defaultValue, multiline }: EditableProps): import("react/jsx-runtime").JSX.Element;
export declare function EditableList({ id, defaultValue }: EditableListProps): import("react/jsx-runtime").JSX.Element;
export {};
