create type public.app_role as enum ('admin', 'partner');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create policy "Users read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default 'tag',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "Anyone reads categories" on public.categories for select to anon, authenticated using (true);
create policy "Admins manage categories" on public.categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  logo_url text,
  website text,
  address text,
  owner_id uuid,
  owner_email text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.stores to authenticated;
grant all on public.stores to service_role;
alter table public.stores enable row level security;
create policy "Admins manage stores" on public.stores for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Partners read own store" on public.stores for select to authenticated
  using (owner_id = auth.uid());
create policy "Partners update own store" on public.stores for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create or replace function public.owns_store(_store_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.stores where id = _store_id and owner_id = auth.uid())
$$;

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  description text not null default '',
  discount_label text not null default '',
  coupon_code text,
  action_type text not null default 'loja' check (action_type in ('google_play','loja','endereco')),
  action_url text,
  address text,
  cover_url text,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.offers to authenticated;
grant all on public.offers to service_role;
alter table public.offers enable row level security;
create policy "Admins manage offers" on public.offers for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Partners manage own offers" on public.offers for all to authenticated
  using (public.owns_store(store_id)) with check (public.owns_store(store_id));

create sequence public.associate_number_seq start with 100 minvalue 100;
create table public.associates (
  id uuid primary key default gen_random_uuid(),
  main_user_id uuid not null unique,
  member_number int not null unique default nextval('public.associate_number_seq'),
  full_name text not null default '',
  email text not null default '',
  avatar_url text,
  status text not null default 'ativo' check (status in ('ativo','descredenciado')),
  validation_code text not null unique default ('DC' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8))),
  created_at timestamptz not null default now()
);
alter sequence public.associate_number_seq owned by public.associates.member_number;
grant select, update on public.associates to authenticated;
grant all on public.associates to service_role;
grant usage, select on sequence public.associate_number_seq to service_role;
alter table public.associates enable row level security;
create policy "Admins read associates" on public.associates for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update associates" on public.associates for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.validate_associate(_query text)
returns table (member_number int, full_name text, status text, since timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare q text;
begin
  if not (public.has_role(auth.uid(), 'partner') or public.has_role(auth.uid(), 'admin')) then
    raise exception 'not allowed';
  end if;
  q := upper(trim(coalesce(_query, '')));
  if position('/' in q) > 0 then
    q := regexp_replace(q, '^.*/', '');
  end if;
  if q ~ '^D-?[0-9]+$' then
    return query select a.member_number, a.full_name, a.status, a.created_at
      from public.associates a where a.member_number = regexp_replace(q, '[^0-9]', '', 'g')::int;
  elsif q ~ '^[0-9]+$' then
    return query select a.member_number, a.full_name, a.status, a.created_at
      from public.associates a where a.member_number = q::int;
  else
    return query select a.member_number, a.full_name, a.status, a.created_at
      from public.associates a where a.validation_code = q;
  end if;
end $$;
revoke execute on function public.validate_associate(text) from public, anon;
grant execute on function public.validate_associate(text) to authenticated;

create or replace function public.public_validate(_code text)
returns table (member_number int, first_name text, status text, since timestamptz)
language sql stable security definer set search_path = public as $$
  select a.member_number, split_part(a.full_name, ' ', 1), a.status, a.created_at
  from public.associates a where a.validation_code = upper(trim(_code)) limit 1
$$;
grant execute on function public.public_validate(text) to anon, authenticated;

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  platform text not null default '',
  description text not null default '',
  reward text not null default '',
  url text not null default '',
  steps text[] not null default '{}',
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.missions to anon, authenticated;
grant insert, update, delete on public.missions to authenticated;
grant all on public.missions to service_role;
alter table public.missions enable row level security;
create policy "Anyone reads active missions" on public.missions for select to anon, authenticated
  using (active or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage missions" on public.missions for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.pages (
  slug text primary key,
  title text not null,
  content text not null default '',
  updated_at timestamptz not null default now()
);
grant select on public.pages to anon, authenticated;
grant update on public.pages to authenticated;
grant all on public.pages to service_role;
alter table public.pages enable row level security;
create policy "Anyone reads pages" on public.pages for select to anon, authenticated using (true);
create policy "Admins update pages" on public.pages for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.settings (
  key text primary key,
  value text not null default ''
);
grant select on public.settings to anon, authenticated;
grant insert, update on public.settings to authenticated;
grant all on public.settings to service_role;
alter table public.settings enable row level security;
create policy "Anyone reads settings" on public.settings for select to anon, authenticated using (true);
create policy "Admins write settings" on public.settings for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Public read club media" on storage.objects for select to anon, authenticated
  using (bucket_id = 'club-media');
create policy "Staff upload club media" on storage.objects for insert to authenticated
  with check (bucket_id = 'club-media' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'partner')));
create policy "Staff update club media" on storage.objects for update to authenticated
  using (bucket_id = 'club-media' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'partner')));
create policy "Staff delete club media" on storage.objects for delete to authenticated
  using (bucket_id = 'club-media' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'partner')));

insert into public.settings (key, value) values
  ('universo_url', 'https://queridodante.site'),
  ('admin_default_password_active', 'true');

insert into public.categories (id, name, icon, sort_order) values
  ('11111111-0000-4000-8000-000000000001', 'E-books', 'book-open', 1),
  ('11111111-0000-4000-8000-000000000002', 'Lojas Online', 'shopping-bag', 2),
  ('11111111-0000-4000-8000-000000000003', 'Presencial', 'map-pin', 3);

insert into public.stores (id, name, description, website, address) values
  ('22222222-0000-4000-8000-000000000001', 'Universo Querido Dante', 'Livros e e-books do Dante.', 'https://queridodante.site', null),
  ('22222222-0000-4000-8000-000000000002', 'Loja Cósmica', 'Camisetas, canecas e presentes geek.', 'https://queridodante.site', null),
  ('22222222-0000-4000-8000-000000000003', 'Café Constelação', 'Cafeteria e livraria de bairro.', null, 'Rua das Estrelas, 100 - Centro, São Paulo - SP');

insert into public.offers (store_id, category_id, title, description, discount_label, coupon_code, action_type, action_url, address, featured) values
  ('22222222-0000-4000-8000-000000000001', '11111111-0000-4000-8000-000000000001', 'E-books do Universo Dante', 'Desconto especial nos e-books oficiais na Google Play.', '30% OFF', 'DANTE30', 'google_play', 'https://play.google.com/store/search?q=Querido%20Dante&c=books', null, true),
  ('22222222-0000-4000-8000-000000000002', '11111111-0000-4000-8000-000000000002', 'Coleção Universo na Loja Cósmica', 'Válido para toda a coleção de camisetas e canecas.', '15% OFF', 'CLUBEDANTE15', 'loja', 'https://queridodante.site', null, true),
  ('22222222-0000-4000-8000-000000000003', '11111111-0000-4000-8000-000000000003', 'Café + livro no Café Constelação', 'Apresente sua carteirinha no balcão e ganhe um café na compra de qualquer livro.', 'Café grátis', null, 'endereco', null, 'Rua das Estrelas, 100 - Centro, São Paulo - SP', false);

insert into public.missions (title, platform, description, reward, url, steps, sort_order) values
  ('Pontue no Microsoft Rewards', 'Microsoft Rewards', 'Faça buscas no Bing e complete atividades diárias para juntar pontos e trocar por vale-presentes.', 'Vale-presentes e créditos', 'https://rewards.bing.com',
    array['Toque em "Abrir missão" e entre com sua conta Microsoft.', 'Ative o Microsoft Rewards e aceite os termos.', 'Complete as atividades diárias e faça suas buscas pelo Bing.', 'Troque seus pontos na aba "Resgatar".'], 1),
  ('Teste o Amazon Prime', 'Amazon', 'Experimente o Prime e aproveite frete grátis, Prime Video e Prime Reading com e-books inclusos.', 'Período de teste grátis', 'https://www.amazon.com.br/prime',
    array['Toque em "Abrir missão" para ir até a Amazon.', 'Entre ou crie sua conta Amazon.', 'Ative o período de teste do Prime.', 'Aproveite os e-books do Prime Reading e o frete grátis.'], 2);

insert into public.pages (slug, title, content) values
  ('termos', 'Termos de Uso', E'## Bem-vindo ao Dante Clube\nO Dante Clube é o clube de benefícios oficial e gratuito do Universo Querido Dante. Ao se cadastrar, você se torna um Associado e passa a ter acesso a cupons, descontos e missões de parceiros.\n\n## Cadastro\nO cadastro é gratuito e pessoal. Você é responsável por manter seus dados corretos e sua senha em segurança.\n\n## Benefícios\nOs cupons e descontos são oferecidos pelos parceiros, que definem as regras de cada oferta. O Dante Clube pode alterar ou encerrar ofertas a qualquer momento.\n\n## Carteirinha\nA carteirinha digital é pessoal e intransferível. O uso indevido pode levar ao descredenciamento.\n\n## Descredenciamento\nAssociados que descumprirem estes termos ou as Diretrizes da Comunidade podem ter o acesso suspenso.'),
  ('diretrizes', 'Diretrizes da Comunidade', E'## Respeito em primeiro lugar\nTrate parceiros, equipe e outros associados com gentileza.\n\n## Use os benefícios de forma justa\n- Não compartilhe cupons exclusivos em grupos públicos.\n- Não use a carteirinha de outra pessoa.\n- Respeite as regras de cada parceiro.\n\n## Missões\nAs missões levam a plataformas de terceiros. Siga as regras de cada plataforma para pontuar e resgatar prêmios.'),
  ('privacidade', 'Política de Privacidade', E'## Quais dados coletamos\nNo cadastro coletamos seu nome e e-mail. Não pedimos CPF. Sua conta de acesso é a mesma do site Universo Querido Dante.\n\n## Para que usamos\nUsamos seus dados para criar sua matrícula de Associado, gerar sua carteirinha digital e permitir que parceiros confirmem que você está ativo.\n\n## O que os parceiros veem\nAo validar sua carteirinha, o parceiro vê seu nome, sua matrícula e seu status. Na validação pública pelo QR Code aparece apenas o seu primeiro nome.\n\n## Seus direitos\nVocê pode pedir a correção ou exclusão dos seus dados entrando em contato com a equipe do Universo Querido Dante.');

create table public.dante_avatars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text not null,
  sort_order int not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index dante_avatars_one_default on public.dante_avatars (is_default) where is_default;
grant select on public.dante_avatars to anon, authenticated;
grant insert, update, delete on public.dante_avatars to authenticated;
grant all on public.dante_avatars to service_role;
alter table public.dante_avatars enable row level security;
create policy "Anyone reads dante avatars" on public.dante_avatars for select to anon, authenticated using (true);
create policy "Admins manage dante avatars" on public.dante_avatars for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
alter table public.associates add column dante_avatar_id uuid references public.dante_avatars(id) on delete set null;
insert into public.dante_avatars (name, image_url, sort_order, is_default) values
  ('Dante Clássico', '/brand/dante-avatar.webp', 1, true);

alter table public.offers add column coupon_mode text not null default 'single';
alter table public.offers add constraint offers_coupon_mode_check check (coupon_mode in ('single', 'unique'));

create or replace function public.owns_offer(_offer_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.offers o join public.stores s on s.id = o.store_id
    where o.id = _offer_id and s.owner_id = auth.uid()
  )
$$;

create table public.offer_coupons (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  code text not null,
  associate_id uuid references public.associates(id) on delete set null,
  assigned_at timestamptz,
  created_at timestamptz not null default now(),
  unique (offer_id, code),
  unique (offer_id, associate_id)
);
create index offer_coupons_available_idx on public.offer_coupons (offer_id, created_at) where assigned_at is null;
create index offer_coupons_associate_idx on public.offer_coupons (associate_id) where associate_id is not null;
grant select, insert, delete on public.offer_coupons to authenticated;
grant all on public.offer_coupons to service_role;
alter table public.offer_coupons enable row level security;
create policy "Admins manage coupons" on public.offer_coupons for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Partners manage own offer coupons" on public.offer_coupons for all to authenticated
  using (public.owns_offer(offer_id)) with check (public.owns_offer(offer_id));

create or replace function public.claim_offer_coupon(_offer_id uuid, _associate_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare c text;
begin
  select code into c from public.offer_coupons where offer_id = _offer_id and associate_id = _associate_id;
  if c is not null then return c; end if;
  begin
    update public.offer_coupons set associate_id = _associate_id, assigned_at = now()
    where id = (
      select id from public.offer_coupons
      where offer_id = _offer_id and assigned_at is null
      order by created_at, id
      limit 1
      for update skip locked
    )
    returning code into c;
  exception when unique_violation then
    select code into c from public.offer_coupons where offer_id = _offer_id and associate_id = _associate_id;
  end;
  return c;
end $$;
revoke execute on function public.claim_offer_coupon(uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_offer_coupon(uuid, uuid) to service_role;

create or replace function public.coupon_stock(_offer_ids uuid[])
returns table (offer_id uuid, total int, available int)
language sql stable security invoker set search_path = public as $$
  select c.offer_id, count(*)::int, (count(*) filter (where c.assigned_at is null))::int
  from public.offer_coupons c
  where c.offer_id = any(_offer_ids)
  group by c.offer_id
$$;
revoke execute on function public.coupon_stock(uuid[]) from public, anon;
grant execute on function public.coupon_stock(uuid[]) to authenticated, service_role;