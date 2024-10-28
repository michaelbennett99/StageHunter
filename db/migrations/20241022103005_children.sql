-- migrate:up

CREATE FUNCTION public.get_children(
    parent_table text,
    child_schema text
)
RETURNS TABLE (table_name name)
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

-- migrate:down

DROP FUNCTION public.get_children(text, text);
