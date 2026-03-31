// registry/react/listview/listview.jsx
import React, { useState, useCallback } from "react";
import styles from "../css/listview.module.css";

/**
 * @typedef {{ key: string; label: string; width?: number }} ListViewColumn
 * @typedef {"asc" | "desc"} SortDirection
 */

/**
 * Windows 7 스타일 리스트뷰 (테이블 기반) 컴포넌트
 * @param {object} props
 * @param {ListViewColumn[]} props.columns
 * @param {Record<string, React.ReactNode>[]} props.data
 * @param {string} [props.sortKey]
 * @param {SortDirection} [props.sortDirection]
 * @param {(key: string, direction: SortDirection) => void} [props.onSort]
 * @param {(index: number, row: Record<string, React.ReactNode>) => void} [props.onRowSelect]
 * @param {boolean} [props.hasShadow=false]
 * @param {string} [props.className]
 */
export function ListView({
  columns,
  data,
  sortKey: controlledSortKey,
  sortDirection: controlledSortDirection,
  onSort,
  onRowSelect,
  hasShadow = false,
  className,
}) {
  const [internalSortKey, setInternalSortKey] = useState(undefined);
  const [internalSortDirection, setInternalSortDirection] = useState("asc");
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const sortKey = controlledSortKey ?? internalSortKey;
  const sortDirection = controlledSortDirection ?? internalSortDirection;

  const handleHeaderClick = useCallback(
    (key) => {
      let nextDirection = "asc";
      if (sortKey === key) {
        nextDirection = sortDirection === "asc" ? "desc" : "asc";
      }
      setInternalSortKey(key);
      setInternalSortDirection(nextDirection);
      onSort?.(key, nextDirection);
    },
    [sortKey, sortDirection, onSort]
  );

  const handleRowClick = useCallback(
    (index) => {
      setSelectedRowIndex(index);
      onRowSelect?.(index, data[index]);
    },
    [data, onRowSelect]
  );

  const tableClass = [
    styles.listview,
    hasShadow && styles["has-shadow"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <table className={tableClass}>
      <thead>
        <tr>
          {columns.map((col) => {
            const isActive = sortKey === col.key;
            const headerClass = [
              isActive && styles.highlighted,
              isActive && styles.indicator,
              isActive && sortDirection === "asc" && styles.up,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <th
                key={col.key}
                className={headerClass || undefined}
                style={col.width ? { width: col.width } : undefined}
                onClick={() => handleHeaderClick(col.key)}
              >
                {col.label}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={
              selectedRowIndex === rowIndex ? styles.highlighted : undefined
            }
            onClick={() => handleRowClick(rowIndex)}
          >
            {columns.map((col) => (
              <td key={col.key}>{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
