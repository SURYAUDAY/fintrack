"use client";

import { useMemo, useState } from "react";
import { Download, Plus, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { TableFilters, type TableFilterValue } from "@/components/tables/TableFilters";
import { TransactionsTable } from "@/components/tables/TransactionsTable";
import { Pagination } from "@/components/ui/Pagination";
import { CSVUpload, type CSVRow } from "@/components/ui/CSVUpload";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  useBulkImport,
  useCreateTransaction,
  useDeleteTransaction,
  useRevenue,
  useUpdateTransaction,
  type TransactionRow,
} from "@/hooks/useRevenue";
import { usePermission } from "@/hooks/usePermission";

const CATEGORIES = ["SaaS", "Consulting", "Product", "Marketing", "Other"];

function rowsToCsv(rows: TransactionRow[]): string {
  const header = "date,description,amount,category,type\n";
  const body = rows
    .map((r) =>
      [
        new Date(r.date).toISOString().slice(0, 10),
        `"${r.description.replace(/"/g, '""')}"`,
        r.amount,
        r.category,
        r.type,
      ].join(",")
    )
    .join("\n");
  return header + body;
}

export default function RevenuePage() {
  const canWrite = usePermission("WRITE_DATA");
  const canDelete = usePermission("DELETE_DATA");
  const canExport = usePermission("EXPORT_DATA");

  const [filters, setFilters] = useState<TableFilterValue>({
    search: "",
    category: "all",
    type: "all",
  });
  const [sort, setSort] = useState<{
    by: "date" | "amount" | "category";
    dir: "asc" | "desc";
  }>({ by: "date", dir: "desc" });
  const [page, setPage] = useState(1);

  const queryFilters = useMemo(
    () => ({
      ...filters,
      sortBy: sort.by,
      sortDir: sort.dir,
      page,
      limit: 50,
    }),
    [filters, sort, page]
  );

  const { data, isLoading } = useRevenue(queryFilters);
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const bulkMutation = useBulkImport();

  const [csvOpen, setCsvOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionRow | null>(null);
  const [deleting, setDeleting] = useState<TransactionRow | null>(null);

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (row: TransactionRow) => {
    setEditing(row);
    setFormOpen(true);
  };

  const handleSave = async (values: {
    date: string;
    description: string;
    amount: number;
    category: string;
    type: "INCOME" | "EXPENSE";
  }) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...values });
        toast.success("Transaction updated");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Transaction added");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      toast.success("Transaction deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleCsvImport = async (rows: CSVRow[]) => {
    const result = await bulkMutation.mutateAsync(rows);
    toast.success(`Imported ${result.inserted} transactions`);
  };

  const handleExport = () => {
    if (!data?.data.length) {
      toast.error("Nothing to export");
      return;
    }
    const csv = rowsToCsv(data.data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fintrack-transactions-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Revenue
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage and track all revenue transactions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canExport && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
          {canWrite && (
            <>
              <Button variant="outline" onClick={() => setCsvOpen(true)}>
                <Upload className="h-4 w-4" />
                Upload CSV
              </Button>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4" />
                Add transaction
              </Button>
            </>
          )}
        </div>
      </div>

      <TableFilters
        value={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        categories={CATEGORIES}
        resultCount={data?.total}
      />

      <TransactionsTable
        data={data?.data ?? []}
        isLoading={isLoading}
        canWrite={canWrite}
        canDelete={canDelete}
        onEdit={handleEdit}
        onDelete={(row) => setDeleting(row)}
        onSortChange={(by, dir) => {
          setSort({ by, dir });
          setPage(1);
        }}
      />

      {data && data.totalPages > 1 && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          pageSize={data.pageSize}
          onChange={setPage}
        />
      )}

      <CSVUpload
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onConfirm={handleCsvImport}
      />

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
        defaultValues={editing}
        categories={CATEGORIES}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete transaction?"
        description={
          deleting
            ? `"${deleting.description}" will be permanently removed.`
            : ""
        }
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
