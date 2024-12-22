import { LuMountain } from "react-icons/lu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { mapButtonStyles } from "./mapButtonBase";

export interface MapTerrainButtonProps {
  terrainExaggeration: number;
  onTerrainExaggerationChange: (value: number) => void;
}

export default function MapTerrainButton({
  terrainExaggeration,
  onTerrainExaggerationChange,
}: MapTerrainButtonProps): JSX.Element {
  return (
    <Popover>
      <PopoverTrigger>
        <div className={mapButtonStyles}>
          <LuMountain className="h-6 w-6" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-3" align="end">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Terrain Exaggeration</h4>
          <p className="text-sm text-muted-foreground">
            Adjust the height of terrain features
          </p>
          <input
            type="range"
            min={0}
            max={2.5}
            step={0.05}
            value={terrainExaggeration}
            onChange={(e) => onTerrainExaggerationChange(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Flat</span>
            <span>{terrainExaggeration.toFixed(1)}x</span>
            <span>2.5x</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
