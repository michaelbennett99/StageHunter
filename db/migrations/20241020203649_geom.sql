-- This migration converts the geospatial columns to use a geometry type
-- instead of geography. This is done to improve performance and to allow
-- for the use of the geometry type in calculations. We use the 23031 coordinate
-- system, which is ED50 / UTM zone 31N, a good projection for Europe.
--
-- migrate:up

-- Update tracks table
ALTER TABLE geog.tracks
    ALTER COLUMN the_geog TYPE geometry(LineStringZ, 23031)
    USING ST_LineMerge(ST_Transform(the_geog::geometry, 23031));

ALTER TABLE geog.tracks
    RENAME the_geog TO the_geom;

-- Update track_points table

ALTER TABLE geog.track_points
    ALTER COLUMN the_geog TYPE geometry(PointZ, 23031)
    USING ST_Transform(the_geog::geometry, 23031);

ALTER TABLE geog.track_points
    RENAME the_geog TO the_geom;


-- migrate:down

-- revert track_points table
ALTER TABLE geog.track_points
    ALTER COLUMN the_geom TYPE geography
    USING ST_Transform(the_geom, 4326)::geography;

ALTER TABLE geog.track_points
    RENAME the_geom TO the_geog;

-- revert tracks table

ALTER TABLE geog.tracks
    ALTER COLUMN the_geom TYPE geography
    USING ST_Transform(the_geom, 4326)::geography;

ALTER TABLE geog.tracks
    RENAME the_geom TO the_geog;
