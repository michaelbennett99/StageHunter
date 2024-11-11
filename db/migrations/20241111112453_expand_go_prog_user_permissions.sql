-- migrate:up

-- Create nologin role to allow insert only on racedata.daily
CREATE ROLE stagehunter_daily_insert;
GRANT INSERT ON racedata.daily TO stagehunter_daily_insert;
GRANT USAGE ON SEQUENCE racedata.daily_daily_id_seq TO stagehunter_daily_insert;

-- Grant stagehunter_daily_insert role to go_prog
GRANT stagehunter_daily_insert TO go_prog_user;

-- migrate:down

REVOKE stagehunter_daily_insert FROM go_prog_user;

REVOKE USAGE ON SEQUENCE racedata.daily_daily_id_seq
FROM stagehunter_daily_insert;
REVOKE INSERT ON racedata.daily FROM stagehunter_daily_insert;
DROP ROLE stagehunter_daily_insert;
