import { Dispatch, SetStateAction } from 'react';
import { LuLayers } from 'react-icons/lu';

import * as Select from '@radix-ui/react-select'

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
    <Select.Root defaultValue={selectedStyle} onValueChange={handleSelectStyle}>
      <Select.Trigger
        className="p-2 rounded-md shadow-md group bg-background text-sm"
        asChild
      >
        <MapButton>
          <LuLayers className="w-4 h-4" />
        </MapButton>
      </Select.Trigger>
      <Select.Content
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          "p-1 w-52"
        )}
      >
        <Select.Group>
          {mapboxStyles.map((style) => (
            <Select.Item
              key={style.id}
              value={style.id}
              className="p-2 rounded-md shadow-md group bg-background text-sm hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <span>{style.name}</span>
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
}
