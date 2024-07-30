create table "public"."links" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "created_by" uuid,
    "url" text,
    "password" text,
    "expires" timestamp with time zone,
    "filename" text
);


alter table "public"."links" enable row level security;

create table "public"."users" (
    "created_at" timestamp with time zone not null default now(),
    "email" text,
    "name" text,
    "updated_at" timestamp without time zone,
    "title" text,
    "id" uuid not null default gen_random_uuid(),
    "auth_id" uuid
);


alter table "public"."users" enable row level security;

create table "public"."viewers" (
    "created_at" timestamp with time zone default now(),
    "link_id" uuid,
    "email" text,
    "viewed_at" timestamp with time zone,
    "id" uuid not null default gen_random_uuid()
);


alter table "public"."viewers" enable row level security;

CREATE UNIQUE INDEX links_pkey ON public.links USING btree (id);

CREATE UNIQUE INDEX users_auth_id_key ON public.users USING btree (auth_id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX viewers_pkey ON public.viewers USING btree (id);




alter table "public"."links" add constraint "links_pkey" PRIMARY KEY using index "links_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."viewers" add constraint "viewers_pkey" PRIMARY KEY using index "viewers_pkey";

alter table "public"."links" add constraint "links_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(auth_id) not valid;

alter table "public"."links" validate constraint "links_created_by_fkey";

alter table "public"."users" add constraint "users_auth_id_fkey" FOREIGN KEY (auth_id) REFERENCES auth.users(id) not valid;

alter table "public"."users" validate constraint "users_auth_id_fkey";

alter table "public"."users" add constraint "users_auth_id_key" UNIQUE using index "users_auth_id_key";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."viewers" add constraint "viewers_link_id_fkey" FOREIGN KEY (link_id) REFERENCES links(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."viewers" validate constraint "viewers_link_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public."checkIfUser"(given_mail text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  RETURN (EXISTS (SELECT 1 FROM auth.users a WHERE a.email = given_mail));
END;$function$
;

CREATE OR REPLACE FUNCTION public.delete_link(link_id uuid, auth_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    DELETE FROM public.links
    WHERE id = link_id AND created_by = auth_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_link_by_id(link_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, url text, password text, expires timestamp with time zone, filename text, created_by uuid)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT *
  FROM links
  WHERE id = link_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_links(auth_id uuid)
 RETURNS SETOF links
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT *
  FROM links
  WHERE created_by = auth_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if a user with this email already exists
  IF EXISTS (SELECT 1 FROM public.users WHERE email = new.email) THEN
    -- Update the existing user's auth_id
    UPDATE public.users
    SET auth_id = new.id,
        updated_at = now()
    WHERE email = new.email;
  ELSE
    -- Insert a new user if no existing user is found
    INSERT INTO public.users (auth_id, email, created_at)
    VALUES (new.id, new.email, now());
  END IF;
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.select_link(link_id uuid)
 RETURNS TABLE(
    id uuid, 
    created_at timestamp with time zone, 
    url text, 
    password text, 
    expires timestamp with time zone, 
    filename text, 
    created_by uuid,
    creator_name text
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
    SELECT l.id, l.created_at, l.url, l.password, l.expires, l.filename, l.created_by, u.name as creator_name
    FROM links l
    LEFT JOIN users u ON l.created_by = u.auth_id
    WHERE l.id = link_id LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.update_link(link_id uuid, auth_id uuid, url_arg text, password_arg text, expires_arg timestamp without time zone, filename_arg text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.links
    SET url = url_arg, 
        password = password_arg, 
        expires = expires_arg,
        filename = filename_arg
    WHERE id = link_id AND created_by = auth_id;
END;
$function$
;

grant delete on table "public"."links" to "anon";

grant insert on table "public"."links" to "anon";

grant references on table "public"."links" to "anon";

grant select on table "public"."links" to "anon";

grant trigger on table "public"."links" to "anon";

grant truncate on table "public"."links" to "anon";

grant update on table "public"."links" to "anon";

grant delete on table "public"."links" to "authenticated";

grant insert on table "public"."links" to "authenticated";

grant references on table "public"."links" to "authenticated";

grant select on table "public"."links" to "authenticated";

grant trigger on table "public"."links" to "authenticated";

grant truncate on table "public"."links" to "authenticated";

grant update on table "public"."links" to "authenticated";

grant delete on table "public"."links" to "service_role";

grant insert on table "public"."links" to "service_role";

grant references on table "public"."links" to "service_role";

grant select on table "public"."links" to "service_role";

grant trigger on table "public"."links" to "service_role";

grant truncate on table "public"."links" to "service_role";

grant update on table "public"."links" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

grant delete on table "public"."viewers" to "anon";

grant insert on table "public"."viewers" to "anon";

grant references on table "public"."viewers" to "anon";

grant select on table "public"."viewers" to "anon";

grant trigger on table "public"."viewers" to "anon";

grant truncate on table "public"."viewers" to "anon";

grant update on table "public"."viewers" to "anon";

grant delete on table "public"."viewers" to "authenticated";

grant insert on table "public"."viewers" to "authenticated";

grant references on table "public"."viewers" to "authenticated";

grant select on table "public"."viewers" to "authenticated";

grant trigger on table "public"."viewers" to "authenticated";

grant truncate on table "public"."viewers" to "authenticated";

grant update on table "public"."viewers" to "authenticated";

grant delete on table "public"."viewers" to "service_role";

grant insert on table "public"."viewers" to "service_role";

grant references on table "public"."viewers" to "service_role";

grant select on table "public"."viewers" to "service_role";

grant trigger on table "public"."viewers" to "service_role";

grant truncate on table "public"."viewers" to "service_role";

grant update on table "public"."viewers" to "service_role";


create policy "Authenticated users can insert"
on "public"."links"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated users can delete themselves"
on "public"."users"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = auth_id));


create policy "Authenticated users can insert"
on "public"."users"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated users can read"
on "public"."users"
as permissive
for select
to authenticated
using (true);


create policy "Authenticated users can update"
on "public"."users"
as permissive
for update
to authenticated
using (true);


create policy "Anyone can insert"
on "public"."viewers"
as permissive
for insert
to public
with check (true);


create policy "Anyone can update"
on "public"."viewers"
as permissive
for update
to public
using (true);


create policy "Authenticated users can delete"
on "public"."viewers"
as permissive
for delete
to authenticated
using (true);


create policy "Authenticated users can select"
on "public"."viewers"
as permissive
for select
to authenticated
using (true);



CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


create policy "Authenticated users can do all flreew_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'documents'::text));


create policy "Authenticated users can do all flreew_1"
on "storage"."objects"
as permissive
for insert
to public
with check ((bucket_id = 'documents'::text));


create policy "Authenticated users can do all flreew_2"
on "storage"."objects"
as permissive
for update
to public
using ((bucket_id = 'documents'::text));


create policy "Authenticated users can do all flreew_3"
on "storage"."objects"
as permissive
for delete
to public
using ((bucket_id = 'documents'::text));