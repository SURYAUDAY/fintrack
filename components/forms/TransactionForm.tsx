"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { TransactionRow } from "@/hooks/useRevenue";

interface TransactionFormValues {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: "INCOME" | "EXPENSE";
}

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  defaultValues?: TransactionRow | null;
  categories: string[];
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionForm({
  open,
  onClose,
  onSubmit,
  defaultValues,
  categories,
}: TransactionFormProps) {
  const isEdit = !!defaultValues;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TransactionFormValues>({
    defaultValues: defaultValues
      ? {
          date: new Date(defaultValues.date).toISOString().slice(0, 10),
          description: defaultValues.description,
          amount: defaultValues.amount,
          category: defaultValues.category,
          type: defaultValues.type,
        }
      : {
          date: todayIso(),
          description: "",
          amount: 0,
          category: categories[0] ?? "",
          type: "INCOME",
        },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (values: TransactionFormValues) => {
    await onSubmit(values);
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? "Edit transaction" : "Add transaction"}
      width="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Description"
          placeholder="Enterprise plan renewal"
          error={errors.description?.message}
          {...register("description", {
            required: "Description is required",
            minLength: { value: 2, message: "At least 2 characters" },
          })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Date"
            error={errors.date?.message}
            {...register("date", { required: "Date is required" })}
          />
          <Input
            type="number"
            step="0.01"
            label="Amount"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register("amount", {
              required: "Amount is required",
              valueAsNumber: true,
              min: { value: 0.01, message: "Amount must be positive" },
            })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            error={errors.category?.message}
            {...register("category", { required: "Category is required" })}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            label="Type"
            error={errors.type?.message}
            {...register("type", { required: true })}
          >
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? "Save changes" : "Add transaction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
