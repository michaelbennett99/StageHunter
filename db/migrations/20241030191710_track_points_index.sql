-- migrate:up

CREATE INDEX track_points_track_seg_idx ON geog.track_points (
    track_fid, track_seg_point_id
);

-- migrate:down

DROP INDEX geog.track_points_track_seg_idx;
