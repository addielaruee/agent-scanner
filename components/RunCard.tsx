import Link from "next/link";

type RunCardProps = {
  id: string;
  scenarioName: string;
  description: string;
  score: number;
  hijacked: boolean;
};

// One card per recorded run: scenario name, a one-line description of what
// it tests, a score badge, and a link into that run's replay.
export default function RunCard({ id, scenarioName, description, score, hijacked }: RunCardProps) {
  return (
    <Link
      href={`/run/${id}`}
      className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-3 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">{scenarioName}</h3>
        <span
          className={[
            "shrink-0 px-2.5 py-1 rounded-full text-xs font-medium",
            hijacked
              ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
              : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
          ].join(" ")}
        >
          {score} / 100
        </span>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>

      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
        Watch replay →
      </span>
    </Link>
  );
}
