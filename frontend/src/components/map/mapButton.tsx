import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface MapButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export default function MapButton({
  className,
  asChild,
  ...props
}: MapButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className={cn(
        'p-2 rounded-md shadow-md',
        'bg-opacity-50 hover:bg-opacity-100',
        'bg-background',
        className
      )}
      {...props}
    />
  );
}
