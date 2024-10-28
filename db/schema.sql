SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: geog; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA geog;


--
-- Name: migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA migrations;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: racedata; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA racedata;


--
-- Name: classification_type; Type: TYPE; Schema: racedata; Owner: -
--

CREATE TYPE racedata.classification_type AS ENUM (
    'stage',
    'general',
    'points',
    'mountains',
    'youth',
    'teams'
);


--
-- Name: grandtour; Type: TYPE; Schema: racedata; Owner: -
--

CREATE TYPE racedata.grandtour AS ENUM (
    'TOUR',
    'GIRO',
    'VUELTA'
);


--
-- Name: rank_enum; Type: TYPE; Schema: racedata; Owner: -
--

CREATE TYPE racedata.rank_enum AS ENUM (
    'VAL',
    'DNF',
    'DNS',
    'OTL',
    'DF',
    'NR',
    'DSQ'
);


--
-- Name: rank_type; Type: TYPE; Schema: racedata; Owner: -
--

CREATE TYPE racedata.rank_type AS (
	num integer,
	info racedata.rank_enum
);


--
-- Name: stagenumber; Type: DOMAIN; Schema: racedata; Owner: -
--

CREATE DOMAIN racedata.stagenumber AS integer
	CONSTRAINT stagenumber_check CHECK (((VALUE >= 0) AND (VALUE <= 21)));


--
-- Name: stagetype; Type: TYPE; Schema: racedata; Owner: -
--

CREATE TYPE racedata.stagetype AS ENUM (
    'ROAD',
    'ITT',
    'TTT',
    'PROLOGUE'
);


--
-- Name: get_children(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_children(parent_table text, child_schema text) RETURNS TABLE(table_name name)
    LANGUAGE plpgsql
    AS $$
DECLARE
    parent_schema text;
    parent_table_name text;
BEGIN
    IF parent_table LIKE '%.%.%' THEN
        -- reject
        RAISE EXCEPTION 'Parent table cannot have more than two parts';
    ELSEIF parent_table LIKE '%.%' THEN
        SELECT split_part(parent_table, '.', 1) INTO parent_schema;
        SELECT split_part(parent_table, '.', 2) INTO parent_table_name;
    ELSE
        parent_table_name := parent_table;
        SELECT n.nspname INTO parent_schema
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = parent_table
        AND pg_table_is_visible(c.oid);

        IF parent_schema IS NULL THEN
            RAISE EXCEPTION 'Table "%" not found in search path', parent_table;
        END IF;
    END IF;

    RETURN QUERY
    WITH RECURSIVE inheritance_tree AS (
        -- Base case: direct children
        SELECT c.oid, c.relname, c.relnamespace
        FROM pg_inherits i
        JOIN pg_class c ON c.oid = i.inhrelid
        JOIN pg_class p ON p.oid = i.inhparent
        WHERE
            p.relname = parent_table_name
            AND p.relnamespace = (
                SELECT oid
                FROM pg_namespace
                WHERE nspname = parent_schema
            )

        UNION ALL

        -- Recursive case: indirect children
        SELECT c.oid, c.relname, c.relnamespace
        FROM pg_inherits i
        JOIN pg_class c ON c.oid = i.inhrelid
        JOIN inheritance_tree it ON it.oid = i.inhparent
    )
    SELECT it.relname AS table_name
    FROM inheritance_tree it
    JOIN pg_namespace ns ON ns.oid = it.relnamespace
    WHERE ns.nspname = child_schema;
END;
$$;


--
-- Name: create_good_results_view(text); Type: FUNCTION; Schema: racedata; Owner: -
--

CREATE FUNCTION racedata.create_good_results_view(table_name text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    view_name text;
BEGIN
    -- TODO: check if table exists in racedata schema
    IF NOT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE tablename = table_name AND schemaname = 'racedata'
    ) THEN
        RAISE EXCEPTION 'Table % does not exist in racedata schema', table_name;
    END IF;

    SELECT table_name || '_valid' INTO view_name;

    EXECUTE format('
        CREATE VIEW racedata.%I AS
            SELECT
                *,
                ROW_NUMBER()
                OVER (PARTITION BY stage_id ORDER BY (rank).num) AS rn
            FROM racedata.%I
            WHERE (rank).info = ''VAL'';
    ', view_name, table_name);
END;
$$;


--
-- Name: drop_good_results_view(text); Type: FUNCTION; Schema: racedata; Owner: -
--

CREATE FUNCTION racedata.drop_good_results_view(table_name text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    view_name text;
BEGIN
    SELECT table_name || '_valid' INTO view_name;
    EXECUTE format('DROP VIEW IF EXISTS racedata.%I', view_name);
END;
$$;


--
-- Name: get_results(bigint, bigint); Type: FUNCTION; Schema: racedata; Owner: -
--

CREATE FUNCTION racedata.get_results(p_stage_id bigint, p_top_n bigint) RETURNS TABLE(rank bigint, rider text, team text, "time" interval, points integer, classification racedata.classification_type)
    LANGUAGE sql STABLE PARALLEL SAFE
    AS $$
    SELECT
        c.rn AS rank,
        CASE WHEN c.classification != 'teams'
            THEN r.first_name || ' ' || r.last_name
            ELSE NULL
        END AS rider,
        t.name AS team,
        c.time AS time,
        c.points AS points,
        c.classification AS classification
    FROM racedata.classifications_valid c
    LEFT JOIN racedata.riders r ON c.rider_id = r.rider_id
    LEFT JOIN racedata.teams t ON c.team_id = t.team_id
    WHERE
        c.stage_id = p_stage_id
        AND c.rn <= p_top_n
    ORDER BY c.classification, c.rn ASC;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: track_points; Type: TABLE; Schema: geog; Owner: -
--

CREATE TABLE geog.track_points (
    ogc_fid integer NOT NULL,
    track_fid integer,
    track_seg_id integer,
    track_seg_point_id integer,
    ele double precision,
    "time" timestamp with time zone,
    the_geom geog.geometry(PointZ,23031)
);


--
-- Name: tracks; Type: TABLE; Schema: geog; Owner: -
--

CREATE TABLE geog.tracks (
    track_id integer NOT NULL,
    name character varying,
    src character varying,
    link1_href character varying,
    link1_text character varying,
    the_geom geog.geometry(LineStringZ,23031)
);


--
-- Name: elevation; Type: MATERIALIZED VIEW; Schema: geog; Owner: -
--

CREATE MATERIALIZED VIEW geog.elevation AS
 SELECT tp.track_fid,
    tp.track_seg_point_id,
    tp.ele,
    geog.st_length(geog.st_linesubstring(t.the_geom, (0)::double precision, geog.st_linelocatepoint(t.the_geom, tp.the_geom))) AS distance
   FROM (geog.track_points tp
     JOIN geog.tracks t ON ((t.track_id = tp.track_fid)))
  WITH NO DATA;


--
-- Name: track_points_ogc_fid_seq; Type: SEQUENCE; Schema: geog; Owner: -
--

CREATE SEQUENCE geog.track_points_ogc_fid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: track_points_ogc_fid_seq; Type: SEQUENCE OWNED BY; Schema: geog; Owner: -
--

ALTER SEQUENCE geog.track_points_ogc_fid_seq OWNED BY geog.track_points.ogc_fid;


--
-- Name: schema_migrations; Type: TABLE; Schema: migrations; Owner: -
--

CREATE TABLE migrations.schema_migrations (
    version character varying(128) NOT NULL
);


--
-- Name: general_classification; Type: TABLE; Schema: racedata; Owner: -
--

CREATE TABLE racedata.general_classification (
)
INHERITS (results_templates.timed, results_templates.individual_results);


--
-- Name: general_classification_valid; Type: VIEW; Schema: racedata; Owner: -
--

CREATE VIEW racedata.general_classification_valid AS
 SELECT result_id,
    stage_id,
    team_id,
    rank,
    "time",
    rider_id,
    row_number() OVER (PARTITION BY stage_id ORDER BY (rank).num) AS rn
   FROM racedata.general_classification
  WHERE ((rank).info = 'VAL'::racedata.rank_enum);


--
-- Name: mountain_classification; Type: TABLE; Schema: racedata; Owner: -
--

CREATE TABLE racedata.mountain_classification (
)
INHERITS (results_templates.pointed, results_templates.individual_results);


--
-- Name: mountain_classification_valid; Type: VIEW; Schema: racedata; Owner: -
--

CREATE VIEW racedata.mountain_classification_valid AS
 SELECT result_id,
    stage_id,
    team_id,
    rank,
    points,
    rider_id,
    row_number() OVER (PARTITION BY stage_id ORDER BY (rank).num) AS rn
   FROM racedata.mountain_classification
  WHERE ((rank).info = 'VAL'::racedata.rank_enum);


--
-- Name: points_classification; Type: TABLE; Schema: racedata; Owner: -
--

CREATE TABLE racedata.points_classification (
)
INHERITS (results_templates.pointed, results_templates.individual_results);


--
-- Name: points_classification_valid; Type: VIEW; Schema: racedata; Owner: -
--

CREATE VIEW racedata.points_classification_valid AS
 SELECT result_id,
    stage_id,
    team_id,
    rank,
    points,
    rider_id,
    row_number() OVER (PARTITION BY stage_id ORDER BY (rank).num) AS rn
   FROM racedata.points_classification
  WHERE ((rank).info = 'VAL'::racedata.rank_enum);


--
-- Name: stage_classification; Type: TABLE; Schema: racedata; Owner: -
--

CREATE TABLE racedata.stage_classification (
)
INHERITS (results_templates.timed, results_templates.individual_results);


--
-- Name: stage_classification_valid; Type: VIEW; Schema: racedata; Owner: -
--

CREATE VIEW racedata.stage_classification_valid AS
 SELECT result_id,
    stage_id,
    team_id,
    rank,
    "time",
    rider_id,
    row_number() OVER (PARTITION BY stage_id ORDER BY (rank).num) AS rn
   FROM racedata.stage_classification
  WHERE ((rank).info = 'VAL'::racedata.rank_enum);


--
-- Name: teams_classification; Type: TABLE; Schema: racedata; Owner: -
--

CREATE TABLE racedata.teams_classification (
)
INHERITS (results_templates.timed);


--
-- Name: teams_classification_valid; Type: VIEW; Schema: racedata; Owner: -
--

CREATE VIEW racedata.teams_classification_valid AS
 SELECT result_id,
    stage_id,
    team_id,
    rank,
    "time",
    row_number() OVER (PARTITION BY stage_id ORDER BY (rank).num) AS rn
   FROM racedata.teams_classification
  WHERE ((rank).info = 'VAL'::racedata.rank_enum);


--
-- Name: young_riders_classification; Type: TABLE; Schema: racedata; Owner: -
--

CREATE TABLE racedata.young_riders_classification (
)
INHERITS (results_templates.timed, results_templates.individual_results);


--
-- Name: young_riders_classification_valid; Type: VIEW; Schema: racedata; Owner: -
--

CREATE VIEW racedata.young_riders_classification_valid AS
 SELECT result_id,
    stage_id,
    team_id,
    rank,
    "time",
    rider_id,
    row_number() OVER (PARTITION BY stage_id ORDER BY (rank).num) AS rn
   FROM racedata.young_riders_classification
  WHERE ((rank).info = 'VAL'::racedata.rank_enum);


--
-- Name: classifications_valid; Type: VIEW; Schema: racedata; Owner: -
--

CREATE VIEW racedata.classifications_valid AS
 SELECT stage_classification_valid.stage_id,
    stage_classification_valid.rn,
    stage_classification_valid.rider_id,
    stage_classification_valid.team_id,
    stage_classification_valid."time",
    NULL::integer AS points,
    'stage'::racedata.classification_type AS classification
   FROM racedata.stage_classification_valid
UNION ALL
 SELECT general_classification_valid.stage_id,
    general_classification_valid.rn,
    general_classification_valid.rider_id,
    general_classification_valid.team_id,
    general_classification_valid."time",
    NULL::integer AS points,
    'general'::racedata.classification_type AS classification
   FROM racedata.general_classification_valid
UNION ALL
 SELECT points_classification_valid.stage_id,
    points_classification_valid.rn,
    points_classification_valid.rider_id,
    points_classification_valid.team_id,
    NULL::interval AS "time",
    points_classification_valid.points,
    'points'::racedata.classification_type AS classification
   FROM racedata.points_classification_valid
UNION ALL
 SELECT mountain_classification_valid.stage_id,
    mountain_classification_valid.rn,
    mountain_classification_valid.rider_id,
    mountain_classification_valid.team_id,
    NULL::interval AS "time",
    mountain_classification_valid.points,
    'mountains'::racedata.classification_type AS classification
   FROM racedata.mountain_classification_valid
UNION ALL
 SELECT young_riders_classification_valid.stage_id,
    young_riders_classification_valid.rn,
    young_riders_classification_valid.rider_id,
    young_riders_classification_valid.team_id,
    young_riders_classification_valid."time",
    NULL::integer AS points,
    'youth'::racedata.classification_type AS classification
   FROM racedata.young_riders_classification_valid
UNION ALL
 SELECT teams_classification_valid.stage_id,
    teams_classification_valid.rn,
    NULL::integer AS rider_id,
    teams_classification_valid.team_id,
    teams_classification_valid."time",
    NULL::integer AS points,
    'teams'::racedata.classification_type AS classification
   FROM racedata.teams_classification_valid;


--
-- Name: races; Type: TABLE; Schema: racedata; Owner: -
--

CREATE TABLE racedata.races (
    race_id integer NOT NULL,
    gt racedata.grandtour NOT NULL,
    year integer NOT NULL
);


--
-- Name: stages; Type: TABLE; Schema: racedata; Owner: -
--

CREATE TABLE racedata.stages (
    stage_id integer NOT NULL,
    race_id integer NOT NULL,
    stage_number racedata.stagenumber NOT NULL,
    stage_type racedata.stagetype NOT NULL,
    stage_length numeric NOT NULL,
    stage_start text NOT NULL,
    stage_end text NOT NULL,
    gpx_id integer NOT NULL,
    gpx_accuracy text NOT NULL
);


--
-- Name: races_stages; Type: VIEW; Schema: racedata; Owner: -
--

CREATE VIEW racedata.races_stages AS
 SELECT r.race_id,
    r.gt,
    r.year,
    s.stage_id,
    s.stage_number,
    s.stage_type,
    s.stage_length,
    s.stage_start,
    s.stage_end,
    s.gpx_id
   FROM (racedata.races r
     JOIN racedata.stages s ON ((r.race_id = s.race_id)));


--
-- Name: races_stages_tracks; Type: VIEW; Schema: racedata; Owner: -
--

CREATE VIEW racedata.races_stages_tracks AS
 SELECT rs.race_id,
    rs.gt,
    rs.year,
    rs.stage_id,
    rs.stage_number,
    rs.stage_type,
    rs.stage_length,
    rs.stage_start,
    rs.stage_end,
    rs.gpx_id,
    t.the_geom
   FROM (racedata.races_stages rs
     JOIN geog.tracks t ON ((rs.gpx_id = t.track_id)));


--
-- Name: riders; Type: TABLE; Schema: racedata; Owner: -
--

CREATE TABLE racedata.riders (
    rider_id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL
);


--
-- Name: stages_elevation; Type: VIEW; Schema: racedata; Owner: -
--

CREATE VIEW racedata.stages_elevation AS
 SELECT s.stage_id,
    e.ele,
    e.distance
   FROM (racedata.stages s
     JOIN geog.elevation e ON ((s.gpx_id = e.track_fid)));


--
-- Name: teams; Type: TABLE; Schema: racedata; Owner: -
--

CREATE TABLE racedata.teams (
    team_id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: track_points ogc_fid; Type: DEFAULT; Schema: geog; Owner: -
--

ALTER TABLE ONLY geog.track_points ALTER COLUMN ogc_fid SET DEFAULT nextval('geog.track_points_ogc_fid_seq'::regclass);


--
-- Name: track_points track_points_pkey; Type: CONSTRAINT; Schema: geog; Owner: -
--

ALTER TABLE ONLY geog.track_points
    ADD CONSTRAINT track_points_pkey PRIMARY KEY (ogc_fid);


--
-- Name: tracks tracks_pkey; Type: CONSTRAINT; Schema: geog; Owner: -
--

ALTER TABLE ONLY geog.tracks
    ADD CONSTRAINT tracks_pkey PRIMARY KEY (track_id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: migrations; Owner: -
--

ALTER TABLE ONLY migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: races races_pkey; Type: CONSTRAINT; Schema: racedata; Owner: -
--

ALTER TABLE ONLY racedata.races
    ADD CONSTRAINT races_pkey PRIMARY KEY (race_id);


--
-- Name: riders riders_pkey; Type: CONSTRAINT; Schema: racedata; Owner: -
--

ALTER TABLE ONLY racedata.riders
    ADD CONSTRAINT riders_pkey PRIMARY KEY (rider_id);


--
-- Name: stages stages_gpx_id_key; Type: CONSTRAINT; Schema: racedata; Owner: -
--

ALTER TABLE ONLY racedata.stages
    ADD CONSTRAINT stages_gpx_id_key UNIQUE (gpx_id);


--
-- Name: stages stages_pkey; Type: CONSTRAINT; Schema: racedata; Owner: -
--

ALTER TABLE ONLY racedata.stages
    ADD CONSTRAINT stages_pkey PRIMARY KEY (stage_id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: racedata; Owner: -
--

ALTER TABLE ONLY racedata.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (team_id);


--
-- Name: elevation_pkey; Type: INDEX; Schema: geog; Owner: -
--

CREATE UNIQUE INDEX elevation_pkey ON geog.elevation USING btree (track_fid, track_seg_point_id);


--
-- Name: track_points_the_geog_geom_idx; Type: INDEX; Schema: geog; Owner: -
--

CREATE INDEX track_points_the_geog_geom_idx ON geog.track_points USING gist (the_geom);


--
-- Name: tracks_the_geog_geom_idx; Type: INDEX; Schema: geog; Owner: -
--

CREATE INDEX tracks_the_geog_geom_idx ON geog.tracks USING gist (the_geom);


--
-- Name: track_points track_points_track_id_fkey; Type: FK CONSTRAINT; Schema: geog; Owner: -
--

ALTER TABLE ONLY geog.track_points
    ADD CONSTRAINT track_points_track_id_fkey FOREIGN KEY (track_fid) REFERENCES geog.tracks(track_id);


--
-- Name: stages stages_gpx_id_fkey; Type: FK CONSTRAINT; Schema: racedata; Owner: -
--

ALTER TABLE ONLY racedata.stages
    ADD CONSTRAINT stages_gpx_id_fkey FOREIGN KEY (gpx_id) REFERENCES geog.tracks(track_id);


--
-- Name: stages stages_race_id_fkey; Type: FK CONSTRAINT; Schema: racedata; Owner: -
--

ALTER TABLE ONLY racedata.stages
    ADD CONSTRAINT stages_race_id_fkey FOREIGN KEY (race_id) REFERENCES racedata.races(race_id);


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO migrations.schema_migrations (version) VALUES
    ('20241016105910'),
    ('20241019163932'),
    ('20241020203649'),
    ('20241020203650'),
    ('20241020211241'),
    ('20241021095112'),
    ('20241021131053'),
    ('20241021140020'),
    ('20241021143302'),
    ('20241022103005'),
    ('20241022105526'),
    ('20241022110224'),
    ('20241022111357'),
    ('20241022190726'),
    ('20241028111420'),
    ('20241028114704');
