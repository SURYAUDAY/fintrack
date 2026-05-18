"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import type { ExpenseRow } from "@/hooks/useExpenses";

interface ExpenseFormValues {
  description: string;
  amount: number;
  category: string;
  date: string;
  recurring: boolean;
  frequency: string | null;
}

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ExpenseFormValues) => Promise<void>;
  defaultValues?: ExpenseRow | null;
  categories: string[];
}

export function ExpenseForm({
  open,
  onClose,
  onSubmit,
  defaultValues,
  categories,
}: ExpenseFormProps) {
  const isEdit = !!defaultValues;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    defaultValues: defaultValues
      ? {
          description: defaultValues.description,
          amount: defaultValues.amount,
          category: defaultValues.category,
          date: new Date(defaultValues.date).toISOString().slice(0, 10),
          recurring: defaultValues.recurring,
          frequency: defaultValues.frequency,
        }
      : {
          description: "",
          amount: 0,
          category: categories[0] ?? "",
          date: new Date().toISOString().slice(0, 10),
          recurring: false,
          frequency: null,
        },
  });

  const recurring = watch("recurring");

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (values: ExpenseFormValues) => {
    await onSubmit({
      ...values,
      frequency: values.recurring ? values.frequency ?? "Monthly" : null,
    });
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? "Edit expense" : "Add expense"}
      width="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Description"
          error={errors.description?.message}
          {...register("description", {
            required: "Description is required",
            minLength: { value: 2, message: "At least 2 characters" },
          })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            step="0.01"
            label="Amount"
            error={errors.amount?.message}
            {...register("amount", {
              required: "Amount is required",
              valueAsNumber: true,
              min: { value: 0.01, message: "Must be positive" },
            })}
          />
          <Input
            type="date"
            label="Date"
            error={errors.date?.message}
            {...register("date", { required: "Date is required" })}
          />
        </div>

        <Select label="Category" {...register("category", { required: true })}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Recurring expense
            </p>
            <p className="text-xs text-slate-500">
              Repeats automatically each period
            </p>
          </div>
          <Toggle
            checked={recurring}
            onChange={(next) => setValue("recurring", next)}
          />
        </div>

        {recurring && (
          <Select label="Frequency" {...register("frequency")}>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Yearly">Yearly</option>
          </Select>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? "Save changes" : "Add expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
