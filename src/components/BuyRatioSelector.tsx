"use client";

const OPTIONS = [
  { value: 1, label: "买入" },
  { value: 0, label: "暂且不动" },
] as const;

type Props = {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export default function BuyRatioSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="ratio-row">
      {OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={`ratio-btn ${option.value === 1 ? "ratio-btn-buy" : "ratio-btn-hold"} ${active ? "active" : ""}`}
            onClick={() => onChange(option.value)}
            disabled={disabled}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
