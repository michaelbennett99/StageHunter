-- migrate:up

CREATE TABLE racedata.daily (
    daily_id SERIAL PRIMARY KEY,
    stage_id INT NOT NULL REFERENCES racedata.stages(stage_id),
    date DATE NOT NULL DEFAULT CURRENT_DATE
);

INSERT INTO racedata.daily (stage_id)
SELECT racedata.get_random_stage_id();

CREATE INDEX ON racedata.daily (date);
CREATE INDEX ON racedata.daily (stage_id);

-- CRON job to insert a new row every day

SELECT cron.schedule(
    'daily_insert', '0 0 * * *',
    'INSERT INTO racedata.daily (stage_id)
    SELECT racedata.get_random_stage_id()'
);

-- migrate:down

SELECT cron.unschedule('daily_insert');

DROP TABLE racedata.daily;
