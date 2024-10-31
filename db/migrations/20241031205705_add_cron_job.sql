-- migrate:up

-- CRON job to insert a new row every day

SELECT cron.schedule(
    'daily_insert', '0 0 * * *',
    'INSERT INTO racedata.daily (stage_id)
    SELECT racedata.get_random_stage_id()'
);

-- migrate:down

SELECT cron.unschedule('daily_insert');
