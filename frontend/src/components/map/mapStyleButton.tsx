import { useState, useEffect } from 'react';
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
  mapboxStyleMap,
  mapboxStyles,
  type MapboxStyleId
} from '@/interfaces/mapboxStyles';
import MapButton, { MapButtonProps } from './mapButton';

export type MapStyleButtonProps = MapButtonProps & {
  mapRef: React.RefObject<mapboxgl.Map>,
  defaultStyle: MapboxStyleId,
}

export default function MapStyleButton(
  props: MapStyleButtonProps
): JSX.Element {
  const { mapRef, defaultStyle, ...buttonProps } = props;

  const [selectedStyle, setSelectedStyle] = useState<MapboxStyleId>(
    defaultStyle
  );
  const fullMapboxStyle = mapboxStyleMap[selectedStyle];

  const handleSelectStyle = (styleId: MapboxStyleId) => {
    setSelectedStyle(styleId);
  };

  // Set map style when selected style changes
  useEffect(() => {
    props.mapRef.current?.setStyle(fullMapboxStyle.url);
  }, [selectedStyle]);

  return (
    <MapButton {...buttonProps} asChild>
      <Select defaultValue={selectedStyle} onValueChange={handleSelectStyle}>
        <SelectTrigger
          className="rounded-md shadow-md group bg-background text-sm"
          icon={false}
        >
          <SelectValue
            className="justify-between flex items-center gap-1"
          >
            <LuLayers />
          </SelectValue>
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
    </MapButton>
  )
}
