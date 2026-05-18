"use client";

import { useRef, useState } from "react";
import { CloudUpload, FileText, X } from "lucide-react";
import Papa from "papaparse";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

export interface CSVRow {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: "INCOME" | "EXPENSE";
}

interface CSVUploadProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (rows: CSVRow[]) => Promise<void> | void;
}

export function CSVUpload({ open, onClose, onConfirm }: CSVUploadProps) {
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setRows([]);
    setFileName(null);
    setError(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Only .csv files are supported");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large (max 5MB)");
      return;
    }
    setFileName(file.name);
    setError(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed: CSVRow[] = [];
        for (const r of result.data) {
          if (!r.date || !r.description || !r.amount || !r.category) continue;
          const type = (r.type || "EXPENSE").toUpperCase();
          if (type !== "INCOME" && type !== "EXPENSE") continue;
          const amount = Number(String(r.amount).replace(/[$,]/g, ""));
          if (Number.isNaN(amount) || amount <= 0) continue;
          parsed.push({
            date: r.date,
            description: r.description,
            amount,
            category: r.category,
            type,
          });
        }
        if (parsed.length === 0) {
          setError(
            "No valid rows found. Required columns: date, description, amount, category, type"
          );
          return;
        }
        setRows(parsed);
      },
      error: () => setError("Could not parse CSV file"),
    });
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(rows);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Upload transactions"
      description="CSV with columns: date, description, amount, category, type"
      width="lg"
    >
      {!rows.length && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition",
            dragOver
              ? "border-brand-400 bg-brand-50/50 dark:bg-brand-600/10"
              : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/40"
          )}
        >
          <CloudUpload className="h-10 w-10 text-slate-400" />
          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
            Drag your CSV file here, or click to browse
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Supports .csv files up to 5MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}

      {rows.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-700 dark:text-slate-200">
                {fileName} — {rows.length} valid rows
              </span>
            </div>
            <button
              type="button"
              onClick={reset}
              className="text-slate-400 hover:text-slate-700"
              aria-label="Clear file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-2 text-xs font-medium text-slate-500">
            Preview (first 5 rows)
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/40">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Date</th>
                  <th className="px-3 py-2 text-left font-medium">
                    Description
                  </th>
                  <th className="px-3 py-2 text-left font-medium">Category</th>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((r, i) => (
                  <tr
                    key={i}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-3 py-2">{r.date}</td>
                    <td className="px-3 py-2">{r.description}</td>
                    <td className="px-3 py-2">{r.category}</td>
                    <td className="px-3 py-2">{r.type}</td>
                    <td className="px-3 py-2 text-right">${r.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={rows.length === 0}
          loading={submitting}
        >
          Import {rows.length || ""} transactions
        </Button>
      </div>
    </Modal>
  );
}
