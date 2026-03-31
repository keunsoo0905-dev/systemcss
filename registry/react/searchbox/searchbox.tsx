// registry/react/searchbox/searchbox.tsx
import React, { useState, useCallback, useRef } from "react";
import styles from "../css/searchbox.module.css";

export interface SearchBoxProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchBox({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder,
  disabled = false,
  className,
}: SearchBoxProps) {
  const [internalValue, setInternalValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const currentValue = controlledValue ?? internalValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    },
    [onChange]
  );

  const handleSearch = useCallback(() => {
    onSearch?.(currentValue);
  }, [currentValue, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
