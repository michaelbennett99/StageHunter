import { cn } from "@/lib/utils";
import DarkModeToggle from "./darkModeToggle";

export default function Header() {
  return (
    <header
      className={cn(
        "flex-none sticky top-0 z-50 border-b",
        "py-2 px-8"
      )}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">StageHunter</h1>
        <DarkModeToggle className="h-6 w-6" />
      </div>
    </header>
  );
}
