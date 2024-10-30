-- migrate:up

DROP VIEW racedata.stages_elevation;

DROP VIEW geog.elevation;

CREATE MATERIALIZED VIEW geog.elevation AS
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
        ele AS elevation,
        SUM(distance) OVER(PARTITION BY track_fid ORDER BY track_seg_point_id) AS distance
    FROM segments;

CREATE UNIQUE INDEX ON geog.elevation (track_fid, track_seg_point_id);

CREATE VIEW racedata.stages_elevation AS
    SELECT s.stage_id,
        e.elevation,
        e.distance
    FROM racedata.stages s
    JOIN geog.elevation e ON s.gpx_id = e.track_fid;

-- migrate:down

DROP VIEW racedata.stages_elevation;

DROP MATERIALIZED VIEW geog.elevation;

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
