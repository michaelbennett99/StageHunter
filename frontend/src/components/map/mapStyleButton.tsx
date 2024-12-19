import { useState, useEffect } from 'react';
import { LuChevronDown, LuCheck } from 'react-icons/lu';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

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

  const [open, setOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<MapboxStyleId>(defaultStyle);
  const fullMapboxStyle = mapboxStyleMap[selectedStyle];

  const handleSelectStyle = (styleId: MapboxStyleId) => {
    setSelectedStyle(styleId);
    setOpen(false);
  };

  // Set map style when selected style changes
  useEffect(() => {
    props.mapRef.current?.setStyle(fullMapboxStyle.url);
  }, [selectedStyle]);

  return (
    <MapButton {...buttonProps} asChild>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            className="justify-between flex items-center gap-1 p-2 rounded-md shadow-md group bg-background text-sm"
          >
            <span>{fullMapboxStyle.name}</span>
            <LuChevronDown />
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <Command>
            <CommandInput placeholder="Search style..." />
            <CommandList>
              <CommandEmpty>No style found</CommandEmpty>
              <CommandGroup>
                {mapboxStyles.map((style) => (
                  <CommandItem
                    key={style.id}
                    value={style.id}
                    onSelect={() => {
                      handleSelectStyle(style.id);
                    }}
                  >
                    <span>{style.name}</span>
                    {selectedStyle === style.id && <LuCheck />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </MapButton>
  )
}
