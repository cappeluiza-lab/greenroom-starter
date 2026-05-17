"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Settlement } from "@/db/schema";

function formatSignedAt(date: Date): string {
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SignoffSection({ settlement }: { settlement: Settlement }) {
  const hasExistingSignoff = !!settlement.signoffText?.trim();
  const [signed, setSigned] = useState(hasExistingSignoff);
  const [name, setName] = useState(settlement.signoffText ?? "");
  const [signedAt, setSignedAt] = useState<Date | null>(() => {
    if (settlement.signedAt) return settlement.signedAt;
    if (hasExistingSignoff) {
      return (
        settlement.finalizedAt ?? settlement.submittedAt ?? new Date()
      );
    }
    return null;
  });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSignedChange = (checked: boolean) => {
    setSigned(checked);
    if (checked) {
      setSignedAt((prev) => prev ?? new Date());
    } else {
      setSignedAt(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sign-off & notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="eyebrow text-[10px] text-ink-500">Sign-off</div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={signed}
                onChange={(e) => handleSignedChange(e.target.checked)}
                className="h-4 w-4 rounded border-ink-300/80 text-brand-700 focus:ring-brand-700/20 focus:ring-offset-0"
              />
              <span className="text-[13px] text-ink-800">
                Tour manager has signed off
              </span>
            </label>

            <input
              type="text"
              placeholder="Tour manager name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                "w-full max-w-sm px-3 py-2 text-[13px] bg-white border border-ink-200/60 rounded-lg",
                "text-ink-900 placeholder:text-ink-400",
                "focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-300 transition-all",
              )}
            />

            {signed && signedAt && (
              <p className="text-[12px] text-ink-500 font-mono tabular">
                Signed at {formatSignedAt(signedAt)}
              </p>
            )}
          </div>

          {settlement.notes && (
            <div>
              <div className="eyebrow text-[10px] text-ink-500 mb-2">
                Mariana&apos;s settlement notes
              </div>
              <div className="text-[12.5px] text-ink-800 bg-canvas-soft rounded-lg p-4 ring-1 ring-ink-200/60 leading-relaxed">
                {settlement.notes}
              </div>
            </div>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={() => setToast("PDF export coming soon")}
          >
            <Download className="h-3.5 w-3.5" />
            Export PDF
          </Button>
        </CardContent>
      </Card>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg bg-ink-900 text-white text-[13px] shadow-lg shadow-ink-900/20 ring-1 ring-ink-700/50 animate-[fadeIn_150ms_ease-out]"
        >
          {toast}
        </div>
      )}
    </>
  );
}
