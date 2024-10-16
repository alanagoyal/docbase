-- Add this at the end of the file

-- Create messages table
create table "public"."messages" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "sender_id" uuid not null,
    "recipient" text not null,
    "subject" text not null,
    "body" text not null,
    "status" text not null default 'sent',
    constraint "messages_pkey" primary key ("id"),
    constraint "messages_sender_id_fkey" foreign key ("sender_id") references "public"."users"("id") on delete cascade
);

-- Add RLS policies for messages table
alter table "public"."messages" enable row level security;

create policy "Users can insert their own messages"
on "public"."messages"
as permissive
for insert
to authenticated
with check (auth.uid() = sender_id);

create policy "Users can select their own messages"
on "public"."messages"
as permissive
for select
to authenticated
using (auth.uid() = sender_id);

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all functions in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role;

-- Update public.users to include a messages relation
alter table "public"."users" add column "messages" uuid[];

create or replace function append_message_to_user(user_id uuid, message_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.users
  set messages = array_append(messages, message_id)
  where id = user_id;
end;
$$;

create policy "Users can execute append_message_to_user"
on public.users
for all
to authenticated
using (true);