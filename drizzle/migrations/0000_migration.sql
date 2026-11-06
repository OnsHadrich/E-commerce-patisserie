
create type public.app_role as enum ('admin', 'staff');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','staff'))
$$;

create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "Admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  address text,
  email text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "Own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "Own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.email)
  on conflict (id) do nothing;
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null default 'cakes',
  occasions text[] not null default '{}',
  price numeric(10,2) not null default 0,
  image text not null default '',
  description text not null default '',
  rating numeric(2,1) not null default 5,
  reviews int not null default 0,
  popularity int not null default 50,
  stock int not null default 0,
  tags text[] not null default '{}',
  customizable boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "Public reads active products" on public.products for select to anon, authenticated using (active or public.is_staff(auth.uid()));
create policy "Admins insert products" on public.products for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "Admins update products" on public.products for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins delete products" on public.products for delete to authenticated using (public.has_role(auth.uid(),'admin'));

insert into public.products (slug,name,category,occasions,price,image,description,rating,reviews,popularity,stock,tags,customizable) values
('chocolate-bliss','Chocolate Bliss Cake','cakes','{Birthday,Corporate}',95,'cake-chocolate','Dark chocolate sponge, silky ganache drip and hand-piped chocolate rosettes.',4.8,842,98,12,'{bestseller}',true),
('strawberry-shortcake','Strawberry Shortcake','cakes','{Birthday,Anniversary}',88,'cake-strawberry','Light vanilla genoise layered with Chantilly cream and fresh strawberries.',4.9,1126,96,8,'{bestseller,trending}',true),
('red-velvet-dream','Red Velvet Dream','cakes','{Anniversary,Wedding}',92,'cake-redvelvet','Velvety cocoa crumb with cream cheese frosting and a ring of rosettes.',4.7,754,90,5,'{bestseller}',true),
('mango-delight','Mango Delight Cake','cakes','{Birthday,Kids}',85,'cake-mango','Mango mousse cake with white chocolate drip and fresh mango cubes.',4.6,532,84,0,'{bestseller,new}',true),
('vintage-heart','Vintage Heart Cake','cakes','{Anniversary,Wedding}',78,'cake-heart','Heart-shaped vanilla cake with retro piping and a candied cherry.',4.9,410,93,6,'{trending,new}',true),
('macaron-box','Parisian Macaron Box','macarons','{Corporate,Anniversary}',36,'macarons','Six macarons: raspberry, pistachio and Madagascar vanilla.',4.8,620,88,30,'{trending}',false),
('cherry-cupcake','Cherry Blossom Cupcake','cupcakes','{Kids,Birthday}',9,'cupcake','Vanilla cupcake, strawberry buttercream swirl and sprinkles.',4.7,298,80,40,'{trending,new}',false);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity,
  user_id uuid,
  channel text not null default 'online' check (channel in ('online','pos')),
  status text not null default 'pending' check (status in ('pending','preparing','ready','delivered','completed','cancelled')),
  payment_method text not null check (payment_method in ('cash','card')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid')),
  customer_name text,
  phone text,
  address text,
  delivery_date date,
  notes text,
  subtotal numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  created_by uuid,
  created_at timestamptz not null default now()
);
grant select, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Customers read own orders" on public.orders for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "Staff update orders" on public.orders for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  qty int not null check (qty > 0),
  unit_price numeric(10,2) not null,
  options text[] not null default '{}',
  message text
);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "Read items of visible orders" on public.order_items for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff(auth.uid())))
);

-- Prices are always computed here, never trusted from the browser.
create or replace function public.place_order(p_items jsonb, p_channel text, p_payment text, p_customer jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_order uuid;
  v_num bigint;
  v_sub numeric := 0;
  v_fee numeric := 0;
  it jsonb;
  p public.products;
  v_qty int;
  v_unit numeric;
  v_opts text[];
  t text;
begin
  if v_uid is null then raise exception 'Please sign in to place an order'; end if;
  if p_channel = 'pos' and not public.is_staff(v_uid) then raise exception 'Not allowed'; end if;
  if p_channel = 'online' and p_payment <> 'cash' then raise exception 'Card payment online is not available yet'; end if;
  if jsonb_array_length(coalesce(p_items,'[]'::jsonb)) = 0 then raise exception 'Cart is empty'; end if;
  if p_channel = 'online' then
    if coalesce(trim(p_customer->>'name'),'') = '' or coalesce(trim(p_customer->>'phone'),'') = '' or coalesce(trim(p_customer->>'address'),'') = '' then
      raise exception 'Name, phone and address are required';
    end if;
    v_fee := 7;
  end if;

  insert into public.orders (user_id, channel, status, payment_method, payment_status, customer_name, phone, address, delivery_date, notes, created_by)
  values (case when p_channel='online' then v_uid else null end, p_channel,
          case when p_channel='pos' then 'completed' else 'pending' end,
          p_payment, case when p_channel='pos' then 'paid' else 'unpaid' end,
          nullif(left(p_customer->>'name',100),''), nullif(left(p_customer->>'phone',30),''), nullif(left(p_customer->>'address',300),''),
          nullif(p_customer->>'date','')::date, nullif(left(p_customer->>'notes',500),''), v_uid)
  returning id, order_number into v_order, v_num;

  for it in select * from jsonb_array_elements(p_items) loop
    select * into p from public.products where slug = it->>'slug' and active for update;
    if not found then raise exception 'Product not found'; end if;
    v_qty := greatest(1, coalesce((it->>'qty')::int, 1));
    if p.stock < v_qty then raise exception '% has only % left', p.name, p.stock; end if;
    v_unit := p.price;
    v_opts := '{}';
    if p.customizable then
      v_unit := v_unit + case it->>'size' when 'm' then 30 when 'l' then 65 else 0 end;
      v_opts := v_opts || (case it->>'size' when 'm' then 'Medium · 10 portions' when 'l' then 'Large · 16 portions' else 'Small · 6 portions' end);
      v_unit := v_unit + case it->>'flavor' when 'chocolate' then 5 when 'pistachio' then 12 else 0 end;
      v_opts := v_opts || (case it->>'flavor' when 'chocolate' then 'Dark chocolate' when 'pistachio' then 'Pistachio' else 'Vanilla bean' end);
      for t in select jsonb_array_elements_text(coalesce(it->'toppings','[]'::jsonb)) loop
        if t = 'berries' then v_unit := v_unit + 10; v_opts := v_opts || 'Fresh berries'::text;
        elsif t = 'gold' then v_unit := v_unit + 15; v_opts := v_opts || 'Gold leaf'::text;
        elsif t = 'flowers' then v_unit := v_unit + 12; v_opts := v_opts || 'Edible flowers'::text;
        end if;
      end loop;
      if coalesce(it->>'notes','') <> '' then v_opts := v_opts || ('Note: ' || left(it->>'notes',300)); end if;
    end if;
    update public.products set stock = stock - v_qty, popularity = popularity + 1 where id = p.id;
    insert into public.order_items (order_id, product_id, name, qty, unit_price, options, message)
    values (v_order, p.id, p.name, v_qty, v_unit, v_opts, nullif(left(it->>'message',40),''));
    v_sub := v_sub + v_unit * v_qty;
  end loop;

  update public.orders set subtotal = v_sub, delivery_fee = v_fee, total = v_sub + v_fee where id = v_order;
  return jsonb_build_object('id', v_order, 'order_number', v_num, 'total', v_sub + v_fee);
end $$;
revoke execute on function public.place_order(jsonb, text, text, jsonb) from public, anon;
grant execute on function public.place_order(jsonb, text, text, jsonb) to authenticated;
