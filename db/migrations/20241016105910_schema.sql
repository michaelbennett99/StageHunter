-- migrate:up

-- Postgresql Schema for StageHunter Database

CREATE SCHEMA racedata;
ALTER DATABASE stagehunter SET search_path TO racedata, geog;

-- Types
CREATE TYPE racedata.GrandTour AS ENUM ('TOUR', 'GIRO', 'VUELTA');
CREATE TYPE racedata.StageType AS ENUM ('ROAD', 'ITT', 'TTT', 'PROLOGUE');

-- Domains
CREATE DOMAIN racedata.StageNumber AS INT CHECK (VALUE >= 0 AND VALUE <= 21);

-- Races Table
CREATE TABLE racedata.races (
    race_id INT PRIMARY KEY,
    gt racedata.GrandTour NOT NULL,
    year INT NOT NULL
);

-- Stages Table
CREATE TABLE racedata.stages (
    stage_id INT PRIMARY KEY,
    race_id INT NOT NULL REFERENCES racedata.races(race_id),
    stage_number racedata.StageNumber NOT NULL,
    stage_type racedata.StageType NOT NULL,
    stage_length NUMERIC NOT NULL,
    stage_start TEXT NOT NULL,
    stage_end TEXT NOT NULL,
    gpx_id INT NOT NULL UNIQUE REFERENCES geog.tracks(track_id),
    gpx_accuracy TEXT NOT NULL
);

-- Teams Table
CREATE TABLE racedata.teams (
    team_id INT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Riders Table
CREATE TABLE racedata.riders (
    rider_id INT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL
);

-- Create results tables and templates
CREATE SCHEMA results_templates;

-- Results Parent Table, a template not to be used directly
CREATE TABLE results_templates.results (
    result_id INT PRIMARY KEY,
    stage_id INT NOT NULL REFERENCES racedata.stages(stage_id),
    team_id INT NOT NULL REFERENCES racedata.teams(team_id),
    rank INT NOT NULL
);
REVOKE ALL ON TABLE results_templates.results FROM PUBLIC;

-- Template not to be used directly
CREATE TABLE results_templates.individual_results (
    rider_id INT NOT NULL REFERENCES racedata.riders(rider_id)
);
REVOKE ALL ON TABLE results_templates.individual_results FROM PUBLIC;

-- Template not to be used directly
CREATE TABLE results_templates.timed (
    time TIME
) INHERITS (results_templates.results);
REVOKE ALL ON TABLE results_templates.timed FROM PUBLIC;

-- Template not to be used directly
CREATE TABLE results_templates.pointed (
    points INT
) INHERITS (results_templates.results);
REVOKE ALL ON TABLE results_templates.pointed FROM PUBLIC;

-- Classification Tables
CREATE TABLE racedata.stage_classification (
) INHERITS (results_templates.timed, results_templates.individual_results);
CREATE TABLE racedata.general_classification (
) INHERITS (results_templates.timed, results_templates.individual_results);
CREATE TABLE racedata.points_classification (
) INHERITS (results_templates.pointed, results_templates.individual_results);
CREATE TABLE racedata.mountain_classification (
) INHERITS (results_templates.pointed, results_templates.individual_results);
CREATE TABLE racedata.young_riders_classification (
) INHERITS (results_templates.timed, results_templates.individual_results);
CREATE TABLE racedata.teams_classification (
) INHERITS (results_templates.timed);

-- migrate:down

DROP TABLE racedata.teams_classification;
DROP TABLE racedata.young_riders_classification;
DROP TABLE racedata.mountain_classification;
DROP TABLE racedata.points_classification;
DROP TABLE racedata.general_classification;
DROP TABLE racedata.stage_classification;

DROP TABLE results_templates.pointed;
DROP TABLE results_templates.timed;
DROP TABLE results_templates.individual_results;
DROP TABLE results_templates.results;
DROP SCHEMA results_templates;

DROP TABLE racedata.riders;
DROP TABLE racedata.teams;
DROP TABLE racedata.stages;
DROP TABLE racedata.races;

DROP DOMAIN racedata.StageNumber;

DROP TYPE racedata.StageType;
DROP TYPE racedata.GrandTour;

ALTER DATABASE stagehunter SET search_path TO geog;
DROP SCHEMA racedata;
