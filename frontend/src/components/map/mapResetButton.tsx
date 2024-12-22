import { LuRefreshCcw } from "react-icons/lu";
import { mapButtonStyles, mapButtonSpinStyles } from "./mapButtonBase";
import { cn } from "@/lib/utils";

export type MapResetButtonProps = {
  mapRef: React.RefObject<mapboxgl.Map>,
  bounds: mapboxgl.LngLatBounds,
}

export default function MapResetButton({
  mapRef,
  bounds,
}: MapResetButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => mapRef.current?.fitBounds(bounds, { padding: 100 })}
      className={cn(mapButtonStyles, mapButtonSpinStyles)}
    >
      <LuRefreshCcw className="h-6 w-6" />
    </button>
  );
}
