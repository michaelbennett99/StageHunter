-- migrate:up

CREATE MATERIALIZED VIEW geog.elevation AS
    SELECT
        tp.track_fid,
        tp.track_seg_point_id,
        tp.ele,
        ST_Length(ST_LineSubstring(t.the_geom, 0, ST_LineLocatePoint(t.the_geom, tp.the_geom))) AS distance
    FROM geog.track_points tp
    JOIN geog.tracks t ON t.track_id = tp.track_fid;

CREATE UNIQUE INDEX elevation_pkey
ON geog.elevation (track_fid, track_seg_point_id);


-- migrate:down

DROP MATERIALIZED VIEW geog.elevation;
