import { useState } from 'react';
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

export type MapStyleButtonProps = MapButtonProps;

export default function MapStyleButton(
  props: MapStyleButtonProps
): JSX.Element {
  const [open, setOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<MapboxStyleId>('standard');
  const fullMapboxStyle = mapboxStyleMap[selectedStyle];

  return (
    <MapButton {...props}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            className="w-32 justify-between flex items-center"
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
                      setSelectedStyle(style.id);
                      setOpen(false);
                    }}
                  >
                    <span>{style.name}</span>
                    <LuCheck />
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
