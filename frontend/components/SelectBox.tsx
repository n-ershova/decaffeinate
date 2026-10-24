interface Props {
  checked: boolean;
  label: string;
}

/** Square tick box for list rows; the row itself handles the click. */
export default function SelectBox({ checked, label }: Props) {
  return (
    <span role="checkbox" aria-checked={checked} aria-label={label} style={{
      width: 14, height: 14, alignSelf: "center", borderRadius: 2, display: "inline-flex", alignItems: "center", justifyContent: "center",
      border: `1px solid ${checked ? "var(--ink)" : "var(--hairline)"}`, background: checked ? "var(--ink)" : "transparent",
      transition: "background 0.15s, border-color 0.15s",
    }}>
      {checked && (
        <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
          <path d="M1.5 5.2 4 7.5 8.5 2.5" fill="none" stroke="var(--paper)" strokeWidth="1.5" />
        </svg>
      )}
    </span>
  );
}
