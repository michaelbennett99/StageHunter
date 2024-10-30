-- migrate:up

ALTER TABLE racedata.results
ADD CONSTRAINT classification_and_time_points CHECK (
    (classification = 'stage' AND points IS NULL) OR
    (classification = 'general' AND points IS NULL) OR
    (classification = 'points' AND "time" IS NULL) OR
    (classification = 'mountains' AND "time" IS NULL) OR
    (classification = 'youth' AND points IS NULL) OR
    (classification = 'teams' AND points IS NULL)
);

ALTER TABLE racedata.results ADD CONSTRAINT rider_id_null_for_teams CHECK (
    (classification != 'teams' AND rider_id IS NOT NULL) OR
    (classification = 'teams' AND rider_id IS NULL)
);

-- migrate:down

ALTER TABLE racedata.results DROP CONSTRAINT rider_id_null_for_teams;
ALTER TABLE racedata.results DROP CONSTRAINT classification_and_time_points;
