-- migrate:up

-- Add public schema to search path
ALTER DATABASE stagehunter SET search_path = racedata, geog, public;

-- migrate:down

ALTER DATABASE stagehunter SET search_path = racedata, geog;
