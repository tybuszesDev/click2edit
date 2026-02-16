export declare function useEditableValue<T>(id: string, defaultValue: T): {
    value: T;
    save: (next: T) => void;
};
