"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { CategoryBadge, TypeBadge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn, formatCurrency } from "@/lib/utils";
import type { TransactionRow } from "@/hooks/useRevenue";

interface TransactionsTableProps {
  data: TransactionRow[];
  isLoading?: boolean;
  canWrite?: boolean;
  canDelete?: boolean;
  onEdit?: (row: TransactionRow) => void;
  onDelete?: (row: TransactionRow) => void;
  onSortChange?: (
    sortBy: "date" | "amount" | "category",
    dir: "asc" | "desc"
  ) => void;
}

export function TransactionsTable({
  data,
  isLoading,
  canWrite,
  canDelete,
  onEdit,
  onDelete,
  onSortChange,
}: TransactionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);

  const columns: ColumnDef<TransactionRow>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) =>
        new Date(getValue() as string).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ getValue }) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ getValue }) => <CategoryBadge category={getValue() as string} />,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ getValue }) => (
        <TypeBadge type={getValue() as "INCOME" | "EXPENSE"} />
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row, getValue }) => {
        const value = getValue() as number;
        const isIncome = row.original.type === "INCOME";
        return (
          <span
            className={cn(
              "font-semibold",
              isIncome
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {isIncome ? "" : "-"}
            {formatCurrency(value)}
          </span>
        );
      },
    },
    ...(canWrite || canDelete
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }) => (
              <div className="flex items-center justify-end gap-1">
                {canWrite && onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(row.original)}
                    aria-label="Edit"
                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                {canDelete && onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(row.original)}
                    aria-label="Delete"
                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ),
          } as ColumnDef<TransactionRow>,
        ]
      : []),
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(next);
      const first = next[0];
      if (first && onSortChange) {
        onSortChange(
          first.id as "date" | "amount" | "category",
          first.desc ? "desc" : "asc"
        );
      }
    },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  if (isLoading) return <TableSkeleton rows={6} cols={6} />;

  if (data.length === 0) {
    return (
      <EmptyState
        title="No transactions found"
        description="Try adjusting filters or add your first transaction."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const sortable = ["date", "amount", "category"].includes(
                    header.column.id
                  );
                  const sortDir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "px-4 py-3 text-left font-medium",
                        header.column.id === "actions" && "text-right"
                      )}
                    >
                      {sortable ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {sortDir === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : sortDir === "desc" ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-50" />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-slate-100 transition hover:bg-brand-50/40 dark:border-slate-800 dark:hover:bg-brand-600/5"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
