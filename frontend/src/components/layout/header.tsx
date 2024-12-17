import { cn } from "@/lib/utils";

export default function Header() {
  return (
    <header
      className={cn(
        "flex-none sticky top-0 z-50 bg-white border-b border-gray-200",
        "py-2 px-8"
      )}
    >
      <h1 className="text-2xl font-bold">StageHunter</h1>
    </header>
  );
}
