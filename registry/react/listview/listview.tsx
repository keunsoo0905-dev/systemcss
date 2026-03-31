// registry/react/listview/listview.tsx
import React, { useState, useCallback } from "react";
import styles from "../css/listview.module.css";

export interface ListViewColumn {
  key: string;
  label: string;
  width?: number;
}

export type SortDirection = "asc" | "desc";

export interface ListViewProps {
  columns: ListViewColumn[];
  data: Record<string, React.ReactNode>[];
  sortKey?: string;
  sortDirection?: SortDirection;
  onSort?: (key: string, direction: SortDirection) => void;
  onRowSelect?: (index: number, row: Record<string, React.ReactNode>) => void;
  hasShadow?: boolean;
  className?: string;
}

export function ListView({
  columns,
  data,
  sortKey: controlledSortKey,
  sortDirection: controlledSortDirection,
  onSort,
  onRowSelect,
  hasShadow = false,
  className,
}: ListViewProps) {
  const [internalSortKey, setInternalSortKey] = useState<string | undefined>();
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>("asc");
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  const sortKey = controlledSortKey ?? internalSortKey;
  const sortDirection = controlledSortDirection ?? internalSortDirection;

  const handleHeaderClick = useCallback(
    (key: string) => {
      let nextDirection: SortDirection = "asc";
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
    (index: number) => {
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
