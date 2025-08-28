-- Fix the update_stage_status function to use SECURITY DEFINER
-- This allows the function to bypass RLS policies when updating stages
CREATE OR REPLACE FUNCTION public.update_stage_status(p_id uuid, p_status text)
 RETURNS project_stages
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_status public.stage_status;
  v_row public.project_stages;
begin
  -- Validate that the user owns the project for this stage
  IF NOT EXISTS (
    SELECT 1 FROM public.project_stages ps
    JOIN public.projects p ON p.id = ps.project_id
    WHERE ps.id = p_id AND p.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: You do not own this project stage';
  END IF;

  -- Normalize status text (case-insensitive, handle common Portuguese labels)
  case lower(p_status)
    when 'finalizado' then v_status := 'finalizado';
    when 'finalizados' then v_status := 'finalizado';
    when 'concluido' then v_status := 'finalizado';
    when 'concluído' then v_status := 'finalizado';
    when 'andamento' then v_status := 'andamento';
    when 'em andamento' then v_status := 'andamento';
    when 'proximo' then v_status := 'proximo';
    when 'próximo' then v_status := 'proximo';
    else
      raise exception 'Invalid stage status: %', p_status;
  end case;

  update public.project_stages
  set status = v_status,
      updated_at = now()
  where id = p_id
  returning * into v_row;

  IF v_row IS NULL THEN
    RAISE EXCEPTION 'Failed to update stage status - stage not found';
  END IF;

  return v_row;
end;
$function$