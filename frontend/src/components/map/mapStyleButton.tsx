import { Dispatch, SetStateAction } from 'react';
import { LuLayers } from 'react-icons/lu';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

import {
  mapboxStyles,
  type MapboxStyleId
} from '@/interfaces/mapboxStyles';
import MapButton, { MapButtonProps } from './mapButton';

export type MapStyleButtonProps = MapButtonProps & {
  selectedStyle: MapboxStyleId,
  setSelectedStyle: Dispatch<SetStateAction<MapboxStyleId>>,
}

export default function MapStyleButton(
  { selectedStyle, setSelectedStyle, ...buttonProps }: MapStyleButtonProps
): JSX.Element {

  const handleSelectStyle = (styleId: MapboxStyleId) => {
    setSelectedStyle(styleId);
  };

  return (
    <Select defaultValue={selectedStyle} onValueChange={handleSelectStyle}>
      <SelectTrigger
        className="p-2 rounded-md shadow-md group bg-background text-sm"
        asChild
      >
        <MapButton
          {...buttonProps}
          className="p-2 rounded-md shadow-md group bg-background text-sm"
        >
          <LuLayers className="w-4 h-4" />
        </MapButton>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {mapboxStyles.map((style) => (
            <SelectItem
              key={style.id}
              value={style.id}
            >
              <span>{style.name}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
