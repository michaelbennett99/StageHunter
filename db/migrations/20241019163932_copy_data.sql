-- migrate:up

COPY racedata.races
FROM '/data/races.csv'
WITH (FORMAT CSV, HEADER TRUE);

COPY racedata.stages
FROM '/data/stages.csv'
WITH (FORMAT CSV, HEADER TRUE);

COPY racedata.teams
FROM '/data/teams.csv'
WITH (FORMAT CSV, HEADER TRUE);

COPY racedata.riders
FROM '/data/riders.csv'
WITH (FORMAT CSV, HEADER TRUE);

-- migrate:down

DELETE FROM racedata.riders;
DELETE FROM racedata.teams;
DELETE FROM racedata.stages;
DELETE FROM racedata.races;
