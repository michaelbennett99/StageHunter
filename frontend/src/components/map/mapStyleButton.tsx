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
import MapButton, { MapButtonProps } from './mapButton';

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
        icon={false}
        asChild
      >
        <MapButton>
          <LuLayers className="w-4 h-4" />
        </MapButton>
      </SelectTrigger>
      <SelectContent className="p-0 w-52">
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
