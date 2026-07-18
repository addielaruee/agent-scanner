"use client";

import type { Span } from "@/lib/trace/types";

type TimelineProps = {
  spans: Span[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

// A horizontal row of clickable dots, one per span, in the order they
// happened. The selected dot is enlarged; a flagged (hijacked) dot is red
// and pulses so the eye jumps straight to it, even at a glance.
export default function Timeline({ spans, selectedIndex, onSelect }: TimelineProps) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto py-4">
      {spans.map((span, index) => {
        const isSelected = index === selectedIndex;
        const isFlagged = span.flagged === true;

        return (
          <button
            key={span.id}
            type="button"
            onClick={() => onSelect(index)}
            title={`${index + 1}. ${span.title}`}
            aria-label={`${span.title}${isFlagged ? " (hijack detected)" : ""}`}
            aria-current={isSelected}
            className={[
              "shrink-0 rounded-full transition-all cursor-pointer",
              isSelected ? "w-5 h-5" : "w-3.5 h-3.5",
              isFlagged
                ? "bg-red-500 shadow-[0_0_0_5px_rgba(239,68,68,0.35)] animate-pulse"
                : isSelected
                  ? "bg-blue-500"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}
