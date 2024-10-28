-- migrate:up

CREATE VIEW racedata.stages_elevation AS
    SELECT
        s.stage_id, e.ele, e.distance
    FROM racedata.stages s
    JOIN geog.elevation e ON s.gpx_id = e.track_fid;

-- migrate:down

DROP VIEW racedata.stages_elevation;
