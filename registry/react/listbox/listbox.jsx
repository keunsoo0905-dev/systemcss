// registry/react/listbox/listbox.jsx
import React, { useState, useCallback, useRef } from "react";
import styles from "../css/listbox.module.css";

/**
 * @typedef {{ value: string; label: string; disabled?: boolean }} ListBoxItem
 */

/**
 * Windows 7 스타일 리스트박스 컴포넌트
 * @param {object} props
 * @param {ListBoxItem[]} props.items
 * @param {"single" | "multiple"} [props.selectionMode="single"]
 * @param {string[]} [props.selectedValues]
 * @param {(values: string[]) => void} [props.onSelectionChange]
 * @param {boolean} [props.hasShadow=false]
 * @param {boolean} [props.hasHover=false]
 * @param {string} [props.className]
 * @param {React.CSSProperties} [props.style]
 */
export function ListBox({
  items,
  selectionMode = "single",
  selectedValues: controlledValues,
  onSelectionChange,
  hasShadow = false,
  hasHover = false,
  className,
  style,
}) {
  const [internalSelected, setInternalSelected] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listRef = useRef(null);

  const selected = controlledValues ?? internalSelected;

  const toggleSelection = useCallback(
    (value) => {
      let next;
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
    (e) => {
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
