-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create stocks table
create table public.stocks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  team_id uuid default null,
  name text not null,
  total_weight_g numeric not null check (total_weight_g > 0),
  daily_usage_g numeric not null check (daily_usage_g >= 0),
  stock_count_bag numeric not null default 0 check (stock_count_bag >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  threshold_days integer default null check (threshold_days > 0)
);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Add trigger to automatically update updated_at
create trigger update_stocks_updated_at
  before update on public.stocks
  for each row
  execute function update_updated_at_column();

-- Enable RLS
alter table public.stocks enable row level security;

-- RLS Policies
create policy "Users can view own stocks"
  on public.stocks for select
  using (auth.uid() = user_id);

create policy "Users can insert own stocks"
  on public.stocks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own stocks"
  on public.stocks for update
  using (auth.uid() = user_id);

create policy "Users can delete own stocks"
  on public.stocks for delete
  using (auth.uid() = user_id);

-- Create indexes for performance
create index stocks_user_id_idx on public.stocks(user_id);
create index stocks_name_idx on public.stocks(name);
create index stocks_updated_at_idx on public.stocks(updated_at);
