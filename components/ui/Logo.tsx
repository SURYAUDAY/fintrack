import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { box: "h-7 w-7 text-xs", text: "text-base" },
  md: { box: "h-9 w-9 text-sm", text: "text-xl" },
  lg: { box: "h-11 w-11 text-base", text: "text-2xl" },
};

export function Logo({ className, showWordmark = true, size = "md" }: LogoProps) {
  const sz = sizeMap[size];
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-brand-600 font-bold text-white shadow-sm",
          sz.box
        )}
      >
        FT
      </div>
      {showWordmark && (
        <span
          className={cn(
            "font-semibold text-slate-900 dark:text-slate-100",
            sz.text
          )}
        >
          FinTrack
        </span>
      )}
    </div>
  );
}
