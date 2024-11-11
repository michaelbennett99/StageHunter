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
-- Name: get_random_stage_id(); Type: FUNCTION; Schema: racedata; Owner: -
--

CREATE FUNCTION racedata.get_random_stage_id() RETURNS bigint
    LANGUAGE sql STABLE PARALLEL SAFE
    AS $$
    SELECT
        (random() * (max_id - min_id) + min_id)::bigint AS stage_id
    FROM (
        SELECT
            MIN(stage_id) AS min_id,
            MAX(stage_id) AS max_id
        FROM racedata.stages
    ) subquery;
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
-- Name: elevation; Type: MATERIALIZED VIEW; Schema: geog; Owner: -
--

CREATE MATERIALIZED VIEW geog.elevation AS
 WITH segments AS (
         SELECT track_points.track_fid,
            track_points.track_seg_point_id,
            track_points.ele,
            geog.st_length(geog.st_makeline(lag(track_points.the_geom, 1, track_points.the_geom) OVER (PARTITION BY track_points.track_fid ORDER BY track_points.track_seg_point_id), track_points.the_geom)) AS distance,
            track_points.the_geom
           FROM geog.track_points
        )
 SELECT track_fid,
    track_seg_point_id,
    ele AS elevation,
    sum(distance) OVER (PARTITION BY track_fid ORDER BY track_seg_point_id) AS distance
   FROM segments
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
-- Name: schema_migrations; Type: TABLE; Schema: migrations; Owner: -
--

CREATE TABLE migrations.schema_migrations (
    version character varying(128) NOT NULL
);


--
-- Name: daily; Type: TABLE; Schema: racedata; Owner: -
--

CREATE TABLE racedata.daily (
    daily_id integer NOT NULL,
    stage_id integer NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL
);


--
-- Name: daily_daily_id_seq; Type: SEQUENCE; Schema: racedata; Owner: -
--

CREATE SEQUENCE racedata.daily_daily_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: daily_daily_id_seq; Type: SEQUENCE OWNED BY; Schema: racedata; Owner: -
--

ALTER SEQUENCE racedata.daily_daily_id_seq OWNED BY racedata.daily.daily_id;


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
-- Name: results; Type: TABLE; Schema: racedata; Owner: -
--

CREATE TABLE racedata.results (
    result_id integer NOT NULL,
    stage_id integer NOT NULL,
    rank racedata.rank_type NOT NULL,
    classification racedata.classification_type NOT NULL,
    team_id integer NOT NULL,
    rider_id integer,
    "time" interval,
    points integer,
    CONSTRAINT classification_and_time_points CHECK ((((classification = 'stage'::racedata.classification_type) AND (points IS NULL)) OR ((classification = 'general'::racedata.classification_type) AND (points IS NULL)) OR ((classification = 'points'::racedata.classification_type) AND ("time" IS NULL)) OR ((classification = 'mountains'::racedata.classification_type) AND ("time" IS NULL)) OR ((classification = 'youth'::racedata.classification_type) AND (points IS NULL)) OR ((classification = 'teams'::racedata.classification_type) AND (points IS NULL)))),
    CONSTRAINT not_both_time_and_points_non_null CHECK ((("time" IS NULL) OR (points IS NULL))),
    CONSTRAINT rider_id_null_for_teams CHECK ((((classification <> 'teams'::racedata.classification_type) AND (rider_id IS NOT NULL)) OR ((classification = 'teams'::racedata.classification_type) AND (rider_id IS NULL))))
);


--
-- Name: results_result_id_seq; Type: SEQUENCE; Schema: racedata; Owner: -
--

CREATE SEQUENCE racedata.results_result_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: results_result_id_seq; Type: SEQUENCE OWNED BY; Schema: racedata; Owner: -
--

ALTER SEQUENCE racedata.results_result_id_seq OWNED BY racedata.results.result_id;


--
-- Name: results_valid; Type: VIEW; Schema: racedata; Owner: -
--

CREATE VIEW racedata.results_valid AS
 SELECT result_id,
    stage_id,
    row_number() OVER (PARTITION BY stage_id, classification ORDER BY (rank).num) AS rank,
    classification,
    team_id,
    rider_id,
    "time",
    points
   FROM racedata.results
  WHERE ((rank).info = 'VAL'::racedata.rank_enum);


--
-- Name: riders; Type: TABLE; Schema: racedata; Owner: -
--

CREATE TABLE racedata.riders (
    rider_id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL
);


--
-- Name: teams; Type: TABLE; Schema: racedata; Owner: -
--

CREATE TABLE racedata.teams (
    team_id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: riders_teams_results; Type: VIEW; Schema: racedata; Owner: -
--

CREATE VIEW racedata.riders_teams_results AS
 SELECT rv.stage_id,
    rv.rank,
        CASE
            WHEN (rv.classification <> 'teams'::racedata.classification_type) THEN ((r.first_name || ' '::text) || r.last_name)
            ELSE NULL::text
        END AS rider,
    t.name AS team,
    rv."time",
    rv.points,
    rv.classification
   FROM ((racedata.results_valid rv
     LEFT JOIN racedata.riders r ON ((rv.rider_id = r.rider_id)))
     LEFT JOIN racedata.teams t ON ((rv.team_id = t.team_id)));


--
-- Name: stages_elevation; Type: VIEW; Schema: racedata; Owner: -
--

CREATE VIEW racedata.stages_elevation AS
 SELECT s.stage_id,
    e.elevation,
    e.distance
   FROM (racedata.stages s
     JOIN geog.elevation e ON ((s.gpx_id = e.track_fid)));


--
-- Name: track_points ogc_fid; Type: DEFAULT; Schema: geog; Owner: -
--

ALTER TABLE ONLY geog.track_points ALTER COLUMN ogc_fid SET DEFAULT nextval('geog.track_points_ogc_fid_seq'::regclass);


--
-- Name: daily daily_id; Type: DEFAULT; Schema: racedata; Owner: -
--

ALTER TABLE ONLY racedata.daily ALTER COLUMN daily_id SET DEFAULT nextval('racedata.daily_daily_id_seq'::regclass);


--
-- Name: results result_id; Type: DEFAULT; Schema: racedata; Owner: -
--

ALTER TABLE ONLY racedata.results ALTER COLUMN result_id SET DEFAULT nextval('racedata.results_result_id_seq'::regclass);


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
-- Name: daily daily_pkey; Type: CONSTRAINT; Schema: racedata; Owner: -
--

ALTER TABLE ONLY racedata.daily
    ADD CONSTRAINT daily_pkey PRIMARY KEY (daily_id);


--
-- Name: races races_pkey; Type: CONSTRAINT; Schema: racedata; Owner: -
--

ALTER TABLE ONLY racedata.races
    ADD CONSTRAINT races_pkey PRIMARY KEY (race_id);


--
-- Name: results results_pkey; Type: CONSTRAINT; Schema: racedata; Owner: -
--

ALTER TABLE ONLY racedata.results
    ADD CONSTRAINT results_pkey PRIMARY KEY (result_id);


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
-- Name: elevation_track_fid_track_seg_point_id_idx; Type: INDEX; Schema: geog; Owner: -
--

CREATE UNIQUE INDEX elevation_track_fid_track_seg_point_id_idx ON geog.elevation USING btree (track_fid, track_seg_point_id);


--
-- Name: track_points_the_geog_geom_idx; Type: INDEX; Schema: geog; Owner: -
--

CREATE INDEX track_points_the_geog_geom_idx ON geog.track_points USING gist (the_geom);


--
-- Name: track_points_track_seg_idx; Type: INDEX; Schema: geog; Owner: -
--

CREATE INDEX track_points_track_seg_idx ON geog.track_points USING btree (track_fid, track_seg_point_id);


--
-- Name: tracks_the_geog_geom_idx; Type: INDEX; Schema: geog; Owner: -
--

CREATE INDEX tracks_the_geog_geom_idx ON geog.tracks USING gist (the_geom);


--
-- Name: daily_date_idx; Type: INDEX; Schema: racedata; Owner: -
--

CREATE INDEX daily_date_idx ON racedata.daily USING btree (date);


--
-- Name: daily_stage_id_idx; Type: INDEX; Schema: racedata; Owner: -
--

CREATE INDEX daily_stage_id_idx ON racedata.daily USING btree (stage_id);


--
-- Name: results_stage_id_classification_idx; Type: INDEX; Schema: racedata; Owner: -
--

CREATE INDEX results_stage_id_classification_idx ON racedata.results USING btree (stage_id, classification);


--
-- Name: track_points track_points_track_id_fkey; Type: FK CONSTRAINT; Schema: geog; Owner: -
--

ALTER TABLE ONLY geog.track_points
    ADD CONSTRAINT track_points_track_id_fkey FOREIGN KEY (track_fid) REFERENCES geog.tracks(track_id);


--
-- Name: daily daily_stage_id_fkey; Type: FK CONSTRAINT; Schema: racedata; Owner: -
--

ALTER TABLE ONLY racedata.daily
    ADD CONSTRAINT daily_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES racedata.stages(stage_id);


--
-- Name: results results_rider_id_fkey; Type: FK CONSTRAINT; Schema: racedata; Owner: -
--

ALTER TABLE ONLY racedata.results
    ADD CONSTRAINT results_rider_id_fkey FOREIGN KEY (rider_id) REFERENCES racedata.riders(rider_id);


--
-- Name: results results_stage_id_fkey; Type: FK CONSTRAINT; Schema: racedata; Owner: -
--

ALTER TABLE ONLY racedata.results
    ADD CONSTRAINT results_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES racedata.stages(stage_id);


--
-- Name: results results_team_id_fkey; Type: FK CONSTRAINT; Schema: racedata; Owner: -
--

ALTER TABLE ONLY racedata.results
    ADD CONSTRAINT results_team_id_fkey FOREIGN KEY (team_id) REFERENCES racedata.teams(team_id);


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
    ('20241028114704'),
    ('20241028120645'),
    ('20241028121149'),
    ('20241030125825'),
    ('20241030132510'),
    ('20241030133211'),
    ('20241030133930'),
    ('20241030135526'),
    ('20241030141025'),
    ('20241030143326'),
    ('20241030191710'),
    ('20241030213402'),
    ('20241030215240'),
    ('20241031205705'),
    ('20241111112453');
