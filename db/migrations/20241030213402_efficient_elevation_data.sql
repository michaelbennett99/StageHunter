-- migrate:up

DROP VIEW racedata.stages_elevation;

DROP TABLE geog.elevation;

CREATE VIEW geog.elevation AS
    WITH segments AS (
        SELECT
            track_fid,
            track_seg_point_id,
            ele,
            ST_Length(
                ST_MakeLine(
                    LAG(the_geom, 1, the_geom)
                    OVER (PARTITION BY track_fid ORDER BY track_seg_point_id),
                    the_geom
                )
            ) AS distance,
            the_geom
        FROM track_points
    )
    SELECT
        track_fid,
        track_seg_point_id,
        ele,
        SUM(distance) OVER(PARTITION BY track_fid ORDER BY track_seg_point_id) AS distance
    FROM segments;

CREATE VIEW racedata.stages_elevation AS
    SELECT s.stage_id,
        e.ele,
        e.distance
    FROM racedata.stages s
    JOIN geog.elevation e ON s.gpx_id = e.track_fid;

-- migrate:down

DROP VIEW racedata.elevation;

DROP VIEW racedata.stages_elevation;

CREATE TABLE geog.elevation AS
    SELECT
        tp.track_fid,
        tp.track_seg_point_id,
        tp.ele,
        ST_Length(
            ST_LineSubstring(
                t.the_geom,
                0,
                ST_LineLocatePoint(t.the_geom, tp.the_geom)
            )
        ) AS distance
    FROM geog.track_points tp
    JOIN geog.tracks t ON t.track_id = tp.track_fid;

ALTER TABLE geog.elevation ADD PRIMARY KEY (track_fid, track_seg_point_id);

CREATE VIEW racedata.stages_elevation AS
    SELECT s.stage_id,
        e.ele,
        e.distance
    FROM racedata.stages s
    JOIN geog.elevation e ON s.gpx_id = e.track_fid;
