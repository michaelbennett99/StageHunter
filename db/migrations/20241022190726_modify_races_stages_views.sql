-- migrate:up

CREATE VIEW racedata.races_stages AS
SELECT
    r.race_id, r.gt, r.year,
    s.stage_id, s.stage_number, s.stage_type,
    s.stage_length, s.stage_start, s.stage_end,
    s.gpx_id
FROM racedata.races r
JOIN racedata.stages s ON r.race_id = s.race_id;

DROP VIEW racedata.races_stages_tracks;
DROP VIEW racedata.stages_tracks;

CREATE VIEW racedata.races_stages_tracks AS
SELECT
    rs.*,
    t.the_geom
FROM racedata.races_stages rs
JOIN geog.tracks t ON rs.gpx_id = t.track_id;

-- migrate:down

DROP VIEW racedata.races_stages_tracks;

CREATE VIEW racedata.stages_tracks AS
SELECT
    s.stage_id, s.race_id, s.stage_number, s.stage_type, s.stage_length,
    s.stage_start, s.stage_end,
    t.the_geom
FROM racedata.stages s
JOIN geog.tracks t ON s.gpx_id = t.track_id;

CREATE VIEW racedata.races_stages_tracks AS
SELECT
    r.race_id, r.gt, r.year,
    st.stage_id, st.stage_number, st.stage_type, st.stage_length, st.stage_start, st.stage_end, st.the_geom
FROM racedata.races r
JOIN racedata.stages_tracks st ON r.race_id = st.race_id;

DROP VIEW racedata.races_stages;
