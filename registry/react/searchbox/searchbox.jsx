// registry/react/searchbox/searchbox.jsx
import React, { useState, useCallback, useRef } from "react";
import styles from "../css/searchbox.module.css";

/**
 * Windows 7 스타일 검색 입력 컴포넌트
 * @param {object} props
 * @param {string} [props.value]
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} [props.onChange]
 * @param {(query: string) => void} [props.onSearch]
 * @param {string} [props.placeholder]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 */
export function SearchBox({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder,
  disabled = false,
  className,
}) {
  const [internalValue, setInternalValue] = useState("");
  const inputRef = useRef(null);

  const currentValue = controlledValue ?? internalValue;

  const handleChange = useCallback(
    (e) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    },
    [onChange]
  );

  const handleSearch = useCallback(() => {
    onSearch?.(currentValue);
  }, [currentValue, onSearch]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <div className={`${styles.searchbox} ${className ?? ""}`.trim()}>
      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        className={styles["searchbox-input"]}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="button"
        aria-label="search"
        className={styles["searchbox-button"]}
        onClick={handleSearch}
        disabled={disabled}
      />
    </div>
  );
}
