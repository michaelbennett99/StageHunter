"use client";

import { cn } from "@/lib/utils";
import DarkModeToggle from "./darkModeToggle";
import { useHeaderInfo } from "@/context/headerInfoContext";

export default function Header() {
  const { headerInfo } = useHeaderInfo();

  return (
    <header
      className={cn(
        "flex-none sticky top-0 z-50 border-b",
        "py-2 px-8"
      )}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">StageHunter</h1>
        <div className="flex items-center justify-end gap-4">
          <p className="text-sm">{headerInfo}</p>
          <DarkModeToggle className="h-6 w-6" />
        </div>
      </div>
    </header>
  );
}
