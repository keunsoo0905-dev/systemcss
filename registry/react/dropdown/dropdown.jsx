// registry/react/dropdown/dropdown.jsx
import React from "react";
import styles from "../css/dropdown.module.css";

/**
 * @typedef {{ value: string; label: string; disabled?: boolean }} DropdownOption
 */

/**
 * Windows 7 스타일 드롭다운 선택 컴포넌트
 * @param {object} props
 * @param {DropdownOption[]} props.options - 드롭다운에 표시할 옵션 목록
 * @param {string} [props.placeholder] - 선택 전 표시할 플레이스홀더 텍스트
 * @param {string} [props.className] - 추가 CSS 클래스
 */
export function Dropdown({ options, placeholder, className, ...props }) {
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
