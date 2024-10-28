-- migrate:up

-- change time column to an interval
ALTER TABLE results_templates.timed
ALTER COLUMN time TYPE INTERVAL USING time::interval;

-- migrate:down

ALTER TABLE results_templates.timed
ALTER COLUMN time TYPE TIME USING time::time;
