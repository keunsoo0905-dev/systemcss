// registry/react/dropdown/dropdown.tsx
import React from "react";
import styles from "../css/dropdown.module.css";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "multiple"> {
  /** 드롭다운에 표시할 옵션 목록 */
  options: DropdownOption[];
  /** 선택 전 표시할 플레이스홀더 텍스트 */
  placeholder?: string;
}

export function Dropdown({
  options,
  placeholder,
  className,
  ...props
}: DropdownProps) {
  return (
    <select
      className={`${styles.dropdown} ${className ?? ""}`.trim()}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
