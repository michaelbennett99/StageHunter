import { Dispatch, SetStateAction } from 'react';
import { LuLayers } from 'react-icons/lu';

import * as Select from '@radix-ui/react-select'

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
    <Select.Root defaultValue={selectedStyle} onValueChange={handleSelectStyle}>
      <Select.Trigger
        className="p-2 rounded-md shadow-md group bg-background text-sm"
        asChild
      >
        <MapButton>
          <LuLayers className="w-4 h-4" />
        </MapButton>
      </Select.Trigger>
      <Select.Content className="p-0 w-52 bg-background">
        <Select.Group>
          {mapboxStyles.map((style) => (
            <Select.Item
              key={style.id}
              value={style.id}
              className="p-2 rounded-md shadow-md group bg-background text-sm"
            >
              <span>{style.name}</span>
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
}
