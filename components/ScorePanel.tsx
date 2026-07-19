type ScorePanelProps = {
  scenarioName: string;
  score: number;
  hijacked: boolean;
};

// A glanceable report card: the score, a colored pass/fail pill, and the
// scenario name — readable in a single glance, no scrolling or clicking.
export default function ScorePanel({ scenarioName, score, hijacked }: ScorePanelProps) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">{scenarioName}</p>

      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold">{score}</span>
        <span className="text-gray-500 dark:text-gray-400">/ 100</span>
      </div>

      <span
        className={[
          "self-start px-3 py-1 rounded-full text-sm font-medium",
          hijacked
            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
            : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
        ].join(" ")}
      >
        {hijacked ? "Hijacked" : "Safe"}
      </span>
    </div>
  );
}
