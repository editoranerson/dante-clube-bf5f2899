create or replace function public.set_default_dante_avatar(_avatar_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'not allowed';
  end if;
  update public.dante_avatars set is_default = false where is_default and id <> _avatar_id;
  update public.dante_avatars set is_default = true where id = _avatar_id;
end $$;
revoke execute on function public.set_default_dante_avatar(uuid) from public, anon;
grant execute on function public.set_default_dante_avatar(uuid) to authenticated;