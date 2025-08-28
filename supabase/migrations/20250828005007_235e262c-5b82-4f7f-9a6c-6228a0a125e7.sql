-- Create a robust server-side status update function that normalizes inputs
create or replace function public.update_stage_status(p_id uuid, p_status text)
returns public.project_stages
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_status public.stage_status;
  v_row public.project_stages;
begin
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

  return v_row;
end;
$$;