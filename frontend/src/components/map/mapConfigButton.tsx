import { useState, useEffect } from 'react';
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
  configOptions
} from '@/interfaces/mapboxStandardConfig';

import MapButton, { MapButtonProps } from './mapButton';

export type MapConfigButtonProps = {
  defaultConfig: MapboxStandardConfig;
  mapRef: React.RefObject<mapboxgl.Map>;
} & MapButtonProps;

export default function MapConfigButton(
  { mapRef, defaultConfig, ...buttonProps }: MapConfigButtonProps
): JSX.Element {
  const [config, setConfig] = useState(defaultConfig);

  function handleConfigChange(
    key: keyof MapboxStandardConfig,
    value: boolean | string
  ) {
    setConfig(prevConfig => ({
      ...prevConfig,
      [key]: value
    }));
  }

  useEffect(() => {
    mapRef.current?.setConfig(
      'basemap', config as unknown as mapboxgl.ConfigSpecification
    );
  }, [config, mapRef]);

  return (
    <MapButton {...buttonProps} asChild>
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-2 rounded-md shadow-md bg-background">
            <LuSettings />
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col gap-2">
            {Object.entries(config).map(([key, value]) => {
              const configKey = key as keyof MapboxStandardConfig;
              return (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="text-sm">{configLabels[configKey]}</span>
                  {typeof value === 'boolean' ? (
                    <Switch
                      checked={value}
                      onCheckedChange={() => handleConfigChange(configKey, !value)}
                    />
                  ) : <></>
                  }
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </MapButton>
  );
}
