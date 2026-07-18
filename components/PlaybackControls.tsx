"use client";

import { useEffect, useRef, useState } from "react";
import type { Span } from "@/lib/trace/types";

type PlaybackControlsProps = {
  spans: Span[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

// How long "Play" waits before advancing to the next step.
const STEP_INTERVAL_MS = 1200;

// Prev/Next step by one, plus a Play/Pause button that auto-advances on a
// timer — this is what makes scrubbing through a run feel like watching a
// video. If Play lands on the flagged (hijacked) step, it auto-pauses there
// instead of blowing past it, so the demo naturally "stops at the crash."
export default function PlaybackControls({ spans, selectedIndex, onSelect }: PlaybackControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFirst = selectedIndex === 0;
  const isLast = selectedIndex >= spans.length - 1;

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    if (isLast) {
      setIsPlaying(false);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      const nextIndex = selectedIndex + 1;
      onSelect(nextIndex);

      // Landed on the hijack step — stop here for a beat instead of
      // continuing straight past it.
      if (spans[nextIndex]?.flagged) {
        setIsPlaying(false);
      }
    }, STEP_INTERVAL_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, isLast, selectedIndex, spans, onSelect]);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onSelect(selectedIndex - 1)}
        disabled={isFirst}
        className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        ◀ Prev
      </button>

      <button
        type="button"
        onClick={() => setIsPlaying((playing) => !playing)}
        className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer"
      >
        {isPlaying ? "⏸ Pause" : "▶ Play"}
      </button>

      <button
        type="button"
        onClick={() => onSelect(selectedIndex + 1)}
        disabled={isLast}
        className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Next ▶
      </button>

      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
        Step {selectedIndex + 1} of {spans.length}
      </span>
    </div>
  );
}
