-- migrate:up

DROP VIEW racedata.classifications_valid;

SELECT racedata.drop_good_results_view('stage_classification');
DROP TABLE racedata.stage_classification;

SELECT racedata.drop_good_results_view('general_classification');
DROP TABLE racedata.general_classification;

SELECT racedata.drop_good_results_view('points_classification');
DROP TABLE racedata.points_classification;

SELECT racedata.drop_good_results_view('mountain_classification');
DROP TABLE racedata.mountain_classification;

SELECT racedata.drop_good_results_view('young_riders_classification');
DROP TABLE racedata.young_riders_classification;

SELECT racedata.drop_good_results_view('teams_classification');
DROP TABLE racedata.teams_classification;

DROP TABLE results_templates.individual_results;
DROP TABLE results_templates.timed;
DROP TABLE results_templates.pointed;
DROP TABLE results_templates.results;

DROP SCHEMA results_templates;

-- migrate:down

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

INSERT INTO racedata.stage_classification (
    result_id, stage_id, team_id, rank,
    rider_id, time
)
SELECT result_id, stage_id, team_id, rank, rider_id, time
FROM racedata.results_valid
WHERE classification = 'stage';

INSERT INTO racedata.general_classification (
    result_id, stage_id, team_id, rank,
    rider_id, time
)
SELECT result_id, stage_id, team_id, rank, rider_id, time
FROM racedata.results_valid
WHERE classification = 'general';

INSERT INTO racedata.points_classification (
    result_id, stage_id, team_id, rank,
    rider_id, points
)
SELECT result_id, stage_id, team_id, rank, rider_id, points
FROM racedata.results_valid
WHERE classification = 'points';

INSERT INTO racedata.mountain_classification (
    result_id, stage_id, team_id, rank,
    rider_id, points
)
SELECT result_id, stage_id, team_id, rank, rider_id, points
FROM racedata.results_valid
WHERE classification = 'mountains';

INSERT INTO racedata.young_riders_classification (
    result_id, stage_id, team_id, rank,
    rider_id, time
)
SELECT result_id, stage_id, team_id, rank, rider_id, time
FROM racedata.results_valid WHERE classification = 'youth';

INSERT INTO racedata.teams_classification (
    result_id, stage_id, team_id, rank,
    time
)
SELECT result_id, stage_id, team_id, rank, time
FROM racedata.results_valid WHERE classification = 'teams';

SELECT racedata.create_good_results_view('stage_classification');
SELECT racedata.create_good_results_view('general_classification');
SELECT racedata.create_good_results_view('points_classification');
SELECT racedata.create_good_results_view('mountain_classification');
SELECT racedata.create_good_results_view('young_riders_classification');
SELECT racedata.create_good_results_view('teams_classification');
