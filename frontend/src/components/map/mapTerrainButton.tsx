import { Mountain } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface MapTerrainButtonProps {
  terrainExaggeration: number;
  onTerrainExaggerationChange: (value: number) => void;
  id?: string;
}

export default function MapTerrainButton({
  terrainExaggeration,
  onTerrainExaggerationChange,
  id = "map-terrain-button"
}: MapTerrainButtonProps): JSX.Element {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          className={cn(
            "p-2 rounded-md border bg-background",
            "flex items-center justify-center",
            "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Mountain className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-60 p-3"
        align="end"
      >
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Terrain Exaggeration</h4>
          <p className="text-sm text-muted-foreground">
            Adjust the height of terrain features
          </p>
          <input
            type="range"
            min={0}
            max={10}
            step={0.1}
            value={terrainExaggeration}
            onChange={(e) => onTerrainExaggerationChange(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Flat</span>
            <span>{terrainExaggeration.toFixed(1)}x</span>
            <span>10x</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
