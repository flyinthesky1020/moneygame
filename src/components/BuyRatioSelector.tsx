"use client";

const RATIOS = [0.1, 0.25, 0.5, 1] as const;

type Props = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export default function BuyRatioSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="ratio-row">
      {RATIOS.map((ratio) => {
        const active = value === ratio;
        return (
          <button
            key={ratio}
            type="button"
            className={`ratio-btn ${active ? "active" : ""}`}
            onClick={() => onChange(ratio)}
            disabled={disabled}
          >
            {(ratio * 100).toFixed(0)}%
          </button>
        );
      })}
    </div>
  );
}
