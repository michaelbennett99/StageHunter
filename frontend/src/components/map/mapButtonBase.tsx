import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { forwardRef } from "react";

interface MapButtonBaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  spinning?: boolean;
  asChild?: boolean;
}

const MapButtonBase = forwardRef<HTMLButtonElement, MapButtonBaseProps>(({
  spinning = false,
  asChild = false,
  className,
  children,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      type="button"
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg",
        "bg-background/90 backdrop-blur-sm",
        "hover:bg-background/80",
        "border border-border",
        spinning && "hover:[&>svg]:animate-spin-once",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
});

MapButtonBase.displayName = "MapButtonBase";

export default MapButtonBase;
