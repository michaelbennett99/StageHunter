import { Dispatch, SetStateAction } from 'react';
import { LuLayers } from 'react-icons/lu';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import {
  mapboxStyles,
  type MapboxStyleId
} from '@/interfaces/mapboxStyles';
import MapButton, { MapButtonProps } from './mapButton';
import { cn } from '@/lib/utils';

export type MapStyleButtonProps = MapButtonProps & {
  mapRef: React.RefObject<mapboxgl.Map>,
  selectedStyle: MapboxStyleId,
  setSelectedStyle: Dispatch<SetStateAction<MapboxStyleId>>,
}

export default function MapStyleButton(
  props: MapStyleButtonProps
): JSX.Element {
  const { mapRef, selectedStyle, setSelectedStyle, ...buttonProps } = props;

  const handleSelectStyle = (styleId: MapboxStyleId) => {
    setSelectedStyle(styleId);
  };

  return (
    <Select defaultValue={selectedStyle} onValueChange={handleSelectStyle}>
      <SelectTrigger
        className="p-2 rounded-md shadow-md group bg-background text-sm"
        asChild
      >
        <MapButton>
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
