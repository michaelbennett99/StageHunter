-- migrate:up

-- move all tables from results_templates to racedata

ALTER TABLE results_templates.timed SET SCHEMA racedata;
ALTER TABLE results_templates.pointed SET SCHEMA racedata;
ALTER TABLE results_templates.individual_results SET SCHEMA racedata;
ALTER TABLE results_templates.results SET SCHEMA racedata;

DROP SCHEMA results_templates;

-- migrate:down

CREATE SCHEMA results_templates;

ALTER TABLE racedata.timed SET SCHEMA results_templates;
ALTER TABLE racedata.pointed SET SCHEMA results_templates;
ALTER TABLE racedata.individual_results SET SCHEMA results_templates;
ALTER TABLE racedata.results SET SCHEMA results_templates;
