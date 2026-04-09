CREATE OR REPLACE FUNCTION public.get_public_table_counts()
RETURNS TABLE(table_name text, row_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::text AS table_name,
    (xpath('/cnt/text()', xml_count))[1]::text::bigint AS row_count
  FROM pg_tables t
  CROSS JOIN LATERAL (
    SELECT query_to_xml(format('SELECT count(*) AS cnt FROM public.%I', t.tablename), false, true, '') AS xml_count
  ) x
  WHERE t.schemaname = 'public';
END;
$$;