import React, { useState } from "react";
import { useEditableMode } from "./provider";
import { useEditableValue } from "./useEditable";

type EditableProps = { id: string; defaultValue: string; multiline?: boolean };

export function Editable({ id, defaultValue, multiline }: EditableProps) {
  const { editing } = useEditableMode();
  const { value, save } = useEditableValue(id, defaultValue);
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) return <>{value}</>;

  if (active) {
    const commit = () => {
      save(draft);
      setActive(false);
    };
    const cancel = () => {
      setDraft(value);
      setActive(false);
    };
    return multiline ? (
      <textarea
        autoFocus
        value={draft}
        onBlur={commit}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && cancel()}
        style={{
          width: "100%",
          minHeight: 96,
          borderRadius: 12,
          border: "1px solid #93c5fd",
          padding: "10px 12px",
          outline: "none",
          boxShadow: "0 0 0 4px rgba(59,130,246,0.12)",
          font: "inherit",
          background: "#fff",
        }}
      />
    ) : (
      <input
        autoFocus
        value={draft}
        onBlur={commit}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") cancel();
          if (e.key === "Enter") commit();
        }}
        style={{
          width: "100%",
          borderRadius: 12,
          border: "1px solid #93c5fd",
          padding: "9px 12px",
          outline: "none",
          boxShadow: "0 0 0 4px rgba(59,130,246,0.12)",
          font: "inherit",
          background: "#fff",
        }}
      />
    );
  }

  return (
    <span
      onClick={() => {
        setDraft(value);
        setActive(true);
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "2px 6px",
        borderRadius: 8,
        border: hover ? "1px solid rgba(59,130,246,0.35)" : "1px solid transparent",
        background: hover ? "rgba(59,130,246,0.07)" : "transparent",
        cursor: "text",
        transition: "all 160ms ease",
      }}
    >
      <span>{value}</span>
      <small
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          padding: "2px 6px",
          borderRadius: 999,
          background: "rgba(17,24,39,0.08)",
          color: "#111827",
          opacity: hover ? 1 : 0.65,
        }}
      >
        Edit
      </small>
    </span>
  );
}
