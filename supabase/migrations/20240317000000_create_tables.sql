-- Create profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create categories table
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  icon text,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, name)
);

-- Create products table
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  name text not null,
  description text,
  brand text,
  image_url text,
  affiliate_url text,
  price decimal(10,2),
  currency text default 'USD',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Categories policies
create policy "Categories are viewable by everyone"
  on public.categories for select
  using ( true );

create policy "Users can insert their own categories"
  on public.categories for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own categories"
  on public.categories for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own categories"
  on public.categories for delete
  using ( auth.uid() = user_id );

-- Products policies
create policy "Products are viewable by everyone"
  on public.products for select
  using ( true );

create policy "Users can insert their own products"
  on public.products for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own products"
  on public.products for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own products"
  on public.products for delete
  using ( auth.uid() = user_id );

-- Create functions to handle timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers for updated_at
create trigger handle_updated_at
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_updated_at
  before update on public.categories
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_updated_at
  before update on public.products
  for each row
  execute procedure public.handle_updated_at();
