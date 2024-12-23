import { Dispatch, SetStateAction } from 'react';
import { LuLayers } from 'react-icons/lu';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem
} from '@/components/ui/select'
import { SelectTrigger as SelectTriggerRadix } from '@radix-ui/react-select';

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
      <SelectTriggerRadix asChild>
        <MapButton
          {...buttonProps}
        >
          <LuLayers className="w-4 h-4" />
        </MapButton>
      </SelectTriggerRadix>
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
