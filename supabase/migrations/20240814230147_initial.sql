create table "public"."companies" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "street" text,
    "city_state_zip" text,
    "state_of_incorporation" text,
    "founder_id" uuid
);


alter table "public"."companies" enable row level security;

create table "public"."contacts" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "created_by" uuid,
    "name" text,
    "email" text
);


create table "public"."funds" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "street" text,
    "city_state_zip" text,
    "byline" text,
    "investor_id" uuid
);


alter table "public"."funds" enable row level security;

create table "public"."investments" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "founder_id" uuid,
    "company_id" uuid,
    "investor_id" uuid,
    "fund_id" uuid,
    "purchase_amount" text,
    "investment_type" text,
    "valuation_cap" text,
    "discount" text,
    "date" timestamp with time zone,
    "created_by" uuid,
    "summary" text,
    "safe_url" text,
    "side_letter_id" uuid
);


alter table "public"."investments" enable row level security;

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

create table "public"."side_letters" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "side_letter_url" text,
    "info_rights" boolean,
    "pro_rata_rights" boolean,
    "major_investor_rights" boolean,
    "termination" boolean,
    "miscellaneous" boolean
);


alter table "public"."side_letters" enable row level security;

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

CREATE UNIQUE INDEX companies_name_unique ON public.companies USING btree (name);

CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (id);

CREATE UNIQUE INDEX funds_name_unique ON public.funds USING btree (name);

CREATE UNIQUE INDEX funds_pkey ON public.funds USING btree (id);

CREATE UNIQUE INDEX investments_pkey ON public.investments USING btree (id);

CREATE UNIQUE INDEX links_pkey ON public.links USING btree (id);

CREATE UNIQUE INDEX side_letters_pkey ON public.side_letters USING btree (id);

CREATE UNIQUE INDEX users_auth_id_key ON public.users USING btree (auth_id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_name_email_unique ON public.users USING btree (name, email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX viewers_pkey ON public.viewers USING btree (id);

alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";

alter table "public"."funds" add constraint "funds_pkey" PRIMARY KEY using index "funds_pkey";

alter table "public"."investments" add constraint "investments_pkey" PRIMARY KEY using index "investments_pkey";

alter table "public"."links" add constraint "links_pkey" PRIMARY KEY using index "links_pkey";

alter table "public"."side_letters" add constraint "side_letters_pkey" PRIMARY KEY using index "side_letters_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."viewers" add constraint "viewers_pkey" PRIMARY KEY using index "viewers_pkey";

alter table "public"."companies" add constraint "companies_founder_id_fkey" FOREIGN KEY (founder_id) REFERENCES users(id) not valid;

alter table "public"."companies" validate constraint "companies_founder_id_fkey";

alter table "public"."companies" add constraint "companies_name_unique" UNIQUE using index "companies_name_unique";

alter table "public"."funds" add constraint "funds_investor_id_fkey" FOREIGN KEY (investor_id) REFERENCES users(id) not valid;

alter table "public"."funds" validate constraint "funds_investor_id_fkey";

alter table "public"."funds" add constraint "funds_name_unique" UNIQUE using index "funds_name_unique";

alter table "public"."investments" add constraint "investments_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(auth_id) not valid;

alter table "public"."investments" validate constraint "investments_created_by_fkey";

alter table "public"."investments" add constraint "investments_founder_id_fkey" FOREIGN KEY (founder_id) REFERENCES users(id) not valid;

alter table "public"."investments" validate constraint "investments_founder_id_fkey";

alter table "public"."investments" add constraint "investments_investor_id_fkey" FOREIGN KEY (investor_id) REFERENCES users(id) not valid;

alter table "public"."investments" validate constraint "investments_investor_id_fkey";

alter table "public"."investments" add constraint "investments_side_letter_id_fkey" FOREIGN KEY (side_letter_id) REFERENCES side_letters(id) not valid;

alter table "public"."investments" validate constraint "investments_side_letter_id_fkey";

alter table "public"."investments" add constraint "public_investments_company_id_fkey" FOREIGN KEY (company_id) REFERENCES companies(id) not valid;

alter table "public"."investments" validate constraint "public_investments_company_id_fkey";

alter table "public"."investments" add constraint "public_investments_fund_id_fkey" FOREIGN KEY (fund_id) REFERENCES funds(id) not valid;

alter table "public"."investments" validate constraint "public_investments_fund_id_fkey";

alter table "public"."links" add constraint "links_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(auth_id) not valid;

alter table "public"."links" validate constraint "links_created_by_fkey";

alter table "public"."users" add constraint "users_auth_id_fkey" FOREIGN KEY (auth_id) REFERENCES auth.users(id) not valid;

alter table "public"."users" validate constraint "users_auth_id_fkey";

alter table "public"."users" add constraint "users_auth_id_key" UNIQUE using index "users_auth_id_key";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_name_email_unique" UNIQUE using index "users_name_email_unique";

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

CREATE OR REPLACE FUNCTION public.get_link_analytics(link_id_arg uuid)
 RETURNS TABLE(all_viewers bigint, unique_viewers bigint, all_views json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM viewers WHERE link_id = link_id_arg) AS all_viewers,
    (SELECT COUNT(DISTINCT email) FROM viewers WHERE link_id = link_id_arg) AS unique_viewers,
    (SELECT json_agg(json_build_object('email', email, 'viewed_at', viewed_at))
     FROM viewers
     WHERE link_id = link_id_arg) AS all_views;
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

CREATE OR REPLACE FUNCTION public.get_user_documents(auth_id_arg uuid)
 RETURNS TABLE(id uuid, document_type text, document_url text, document_name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        CASE
            WHEN lower(l.filename) LIKE '%.pdf' THEN 'PDF'
            WHEN lower(l.filename) LIKE '%.doc' OR lower(l.filename) LIKE '%.docx' THEN 'Word'
            WHEN lower(l.filename) LIKE '%.xls' OR lower(l.filename) LIKE '%.xlsx' THEN 'Excel'
            WHEN lower(l.filename) LIKE '%.jpg' OR lower(l.filename) LIKE '%.jpeg' OR lower(l.filename) LIKE '%.png' THEN 'Image'
            ELSE 'Other'
        END as document_type,
        l.url as document_url,
        l.filename as document_name,
        l.created_at
    FROM links l
    WHERE l.created_by = auth_id_arg
    ORDER BY l.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_investments(auth_id_arg uuid)
 RETURNS TABLE(id uuid, purchase_amount text, investment_type text, valuation_cap text, discount text, date timestamp with time zone, founder json, company json, investor json, fund json, side_letter json, side_letter_id uuid, safe_url text, summary text, created_by uuid, created_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH user_investments AS (
    SELECT DISTINCT ON (i.id) i.*
    FROM investments i
    LEFT JOIN users u ON i.investor_id = u.id OR i.founder_id = u.id
    WHERE u.auth_id = auth_id_arg OR i.created_by = auth_id_arg
  )
  SELECT
    i.id,
    i.purchase_amount,
    i.investment_type,
    i.valuation_cap,
    i.discount,
    i.date,
    CASE WHEN f.id IS NOT NULL THEN
      json_build_object('id', f.id, 'name', f.name, 'title', f.title, 'email', f.email)
    ELSE NULL END AS founder,
    CASE WHEN c.id IS NOT NULL THEN
      json_build_object('id', c.id, 'name', c.name, 'street', c.street, 'city_state_zip', c.city_state_zip, 'state_of_incorporation', c.state_of_incorporation)
    ELSE NULL END AS company,
    CASE WHEN inv.id IS NOT NULL THEN
      json_build_object('id', inv.id, 'name', inv.name, 'title', inv.title, 'email', inv.email)
    ELSE NULL END AS investor,
    CASE WHEN fd.id IS NOT NULL THEN
      json_build_object('id', fd.id, 'name', fd.name, 'byline', fd.byline, 'street', fd.street, 'city_state_zip', fd.city_state_zip)
    ELSE NULL END AS fund,
    CASE WHEN sl.id IS NOT NULL THEN
      json_build_object('id', sl.id, 'side_letter_url', sl.side_letter_url, 'info_rights', sl.info_rights, 'pro_rata_rights', sl.pro_rata_rights, 'major_investor_rights', sl.major_investor_rights, 'termination', sl.termination, 'miscellaneous', sl.miscellaneous)
    ELSE NULL END AS side_letter,
    i.side_letter_id,
    i.safe_url,
    i.summary,
    i.created_by,
    i.created_at
  FROM
    user_investments i
    LEFT JOIN users f ON i.founder_id = f.id
    LEFT JOIN companies c ON i.company_id = c.id
    LEFT JOIN users inv ON i.investor_id = inv.id
    LEFT JOIN funds fd ON i.fund_id = fd.id
    LEFT JOIN side_letters sl ON i.side_letter_id = sl.id
  ORDER BY
    i.created_at DESC;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_investments_by_id(id_arg uuid, auth_id_arg uuid)
 RETURNS TABLE(id uuid, purchase_amount text, investment_type text, valuation_cap text, discount text, date timestamp with time zone, founder json, company json, investor json, fund json, side_letter json, side_letter_id uuid, safe_url text, summary text, created_by uuid, created_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    i.id,
    i.purchase_amount,
    i.investment_type,
    i.valuation_cap,
    i.discount,
    i.date,
    CASE WHEN f.id IS NOT NULL THEN
      json_build_object('id', f.id, 'name', f.name, 'title', f.title, 'email', f.email)
    ELSE NULL END AS founder,
    CASE WHEN c.id IS NOT NULL THEN
      json_build_object('id', c.id, 'name', c.name, 'street', c.street, 'city_state_zip', c.city_state_zip, 'state_of_incorporation', c.state_of_incorporation)
    ELSE NULL END AS company,
    CASE WHEN inv.id IS NOT NULL THEN
      json_build_object('id', inv.id, 'name', inv.name, 'title', inv.title, 'email', inv.email)
    ELSE NULL END AS investor,
    CASE WHEN fd.id IS NOT NULL THEN
      json_build_object('id', fd.id, 'name', fd.name, 'byline', fd.byline, 'street', fd.street, 'city_state_zip', fd.city_state_zip)
    ELSE NULL END AS fund,
    CASE WHEN sl.id IS NOT NULL THEN
      json_build_object('id', sl.id, 'side_letter_url', sl.side_letter_url, 'info_rights', sl.info_rights, 'pro_rata_rights', sl.pro_rata_rights, 'major_investor_rights', sl.major_investor_rights, 'termination', sl.termination, 'miscellaneous', sl.miscellaneous)
    ELSE NULL END AS side_letter,
    i.side_letter_id,
    i.safe_url,
    i.summary,
    i.created_by,
    i.created_at
  FROM
    investments i
    LEFT JOIN users f ON i.founder_id = f.id
    LEFT JOIN companies c ON i.company_id = c.id
    LEFT JOIN users inv ON i.investor_id = inv.id
    LEFT JOIN funds fd ON i.fund_id = fd.id
    LEFT JOIN side_letters sl ON i.side_letter_id = sl.id
  WHERE
    i.id = id_arg
    AND (i.created_by = auth_id_arg
         OR i.founder_id IN (SELECT id FROM users WHERE auth_id = auth_id_arg)
         OR i.investor_id IN (SELECT id FROM users WHERE auth_id = auth_id_arg));
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

CREATE OR REPLACE FUNCTION public.get_user_links_with_views(auth_id_arg uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, created_by uuid, url text, password text, expires timestamp with time zone, filename text, view_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.created_at,
    l.created_by,
    l.url,
    l.password,
    l.expires,
    l.filename,
    COALESCE(v.view_count, 0) AS view_count
  FROM 
    links l
  LEFT JOIN (
    SELECT link_id, COUNT(*) AS view_count
    FROM viewers
    GROUP BY link_id
  ) v ON l.id = v.link_id
  WHERE 
    l.created_by = auth_id_arg
  ORDER BY 
    l.created_at DESC;
END;$function$
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

CREATE OR REPLACE FUNCTION public.select_investment_entities(investment_id uuid)
 RETURNS TABLE(fund_name text, company_name text, investor_name text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    fd.name as fund_name,
    c.name as company_name,
    i.name as investor_name
  from investments inv
  left join companies c on inv.company_id = c.id
  left join users i on inv.investor_id = i.id
  left join funds fd on inv.fund_id = fd.id
  where inv.id = investment_id;
$function$
;

CREATE OR REPLACE FUNCTION public.select_link(link_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, url text, password text, expires timestamp with time zone, filename text, created_by uuid, creator_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$ SELECT l.id, l.created_at, l.url, l.password, l.expires, l.filename, l.created_by, u.name as creator_name FROM links l LEFT JOIN users u ON l.created_by = u.auth_id WHERE l.id = link_id LIMIT 1; $function$
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

CREATE OR REPLACE FUNCTION public.upsert_link_data(id_arg uuid, filename_arg text, url_arg text, created_by_arg uuid, created_at_arg timestamp with time zone, password_arg text, expires_arg timestamp with time zone, auth_id_arg uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into links (id, filename, url, created_by, created_at, password, expires)
  values (id_arg, filename_arg, url_arg, created_by_arg, created_at_arg, password_arg, expires_arg)
  on conflict (id)
  do update set
    filename = excluded.filename,
    url = excluded.url,
    created_by = excluded.created_by,
    created_at = excluded.created_at,
    password = excluded.password,
    expires = excluded.expires
  where links.created_by = auth_id_arg;
end;
$function$
;

grant delete on table "public"."companies" to "anon";

grant insert on table "public"."companies" to "anon";

grant references on table "public"."companies" to "anon";

grant select on table "public"."companies" to "anon";

grant trigger on table "public"."companies" to "anon";

grant truncate on table "public"."companies" to "anon";

grant update on table "public"."companies" to "anon";

grant delete on table "public"."companies" to "authenticated";

grant insert on table "public"."companies" to "authenticated";

grant references on table "public"."companies" to "authenticated";

grant select on table "public"."companies" to "authenticated";

grant trigger on table "public"."companies" to "authenticated";

grant truncate on table "public"."companies" to "authenticated";

grant update on table "public"."companies" to "authenticated";

grant delete on table "public"."companies" to "service_role";

grant insert on table "public"."companies" to "service_role";

grant references on table "public"."companies" to "service_role";

grant select on table "public"."companies" to "service_role";

grant trigger on table "public"."companies" to "service_role";

grant truncate on table "public"."companies" to "service_role";

grant update on table "public"."companies" to "service_role";

grant delete on table "public"."contacts" to "anon";

grant insert on table "public"."contacts" to "anon";

grant references on table "public"."contacts" to "anon";

grant select on table "public"."contacts" to "anon";

grant trigger on table "public"."contacts" to "anon";

grant truncate on table "public"."contacts" to "anon";

grant update on table "public"."contacts" to "anon";

grant delete on table "public"."contacts" to "authenticated";

grant insert on table "public"."contacts" to "authenticated";

grant references on table "public"."contacts" to "authenticated";

grant select on table "public"."contacts" to "authenticated";

grant trigger on table "public"."contacts" to "authenticated";

grant truncate on table "public"."contacts" to "authenticated";

grant update on table "public"."contacts" to "authenticated";

grant delete on table "public"."contacts" to "service_role";

grant insert on table "public"."contacts" to "service_role";

grant references on table "public"."contacts" to "service_role";

grant select on table "public"."contacts" to "service_role";

grant trigger on table "public"."contacts" to "service_role";

grant truncate on table "public"."contacts" to "service_role";

grant update on table "public"."contacts" to "service_role";

grant delete on table "public"."funds" to "anon";

grant insert on table "public"."funds" to "anon";

grant references on table "public"."funds" to "anon";

grant select on table "public"."funds" to "anon";

grant trigger on table "public"."funds" to "anon";

grant truncate on table "public"."funds" to "anon";

grant update on table "public"."funds" to "anon";

grant delete on table "public"."funds" to "authenticated";

grant insert on table "public"."funds" to "authenticated";

grant references on table "public"."funds" to "authenticated";

grant select on table "public"."funds" to "authenticated";

grant trigger on table "public"."funds" to "authenticated";

grant truncate on table "public"."funds" to "authenticated";

grant update on table "public"."funds" to "authenticated";

grant delete on table "public"."funds" to "service_role";

grant insert on table "public"."funds" to "service_role";

grant references on table "public"."funds" to "service_role";

grant select on table "public"."funds" to "service_role";

grant trigger on table "public"."funds" to "service_role";

grant truncate on table "public"."funds" to "service_role";

grant update on table "public"."funds" to "service_role";

grant delete on table "public"."investments" to "anon";

grant insert on table "public"."investments" to "anon";

grant references on table "public"."investments" to "anon";

grant select on table "public"."investments" to "anon";

grant trigger on table "public"."investments" to "anon";

grant truncate on table "public"."investments" to "anon";

grant update on table "public"."investments" to "anon";

grant delete on table "public"."investments" to "authenticated";

grant insert on table "public"."investments" to "authenticated";

grant references on table "public"."investments" to "authenticated";

grant select on table "public"."investments" to "authenticated";

grant trigger on table "public"."investments" to "authenticated";

grant truncate on table "public"."investments" to "authenticated";

grant update on table "public"."investments" to "authenticated";

grant delete on table "public"."investments" to "service_role";

grant insert on table "public"."investments" to "service_role";

grant references on table "public"."investments" to "service_role";

grant select on table "public"."investments" to "service_role";

grant trigger on table "public"."investments" to "service_role";

grant truncate on table "public"."investments" to "service_role";

grant update on table "public"."investments" to "service_role";

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

grant delete on table "public"."side_letters" to "anon";

grant insert on table "public"."side_letters" to "anon";

grant references on table "public"."side_letters" to "anon";

grant select on table "public"."side_letters" to "anon";

grant trigger on table "public"."side_letters" to "anon";

grant truncate on table "public"."side_letters" to "anon";

grant update on table "public"."side_letters" to "anon";

grant delete on table "public"."side_letters" to "authenticated";

grant insert on table "public"."side_letters" to "authenticated";

grant references on table "public"."side_letters" to "authenticated";

grant select on table "public"."side_letters" to "authenticated";

grant trigger on table "public"."side_letters" to "authenticated";

grant truncate on table "public"."side_letters" to "authenticated";

grant update on table "public"."side_letters" to "authenticated";

grant delete on table "public"."side_letters" to "service_role";

grant insert on table "public"."side_letters" to "service_role";

grant references on table "public"."side_letters" to "service_role";

grant select on table "public"."side_letters" to "service_role";

grant trigger on table "public"."side_letters" to "service_role";

grant truncate on table "public"."side_letters" to "service_role";

grant update on table "public"."side_letters" to "service_role";

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
on "public"."companies"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated users can read"
on "public"."companies"
as permissive
for select
to authenticated
using (true);


create policy "Investors and founders in investment with fund can delete"
on "public"."companies"
as permissive
for delete
to public
using (((auth.uid() = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = companies.founder_id))) OR (EXISTS ( SELECT 1
   FROM (investments i
     JOIN users u ON ((u.id = i.investor_id)))
  WHERE ((i.company_id = companies.id) AND (u.auth_id = auth.uid()))))));


create policy "Investors and founders in investment with fund can update"
on "public"."companies"
as permissive
for update
to public
using (((auth.uid() = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = companies.founder_id))) OR (EXISTS ( SELECT 1
   FROM (investments i
     JOIN users u ON ((u.id = i.investor_id)))
  WHERE ((i.company_id = companies.id) AND (u.auth_id = auth.uid()))))));


create policy "Authenticated users can insert"
on "public"."funds"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated users can read"
on "public"."funds"
as permissive
for select
to authenticated
using (true);


create policy "Founders and investors of investment with company can delete"
on "public"."funds"
as permissive
for delete
to public
using (((auth.uid() = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = funds.investor_id))) OR (EXISTS ( SELECT 1
   FROM (investments i
     JOIN users u ON ((u.id = i.founder_id)))
  WHERE ((i.fund_id = funds.id) AND (u.auth_id = auth.uid()))))));


create policy "Founders and investors of investment with company can update"
on "public"."funds"
as permissive
for update
to public
using (((auth.uid() = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = funds.investor_id))) OR (EXISTS ( SELECT 1
   FROM (investments i
     JOIN users u ON ((u.id = i.founder_id)))
  WHERE ((i.fund_id = funds.id) AND (u.auth_id = auth.uid()))))));


create policy "Authenticated users can insert"
on "public"."investments"
as permissive
for insert
to public
with check (true);


create policy "Authenticated users can read"
on "public"."investments"
as permissive
for select
to authenticated
using (true);


create policy "Authenticated users can update"
on "public"."investments"
as permissive
for update
to authenticated
using (true);


create policy "Founders or investors in investment can delete"
on "public"."investments"
as permissive
for delete
to public
using (((auth.uid() = created_by) OR ((auth.uid() = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = investments.founder_id))) OR (auth.uid() = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = investments.investor_id))) OR (auth.uid() IN ( SELECT users.auth_id
   FROM users
  WHERE (users.id IN ( SELECT funds.investor_id
           FROM funds
          WHERE (funds.id = investments.fund_id))))) OR (auth.uid() IN ( SELECT users.auth_id
   FROM users
  WHERE (users.id IN ( SELECT companies.founder_id
           FROM companies
          WHERE (companies.id = investments.company_id))))))));


create policy "Authenticated users can insert"
on "public"."links"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated can do all"
on "public"."side_letters"
as permissive
for all
to authenticated
using (true);


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



alter type "auth"."factor_type" rename to "factor_type__old_version_to_be_dropped";

create type "auth"."factor_type" as enum ('totp', 'webauthn', 'phone');

alter table "auth"."mfa_factors" alter column factor_type type "auth"."factor_type" using factor_type::text::"auth"."factor_type";

drop type "auth"."factor_type__old_version_to_be_dropped";

alter table "auth"."mfa_challenges" add column "otp_code" text;

alter table "auth"."mfa_factors" add column "last_challenged_at" timestamp with time zone;

alter table "auth"."mfa_factors" add column "phone" text;

CREATE UNIQUE INDEX mfa_factors_last_challenged_at_key ON auth.mfa_factors USING btree (last_challenged_at);

CREATE UNIQUE INDEX mfa_factors_phone_key ON auth.mfa_factors USING btree (phone);

CREATE UNIQUE INDEX unique_verified_phone_factor ON auth.mfa_factors USING btree (user_id, phone);

alter table "auth"."mfa_factors" add constraint "mfa_factors_last_challenged_at_key" UNIQUE using index "mfa_factors_last_challenged_at_key";

alter table "auth"."mfa_factors" add constraint "mfa_factors_phone_key" UNIQUE using index "mfa_factors_phone_key";

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



