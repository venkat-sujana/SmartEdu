import Link from "next/link";
import { ExternalLink } from "lucide-react";

const TUTORIAL_URL =
  "https://code2tutorial.com/tutorial/47e2a7b5-b5bd-4555-8672-adb68170ced7/index.md";

export default function Tutorials() {
  return (
    <div className="rounded-3xl border border-sky-200/60 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6 shadow-xl">
      <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-700">
        Tutorial
      </p>
      <h2 className="mt-3 text-2xl font-black text-slate-900">Project Tutorial Link</h2>
      <p className="mt-2 text-sm text-slate-600">
        Project usage and walkthrough details are available in this tutorial.
      </p>

      <Link
        href={TUTORIAL_URL}
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Tutorial
        <ExternalLink className="h-4 w-4" />
      </Link>
    </div>
  );
}
