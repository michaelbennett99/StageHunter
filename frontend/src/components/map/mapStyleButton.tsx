import { Dispatch, SetStateAction } from 'react';
import { LuLayers } from 'react-icons/lu';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem
} from '@/components/ui/select';

import {
  mapboxStyles,
  type MapboxStyleId
} from '@/interfaces/mapboxStyles';
import { mapButtonStyles } from "./mapButtonBase";

export type MapStyleButtonProps = {
  selectedStyle: MapboxStyleId,
  setSelectedStyle: Dispatch<SetStateAction<MapboxStyleId>>,
}

export default function MapStyleButton({
  selectedStyle,
  setSelectedStyle
}: MapStyleButtonProps): JSX.Element {
  return (
    <Select defaultValue={selectedStyle} onValueChange={setSelectedStyle}>
      <SelectTrigger>
        <div className={mapButtonStyles}>
          <LuLayers className="h-6 w-6" />
        </div>
      </SelectTrigger>
      <SelectContent className="p-0 w-52">
        <SelectGroup>
          {mapboxStyles.map((style) => (
            <SelectItem key={style.id} value={style.id}>
              <span>{style.name}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
