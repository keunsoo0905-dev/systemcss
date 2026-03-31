// registry/react/listbox/listbox.tsx
import React, { useState, useCallback, useRef } from "react";
import styles from "../css/listbox.module.css";

export interface ListBoxItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ListBoxProps {
  /** 리스트에 표시할 항목 목록 */
  items: ListBoxItem[];
  /** 선택 모드: "single" (기본) 또는 "multiple" */
  selectionMode?: "single" | "multiple";
  /** 현재 선택된 값 목록 (controlled) */
  selectedValues?: string[];
  /** 선택 변경 시 콜백 */
  onSelectionChange?: (values: string[]) => void;
  /** 그림자 효과 표시 여부 */
  hasShadow?: boolean;
  /** hover 시 하이라이트 표시 여부 */
  hasHover?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 리스트박스 높이 */
  style?: React.CSSProperties;
}

export function ListBox({
  items,
  selectionMode = "single",
  selectedValues: controlledValues,
  onSelectionChange,
  hasShadow = false,
  hasHover = false,
  className,
  style,
}: ListBoxProps) {
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = controlledValues ?? internalSelected;

  const toggleSelection = useCallback(
    (value: string) => {
      let next: string[];
      if (selectionMode === "multiple") {
        next = selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value];
      } else {
        next = [value];
      }
      setInternalSelected(next);
      onSelectionChange?.(next);
    },
    [selected, selectionMode, onSelectionChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < items.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            toggleSelection(items[focusedIndex].value);
          }
          break;
        case "Home":
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          e.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
      }
    },
    [focusedIndex, items, toggleSelection]
  );

  const classNames = [
    styles.listbox,
    hasShadow && styles["has-shadow"],
    hasHover && styles["has-hover"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-multiselectable={selectionMode === "multiple"}
      className={classNames}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={style}
    >
      {items.map((item, index) => (
        <li
          key={item.value}
          role="option"
          aria-selected={selected.includes(item.value)}
          aria-disabled={item.disabled}
          className={`${styles["listbox-option"]} ${
            selected.includes(item.value) ? styles.selected : ""
          } ${focusedIndex === index ? styles.focused : ""}`.trim()}
          onClick={() => !item.disabled && toggleSelection(item.value)}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
