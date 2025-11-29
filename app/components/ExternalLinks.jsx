// app/components/ExternalLinks.js
"use client";

import { ArrowTopRightOnSquareIcon, DocumentTextIcon } from "@heroicons/react/24/solid";

const defaultLinks = [
  {
    label: "Vocational Question Paper",
    href: "https://skr-learn-portal.netlify.app/",
  },
  {
    label: "M&AT Question Paper",
    href: "https://advanced-question-paper-tailwindcss.netlify.app/",
  },
];

export default function ExternalLinks({ links = defaultLinks }) {
  return (
    <div className="my-4 flex flex-wrap justify-center gap-3">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto"
        >
          <button
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 text-xs md:text-sm font-bold text-white shadow-md transition hover:scale-105"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
              {link.icon === "doc" ? (
                <DocumentTextIcon className="h-4 w-4" />
              ) : (
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              )}
            </span>
            <span className="whitespace-nowrap">{link.label}</span>
          </button>
        </a>
      ))}
    </div>
  );
}
