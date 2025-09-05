import * as React from "react";

export function Select({ children }) {
  return <div className="relative">{children}</div>;
}

export function SelectTrigger({ className = "", ...props }) {
  return (
    <button
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ${className}`}
      {...props}
    />
  );
}

export function SelectValue({ placeholder }) {
  return <span className="text-gray-500">{placeholder}</span>;
}

export function SelectContent({ children, className = "" }) {
  return (
    <div
      className={`absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-md ${className}`}
    >
      {children}
    </div>
  );
}

export function SelectItem({ value, children, ...props }) {
  return (
    <div
      className="cursor-pointer px-3 py-2 hover:bg-gray-100"
      data-value={value}
      {...props}
    >
      {children}
    </div>
  );
}
