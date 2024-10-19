create table "public"."companies" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "street" text,
    "city_state_zip" text,
    "state_of_incorporation" text,
    "contact_id" uuid
);


alter table "public"."companies" enable row level security;

create table "public"."contact_groups" (
    "contact_id" uuid not null,
    "group_id" uuid not null
);


alter table "public"."contact_groups" enable row level security;

create table "public"."contacts" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "created_by" uuid,
    "name" text,
    "email" text not null,
    "updated_at" timestamp with time zone default now(),
    "title" text,
    "is_investor" boolean default false,
    "is_founder" boolean default false,
    "user_id" uuid
);


alter table "public"."contacts" enable row level security;

create table "public"."domains" (
    "id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "domain_name" text not null,
    "user_id" uuid not null,
    "sender_name" text,
    "api_key" text
);


alter table "public"."domains" enable row level security;

create table "public"."funds" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "street" text,
    "city_state_zip" text,
    "byline" text,
    "contact_id" uuid
);


alter table "public"."funds" enable row level security;

create table "public"."groups" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone not null default now(),
    "created_by" uuid not null,
    "color" text
);


alter table "public"."groups" enable row level security;

create table "public"."investments" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "founder_contact_id" uuid,
    "company_id" uuid,
    "investor_contact_id" uuid,
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

create table "public"."messages" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "sender_id" uuid not null,
    "recipient" text not null,
    "subject" text not null,
    "body" text not null,
    "status" text not null default 'sent'::text
);


alter table "public"."messages" enable row level security;

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
    "messages" uuid[]
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

CREATE UNIQUE INDEX contact_groups_pkey ON public.contact_groups USING btree (contact_id, group_id);

CREATE UNIQUE INDEX contacts_email_created_by_unique ON public.contacts USING btree (email, created_by);

CREATE UNIQUE INDEX contacts_pkey ON public.contacts USING btree (id);

CREATE UNIQUE INDEX domains_name_user_id_key ON public.domains USING btree (domain_name, user_id);

CREATE UNIQUE INDEX domains_pkey ON public.domains USING btree (id);

CREATE UNIQUE INDEX domains_user_id_key ON public.domains USING btree (user_id);

CREATE UNIQUE INDEX funds_name_unique ON public.funds USING btree (name);

CREATE UNIQUE INDEX funds_pkey ON public.funds USING btree (id);

CREATE UNIQUE INDEX groups_pkey ON public.groups USING btree (id);

CREATE UNIQUE INDEX investments_pkey ON public.investments USING btree (id);

CREATE UNIQUE INDEX links_pkey ON public.links USING btree (id);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE UNIQUE INDEX side_letters_pkey ON public.side_letters USING btree (id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_name_email_unique ON public.users USING btree (name, email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX viewers_pkey ON public.viewers USING btree (id);

alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";

alter table "public"."contact_groups" add constraint "contact_groups_pkey" PRIMARY KEY using index "contact_groups_pkey";

alter table "public"."contacts" add constraint "contacts_pkey" PRIMARY KEY using index "contacts_pkey";

alter table "public"."domains" add constraint "domains_pkey" PRIMARY KEY using index "domains_pkey";

alter table "public"."funds" add constraint "funds_pkey" PRIMARY KEY using index "funds_pkey";

alter table "public"."groups" add constraint "groups_pkey" PRIMARY KEY using index "groups_pkey";

alter table "public"."investments" add constraint "investments_pkey" PRIMARY KEY using index "investments_pkey";

alter table "public"."links" add constraint "links_pkey" PRIMARY KEY using index "links_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."side_letters" add constraint "side_letters_pkey" PRIMARY KEY using index "side_letters_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."viewers" add constraint "viewers_pkey" PRIMARY KEY using index "viewers_pkey";

alter table "public"."companies" add constraint "companies_contact_id_fkey" FOREIGN KEY (contact_id) REFERENCES contacts(id) not valid;

alter table "public"."companies" validate constraint "companies_contact_id_fkey";

alter table "public"."companies" add constraint "companies_name_unique" UNIQUE using index "companies_name_unique";

alter table "public"."contact_groups" add constraint "contact_groups_contact_id_fkey" FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE not valid;

alter table "public"."contact_groups" validate constraint "contact_groups_contact_id_fkey";

alter table "public"."contact_groups" add constraint "contact_groups_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE not valid;

alter table "public"."contact_groups" validate constraint "contact_groups_group_id_fkey";

alter table "public"."contacts" add constraint "contacts_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id) not valid;

alter table "public"."contacts" validate constraint "contacts_created_by_fkey";

alter table "public"."contacts" add constraint "contacts_email_created_by_unique" UNIQUE using index "contacts_email_created_by_unique";

alter table "public"."contacts" add constraint "contacts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."contacts" validate constraint "contacts_user_id_fkey";

alter table "public"."domains" add constraint "domains_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."domains" validate constraint "domains_user_id_fkey";

alter table "public"."domains" add constraint "domains_user_id_fkey1" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."domains" validate constraint "domains_user_id_fkey1";

alter table "public"."domains" add constraint "domains_user_id_key" UNIQUE using index "domains_user_id_key";

alter table "public"."funds" add constraint "funds_contact_id_fkey" FOREIGN KEY (contact_id) REFERENCES contacts(id) not valid;

alter table "public"."funds" validate constraint "funds_contact_id_fkey";

alter table "public"."funds" add constraint "funds_name_unique" UNIQUE using index "funds_name_unique";

alter table "public"."groups" add constraint "groups_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id) not valid;

alter table "public"."groups" validate constraint "groups_created_by_fkey";

alter table "public"."investments" add constraint "investments_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id) not valid;

alter table "public"."investments" validate constraint "investments_created_by_fkey";

alter table "public"."investments" add constraint "investments_founder_contact_id_fkey" FOREIGN KEY (founder_contact_id) REFERENCES contacts(id) not valid;

alter table "public"."investments" validate constraint "investments_founder_contact_id_fkey";

alter table "public"."investments" add constraint "investments_investor_contact_id_fkey" FOREIGN KEY (investor_contact_id) REFERENCES contacts(id) not valid;

alter table "public"."investments" validate constraint "investments_investor_contact_id_fkey";

alter table "public"."investments" add constraint "investments_side_letter_id_fkey" FOREIGN KEY (side_letter_id) REFERENCES side_letters(id) not valid;

alter table "public"."investments" validate constraint "investments_side_letter_id_fkey";

alter table "public"."investments" add constraint "public_investments_company_id_fkey" FOREIGN KEY (company_id) REFERENCES companies(id) not valid;

alter table "public"."investments" validate constraint "public_investments_company_id_fkey";

alter table "public"."investments" add constraint "public_investments_fund_id_fkey" FOREIGN KEY (fund_id) REFERENCES funds(id) not valid;

alter table "public"."investments" validate constraint "public_investments_fund_id_fkey";

alter table "public"."links" add constraint "links_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id) not valid;

alter table "public"."links" validate constraint "links_created_by_fkey";

alter table "public"."messages" add constraint "messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_sender_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_name_email_unique" UNIQUE using index "users_name_email_unique";

alter table "public"."viewers" add constraint "viewers_link_id_fkey" FOREIGN KEY (link_id) REFERENCES links(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."viewers" validate constraint "viewers_link_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.append_message_to_user(user_id uuid, message_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  update public.users
  set messages = array_append(messages, message_id)
  where id = user_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public."checkIfUser"(given_mail text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  RETURN (EXISTS (SELECT 1 FROM auth.users a WHERE a.email = given_mail));
END;$function$
;

CREATE OR REPLACE FUNCTION public.delete_link(link_id uuid, user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    DELETE FROM public.links
    WHERE id = link_id AND created_by = user_id;
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

CREATE OR REPLACE FUNCTION public.get_user_documents(id_arg uuid)
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
            WHEN lower(l.filename) LIKE '%.doc'
            OR lower(l.filename) LIKE '%.docx' THEN 'Word'
            WHEN lower(l.filename) LIKE '%.xls'
            OR lower(l.filename) LIKE '%.xlsx' THEN 'Excel'
            WHEN lower(l.filename) LIKE '%.jpg'
            OR lower(l.filename) LIKE '%.jpeg'
            OR lower(l.filename) LIKE '%.png' THEN 'Image'
            ELSE 'Other'
        END as document_type,
        l.url as document_url,
        l.filename as document_name,
        l.created_at
    FROM
        links l
    WHERE
        l.created_by = id_arg
    ORDER BY
        l.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_investments(id_arg uuid)
 RETURNS TABLE(id uuid, purchase_amount text, investment_type text, valuation_cap text, discount text, date timestamp with time zone, founder json, company json, investor json, fund json, side_letter json, side_letter_id uuid, safe_url text, summary text, created_by uuid, created_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
WITH user_contacts AS (
    SELECT
        id
    FROM
        contacts
    WHERE
        user_id = id_arg
        OR created_by = id_arg
)
SELECT
    i.id,
    i.purchase_amount,
    i.investment_type,
    i.valuation_cap,
    i.discount,
    i.date,
    json_build_object(
        'id',
        fc.id,
        'name',
        fc.name,
        'title',
        fc.title,
        'email',
        fc.email,
        'user_id',
        fc.user_id
    ) AS founder,
    json_build_object(
        'id',
        c.id,
        'name',
        c.name,
        'street',
        c.street,
        'city_state_zip',
        c.city_state_zip,
        'state_of_incorporation',
        c.state_of_incorporation
    ) AS company,
    json_build_object(
        'id',
        ic.id,
        'name',
        ic.name,
        'title',
        ic.title,
        'email',
        ic.email,
        'user_id',
        ic.user_id
    ) AS investor,
    json_build_object(
        'id',
        f.id,
        'name',
        f.name,
        'byline',
        f.byline,
        'street',
        f.street,
        'city_state_zip',
        f.city_state_zip
    ) AS fund,
    CASE
        WHEN sl.id IS NOT NULL THEN json_build_object(
            'id',
            sl.id,
            'side_letter_url',
            sl.side_letter_url,
            'info_rights',
            sl.info_rights,
            'pro_rata_rights',
            sl.pro_rata_rights,
            'major_investor_rights',
            sl.major_investor_rights,
            'termination',
            sl.termination,
            'miscellaneous',
            sl.miscellaneous
        )
        ELSE NULL
    END AS side_letter,
    i.side_letter_id,
    i.safe_url,
    i.summary,
    i.created_by,
    i.created_at
FROM
    investments i
    LEFT JOIN contacts fc ON i.founder_contact_id = fc.id
    LEFT JOIN companies c ON i.company_id = c.id
    LEFT JOIN contacts ic ON i.investor_contact_id = ic.id
    LEFT JOIN funds f ON i.fund_id = f.id
    LEFT JOIN side_letters sl ON i.side_letter_id = sl.id
WHERE
    i.founder_contact_id IN (
        SELECT
            id
        FROM
            user_contacts
    )
    OR i.investor_contact_id IN (
        SELECT
            id
        FROM
            user_contacts
    )
    OR i.created_by = id_arg
ORDER BY
    i.created_at DESC;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_investments_by_id(id_arg uuid, investment_id_arg uuid)
 RETURNS TABLE(id uuid, purchase_amount text, investment_type text, valuation_cap text, discount text, date timestamp with time zone, founder json, company json, investor json, fund json, side_letter json, side_letter_id uuid, safe_url text, summary text, created_by uuid, created_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
WITH user_contacts AS (
    SELECT
        id
    FROM
        contacts
    WHERE
        user_id = id_arg
        OR created_by = id_arg
)
SELECT
    i.id,
    i.purchase_amount,
    i.investment_type,
    i.valuation_cap,
    i.discount,
    i.date,
    json_build_object(
        'id',
        fc.id,
        'name',
        fc.name,
        'title',
        fc.title,
        'email',
        fc.email,
        'user_id',
        fc.user_id
    ) AS founder,
    json_build_object(
        'id',
        c.id,
        'name',
        c.name,
        'street',
        c.street,
        'city_state_zip',
        c.city_state_zip,
        'state_of_incorporation',
        c.state_of_incorporation
    ) AS company,
    json_build_object(
        'id',
        ic.id,
        'name',
        ic.name,
        'title',
        ic.title,
        'email',
        ic.email,
        'user_id',
        ic.user_id
    ) AS investor,
    json_build_object(
        'id',
        f.id,
        'name',
        f.name,
        'byline',
        f.byline,
        'street',
        f.street,
        'city_state_zip',
        f.city_state_zip
    ) AS fund,
    CASE
        WHEN sl.id IS NOT NULL THEN json_build_object(
            'id',
            sl.id,
            'side_letter_url',
            sl.side_letter_url,
            'info_rights',
            sl.info_rights,
            'pro_rata_rights',
            sl.pro_rata_rights,
            'major_investor_rights',
            sl.major_investor_rights,
            'termination',
            sl.termination,
            'miscellaneous',
            sl.miscellaneous
        )
        ELSE NULL
    END AS side_letter,
    i.side_letter_id,
    i.safe_url,
    i.summary,
    i.created_by,
    i.created_at
FROM
    investments i
    LEFT JOIN contacts fc ON i.founder_contact_id = fc.id
    LEFT JOIN companies c ON i.company_id = c.id
    LEFT JOIN contacts ic ON i.investor_contact_id = ic.id
    LEFT JOIN funds f ON i.fund_id = f.id
    LEFT JOIN side_letters sl ON i.side_letter_id = sl.id
WHERE
    i.id = investment_id_arg
    AND (
        i.founder_contact_id IN (
            SELECT
                id
            FROM
                user_contacts
        )
        OR i.investor_contact_id IN (
            SELECT
                id
            FROM
                user_contacts
        )
        OR i.created_by = id_arg
    );
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_links(id_arg uuid)
 RETURNS SETOF links
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN 
    RETURN QUERY
    SELECT
        *
    FROM
        links
    WHERE
        created_by = id_arg;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_links_with_views(id_arg uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, created_by uuid, url text, password text, expires timestamp with time zone, filename text, view_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN 
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
            SELECT
                link_id,
                COUNT(*) AS view_count
            FROM
                viewers
            GROUP BY
                link_id
        ) v ON l.id = v.link_id
    WHERE
        l.created_by = id_arg
    ORDER BY
        l.created_at DESC;
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
    -- Update the existing user's id
    UPDATE public.users
    SET id = new.id,
        updated_at = now()
    WHERE email = new.email;
  ELSE
    -- Insert a new user if no existing user is found
    INSERT INTO public.users (id, email, created_at)
    VALUES (new.id, new.email, now());
  END IF;

  -- Update contacts with the same email to have the new user's id as user_id
  UPDATE public.contacts
  SET user_id = new.id
  WHERE email = new.email;

  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.select_investment_entities(investment_id uuid)
 RETURNS TABLE(fund_name text, company_name text, investor_name text, founder_name text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    f.name as fund_name,
    c.name as company_name,
    ic.name as investor_name,
    fc.name as founder_name
  FROM investments i
  LEFT JOIN companies c ON i.company_id = c.id
  LEFT JOIN contacts ic ON i.investor_contact_id = ic.id
  LEFT JOIN contacts fc ON i.founder_contact_id = fc.id
  LEFT JOIN funds f ON i.fund_id = f.id
  WHERE i.id = investment_id;
$function$
;

CREATE OR REPLACE FUNCTION public.select_link(link_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, url text, password text, expires timestamp with time zone, filename text, created_by uuid, creator_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN 
    RETURN QUERY
    SELECT
        l.id,
        l.created_at,
        l.url,
        l.password,
        l.expires,
        l.filename,
        l.created_by,
        u.name AS creator_name
    FROM
        links l
    LEFT JOIN
        users u ON l.created_by = u.id
    WHERE
        l.id = link_id;
END;
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

CREATE OR REPLACE FUNCTION public.update_link(link_id uuid, user_id uuid, url_arg text, password_arg text, expires_arg timestamp with time zone, filename_arg text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE
        public.links
    SET
        url = COALESCE(url_arg, url),
        password = COALESCE(password_arg, password),
        expires = expires_arg,
        filename = COALESCE(filename_arg, filename)
    WHERE
        id = link_id
        AND created_by = user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_link_data(id_arg uuid, filename_arg text, url_arg text, created_by_arg uuid, created_at_arg timestamp with time zone, password_arg text, expires_arg timestamp with time zone, user_id uuid)
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
  where links.created_by = user_id;
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

grant delete on table "public"."contact_groups" to "anon";

grant insert on table "public"."contact_groups" to "anon";

grant references on table "public"."contact_groups" to "anon";

grant select on table "public"."contact_groups" to "anon";

grant trigger on table "public"."contact_groups" to "anon";

grant truncate on table "public"."contact_groups" to "anon";

grant update on table "public"."contact_groups" to "anon";

grant delete on table "public"."contact_groups" to "authenticated";

grant insert on table "public"."contact_groups" to "authenticated";

grant references on table "public"."contact_groups" to "authenticated";

grant select on table "public"."contact_groups" to "authenticated";

grant trigger on table "public"."contact_groups" to "authenticated";

grant truncate on table "public"."contact_groups" to "authenticated";

grant update on table "public"."contact_groups" to "authenticated";

grant delete on table "public"."contact_groups" to "service_role";

grant insert on table "public"."contact_groups" to "service_role";

grant references on table "public"."contact_groups" to "service_role";

grant select on table "public"."contact_groups" to "service_role";

grant trigger on table "public"."contact_groups" to "service_role";

grant truncate on table "public"."contact_groups" to "service_role";

grant update on table "public"."contact_groups" to "service_role";

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

grant delete on table "public"."domains" to "anon";

grant insert on table "public"."domains" to "anon";

grant references on table "public"."domains" to "anon";

grant select on table "public"."domains" to "anon";

grant trigger on table "public"."domains" to "anon";

grant truncate on table "public"."domains" to "anon";

grant update on table "public"."domains" to "anon";

grant delete on table "public"."domains" to "authenticated";

grant insert on table "public"."domains" to "authenticated";

grant references on table "public"."domains" to "authenticated";

grant select on table "public"."domains" to "authenticated";

grant trigger on table "public"."domains" to "authenticated";

grant truncate on table "public"."domains" to "authenticated";

grant update on table "public"."domains" to "authenticated";

grant delete on table "public"."domains" to "service_role";

grant insert on table "public"."domains" to "service_role";

grant references on table "public"."domains" to "service_role";

grant select on table "public"."domains" to "service_role";

grant trigger on table "public"."domains" to "service_role";

grant truncate on table "public"."domains" to "service_role";

grant update on table "public"."domains" to "service_role";

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

grant delete on table "public"."groups" to "anon";

grant insert on table "public"."groups" to "anon";

grant references on table "public"."groups" to "anon";

grant select on table "public"."groups" to "anon";

grant trigger on table "public"."groups" to "anon";

grant truncate on table "public"."groups" to "anon";

grant update on table "public"."groups" to "anon";

grant delete on table "public"."groups" to "authenticated";

grant insert on table "public"."groups" to "authenticated";

grant references on table "public"."groups" to "authenticated";

grant select on table "public"."groups" to "authenticated";

grant trigger on table "public"."groups" to "authenticated";

grant truncate on table "public"."groups" to "authenticated";

grant update on table "public"."groups" to "authenticated";

grant delete on table "public"."groups" to "service_role";

grant insert on table "public"."groups" to "service_role";

grant references on table "public"."groups" to "service_role";

grant select on table "public"."groups" to "service_role";

grant trigger on table "public"."groups" to "service_role";

grant truncate on table "public"."groups" to "service_role";

grant update on table "public"."groups" to "service_role";

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

grant delete on table "public"."messages" to "anon";

grant insert on table "public"."messages" to "anon";

grant references on table "public"."messages" to "anon";

grant select on table "public"."messages" to "anon";

grant trigger on table "public"."messages" to "anon";

grant truncate on table "public"."messages" to "anon";

grant update on table "public"."messages" to "anon";

grant delete on table "public"."messages" to "authenticated";

grant insert on table "public"."messages" to "authenticated";

grant references on table "public"."messages" to "authenticated";

grant select on table "public"."messages" to "authenticated";

grant trigger on table "public"."messages" to "authenticated";

grant truncate on table "public"."messages" to "authenticated";

grant update on table "public"."messages" to "authenticated";

grant delete on table "public"."messages" to "service_role";

grant insert on table "public"."messages" to "service_role";

grant references on table "public"."messages" to "service_role";

grant select on table "public"."messages" to "service_role";

grant trigger on table "public"."messages" to "service_role";

grant truncate on table "public"."messages" to "service_role";

grant update on table "public"."messages" to "service_role";

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

create policy "Authenticated users can insert companies"
on "public"."companies"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated users can select companies"
on "public"."companies"
as permissive
for select
to authenticated
using (true);


create policy "Users can delete their own companies"
on "public"."companies"
as permissive
for delete
to authenticated
using ((auth.uid() = ( SELECT contacts.user_id
   FROM contacts
  WHERE (contacts.id = companies.contact_id))));


create policy "Users can update their own companies"
on "public"."companies"
as permissive
for update
to authenticated
using ((auth.uid() = ( SELECT contacts.user_id
   FROM contacts
  WHERE (contacts.id = companies.contact_id))));


create policy "Users can manage their own contact_groups"
on "public"."contact_groups"
as permissive
for all
to authenticated
using ((auth.uid() IN ( SELECT contacts.created_by
   FROM contacts
  WHERE (contacts.id = contact_groups.contact_id)
UNION
 SELECT groups.created_by
   FROM groups
  WHERE (groups.id = contact_groups.group_id))));


create policy "Authenticated users can insert contacts"
on "public"."contacts"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated users can view all contacts"
on "public"."contacts"
as permissive
for select
to authenticated
using (true);


create policy "Users can delete their own contacts"
on "public"."contacts"
as permissive
for delete
to authenticated
using (((auth.uid() = created_by) OR (auth.uid() = user_id)));


create policy "Users can update their own contacts"
on "public"."contacts"
as permissive
for update
to authenticated
using (((auth.uid() = created_by) OR (auth.uid() = user_id)));


create policy "Users can manage their own domains"
on "public"."domains"
as permissive
for all
to authenticated
using ((auth.uid() = user_id));


create policy "Authenticated users can insert funds"
on "public"."funds"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated users can select funds"
on "public"."funds"
as permissive
for select
to authenticated
using (true);


create policy "Users can delete their own funds"
on "public"."funds"
as permissive
for delete
to authenticated
using ((auth.uid() = ( SELECT contacts.user_id
   FROM contacts
  WHERE (contacts.id = funds.contact_id))));


create policy "Users can update their own funds"
on "public"."funds"
as permissive
for update
to authenticated
using ((auth.uid() = ( SELECT contacts.user_id
   FROM contacts
  WHERE (contacts.id = funds.contact_id))));


create policy "Users can create their own groups"
on "public"."groups"
as permissive
for insert
to authenticated
with check ((auth.uid() = created_by));


create policy "Users can delete their own groups"
on "public"."groups"
as permissive
for delete
to authenticated
using ((auth.uid() = created_by));


create policy "Users can update their own groups"
on "public"."groups"
as permissive
for update
to authenticated
using ((auth.uid() = created_by));


create policy "Users can view their own groups"
on "public"."groups"
as permissive
for select
to authenticated
using ((auth.uid() = created_by));


create policy "Authenticated users can insert investments"
on "public"."investments"
as permissive
for insert
to authenticated
with check (true);


create policy "Users can delete their own created investments"
on "public"."investments"
as permissive
for delete
to authenticated
using ((auth.uid() = created_by));


create policy "Users can select and update their own investments"
on "public"."investments"
as permissive
for select
to authenticated
using (((auth.uid() = created_by) OR (auth.uid() IN ( SELECT contacts.user_id
   FROM contacts
  WHERE (contacts.id = investments.investor_contact_id))) OR (auth.uid() IN ( SELECT contacts.user_id
   FROM contacts
  WHERE (contacts.id = investments.founder_contact_id)))));


create policy "Users can update their own investments"
on "public"."investments"
as permissive
for update
to authenticated
using (((auth.uid() = created_by) OR (auth.uid() IN ( SELECT contacts.user_id
   FROM contacts
  WHERE (contacts.id = investments.investor_contact_id))) OR (auth.uid() IN ( SELECT contacts.user_id
   FROM contacts
  WHERE (contacts.id = investments.founder_contact_id)))));


create policy "Authenticated users can insert"
on "public"."links"
as permissive
for insert
to authenticated
with check (true);


create policy "Users can insert their own messages"
on "public"."messages"
as permissive
for insert
to authenticated
with check ((auth.uid() = sender_id));


create policy "Users can select their own messages"
on "public"."messages"
as permissive
for select
to authenticated
using ((auth.uid() = sender_id));


create policy "Authenticated users can insert side letters"
on "public"."side_letters"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated users can select side letters"
on "public"."side_letters"
as permissive
for select
to authenticated
using (true);


create policy "Users can delete their own side letters"
on "public"."side_letters"
as permissive
for delete
to authenticated
using ((auth.uid() IN ( SELECT investments.created_by
   FROM investments
  WHERE (investments.side_letter_id = side_letters.id))));


create policy "Users can update their own side letters"
on "public"."side_letters"
as permissive
for update
to authenticated
using ((auth.uid() IN ( SELECT investments.created_by
   FROM investments
  WHERE (investments.side_letter_id = side_letters.id))));


create policy "Authenticated users can insert"
on "public"."users"
as permissive
for insert
to authenticated
with check (true);


create policy "Users can delete own account"
on "public"."users"
as permissive
for delete
to authenticated
using ((auth.uid() = id));


create policy "Users can execute append_message_to_user"
on "public"."users"
as permissive
for all
to authenticated
using (true);


create policy "Users can read own account"
on "public"."users"
as permissive
for select
to authenticated
using ((auth.uid() = id));


create policy "Users can update own account"
on "public"."users"
as permissive
for update
to authenticated
using ((auth.uid() = id))
with check ((auth.uid() = id));


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

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);

alter table "auth"."mfa_factors" add constraint "mfa_factors_last_challenged_at_key" UNIQUE using index "mfa_factors_last_challenged_at_key";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


alter table "storage"."objects" add column "user_metadata" jsonb;

alter table "storage"."s3_multipart_uploads" add column "user_metadata" jsonb;

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



