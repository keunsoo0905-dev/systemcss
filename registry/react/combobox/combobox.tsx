// registry/react/combobox/combobox.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import styles from "../css/combobox.module.css";

export interface ComboBoxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboBoxProps {
  /** 콤보박스에 표시할 옵션 목록 */
  options: ComboBoxOption[];
  /** 현재 선택된 값 (controlled) */
  value?: string;
  /** 값 변경 시 콜백 */
  onValueChange?: (value: string) => void;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
}

export function ComboBox({
  options,
  value,
  onValueChange,
  placeholder,
  disabled = false,
  className,
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(() => {
    if (value != null) {
      const match = options.find((o) => o.value === value);
      return match ? match.label : "";
    }
    return "";
  });
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // controlled value 동기화
  useEffect(() => {
    if (value != null) {
      const match = options.find((o) => o.value === value);
      setInputValue(match ? match.label : "");
    }
  }, [value, options]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!inputValue) return options;
    const lower = inputValue.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [options, inputValue]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      setIsOpen(true);
      setHighlightedIndex(-1);
    },
    []
  );

  const handleSelect = useCallback(
    (opt: ComboBoxOption) => {
      setInputValue(opt.label);
      setIsOpen(false);
      onValueChange?.(opt.value);
    },
    [onValueChange]
  );

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          setIsOpen(true);
          return;
        }
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            handleSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    },
    [isOpen, highlightedIndex, filteredOptions, handleSelect]
  );

  return (
    <div
      ref={wrapperRef}
      className={`${styles.combobox} ${className ?? ""}`.trim()}
    >
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="button"
        aria-label="toggle"
        tabIndex={-1}
        className={styles["combobox-toggle"]}
        onClick={handleToggle}
        disabled={disabled}
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul role="listbox" className={styles["combobox-listbox"]}>
          {filteredOptions.map((opt, index) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={highlightedIndex === index}
              className={highlightedIndex === index ? styles.highlighted : undefined}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(opt);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
