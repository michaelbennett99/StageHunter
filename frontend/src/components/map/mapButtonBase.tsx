import { cn } from "@/lib/utils";

export const mapButtonStyles = "flex h-10 w-10 items-center justify-center rounded-lg bg-background/90 backdrop-blur-sm hover:bg-background/80 border border-border";

export const mapButtonSpinStyles = "hover:[&>svg]:animate-spin-once";

export default function MapButtonBase({
  spinning = false,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  spinning?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        mapButtonStyles,
        spinning && mapButtonSpinStyles,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
