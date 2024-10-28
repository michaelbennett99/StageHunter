-- migrate:up

WITH tables AS (
    SELECT get_children('results_templates.results', 'racedata')
    AS table_name
)
SELECT racedata.create_good_results_view(table_name)
FROM tables;


-- migrate:down

WITH tables AS (
    SELECT get_children('results_templates.results', 'racedata')
    AS table_name
)
SELECT racedata.drop_good_results_view(table_name)
FROM tables;
