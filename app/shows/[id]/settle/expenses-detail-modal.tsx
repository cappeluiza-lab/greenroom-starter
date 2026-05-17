"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import type { Expense } from "@/db/schema";

function formatDeduction(amount: number): string {
  const formatted = formatMoney(amount);
  return formatted === "—" ? formatted : `−${formatted}`;
}

const EXPENSE_CATEGORY_LABELS: Record<Expense["category"], string> = {
  production: "Production",
  sound: "Sound",
  lights: "Lights",
  hospitality: "Hospitality",
  marketing: "Marketing",
  backline: "Backline",
  security: "Security",
  other: "Other",
};

export function ExpensesBreakdownRow({
  label,
  amount,
  expenses,
  expenseCap,
  totalExpenses,
}: {
  label: string;
  amount: number;
  expenses: Expense[];
  expenseCap: number | null;
  totalExpenses: number;
}) {
  const [open, setOpen] = useState(false);
  const passedThrough = expenses.filter((e) => !e.absorbedByVenue);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <div className="flex items-baseline justify-between py-2.5">
        <div
          className={cn(
            "text-[13px] flex items-center gap-1.5 min-w-0 text-ink-600",
          )}
        >
          <span className="truncate">{label}</span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 text-[13px] leading-none opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-1 rounded"
            aria-label="View expense line items"
          >
            ℹ️
          </button>
        </div>
        <div className="text-[13.5px] font-mono tabular text-rose-700">
          {formatDeduction(amount)}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            aria-hidden
          />

          <Card
            className="relative w-full max-w-md shadow-2xl shadow-ink-900/10"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="expenses-detail-title"
          >
            <CardHeader>
              <div>
                <CardTitle id="expenses-detail-title">Expenses</CardTitle>
                <CardDescription>
                  Passed-through line items deducted from net box office.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 -mr-1"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="pt-0">
              {passedThrough.length === 0 ? (
                <p className="text-[13px] text-ink-500 py-2">
                  No passed-through expenses on this show.
                </p>
              ) : (
                <div className="divide-y divide-ink-100/80">
                  {passedThrough.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-baseline justify-between py-2.5 gap-4"
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] text-ink-900">
                          {EXPENSE_CATEGORY_LABELS[e.category]}
                        </div>
                        {e.description && (
                          <div className="text-[11.5px] text-ink-400 mt-0.5 truncate">
                            {e.description}
                          </div>
                        )}
                      </div>
                      <div className="text-[13.5px] font-mono tabular text-ink-900 shrink-0">
                        {formatMoney(e.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-baseline justify-between py-3 mt-1 border-t border-ink-200/80 font-semibold">
                <span className="text-[13px] text-ink-900">Total</span>
                <span className="text-[13.5px] font-mono tabular text-ink-900">
                  {formatMoney(totalExpenses)}
                </span>
              </div>

              {expenseCap != null && (
                <p className="text-[12px] text-ink-500 leading-relaxed pb-1">
                  Capped at {formatMoney(expenseCap)} — venue absorbs the
                  difference
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
