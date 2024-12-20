import { Dispatch, SetStateAction } from 'react';
import { LuSettings } from 'react-icons/lu';

import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import {
  MapboxStandardConfig,
  configLabels,
  configOptions,
  showOptions
} from '@/interfaces/mapboxStandardConfig';

import MapButton, { MapButtonProps } from './mapButton';
import { trySetMapConfig } from '@/lib/map';

export type MapConfigButtonProps = {
  config: MapboxStandardConfig;
  setConfig: Dispatch<SetStateAction<MapboxStandardConfig>>;
  mapRef: React.RefObject<mapboxgl.Map>;
} & MapButtonProps;

export default function MapConfigButton(
  { mapRef, config, setConfig, ...buttonProps }: MapConfigButtonProps
): JSX.Element {
  function handleConfigChange(
    key: keyof MapboxStandardConfig,
    value: boolean | string
  ) {
    setConfig(prevConfig => ({
      ...prevConfig,
      [key]: value
    }));
  }

  return (
    <MapButton {...buttonProps} asChild>
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-2 rounded-md shadow-md bg-background group">
            <LuSettings className="group-hover:animate-spin-once" />
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col gap-2">
            {Object.entries(config).map(([key, value]) => {
              return (
                showOptions[key as keyof MapboxStandardConfig] && (
                  <ConfigOption
                    key={key}
                    configKey={key as keyof MapboxStandardConfig}
                    value={value}
                    onChange={handleConfigChange}
                  />
                )
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </MapButton>
  );
}

export function ConfigOption({
  configKey, value, onChange
}: {
  configKey: keyof MapboxStandardConfig,
  value: boolean | string,
  onChange: (key: keyof MapboxStandardConfig, value: boolean | string) => void,
}): JSX.Element {
  return (
    <div key={configKey} className="flex items-center justify-between gap-4">
      <span className="text-sm">{configLabels[configKey]}</span>
      {typeof value === 'boolean' ? (
        <Switch
          checked={value}
          onCheckedChange={() => onChange(configKey, !value)}
        />
      ) : (
        <Select
          value={value}
          onValueChange={
            (newValue) => onChange(configKey, newValue)
          }
        >
          <SelectTrigger className="p-1 h-6 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="p-1">
            {
              configOptions[configKey]?.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="p-1"
                >
                  {option.label}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
