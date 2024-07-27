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
    "side_letter_url" text,
    "side_letter_id" uuid
);


alter table "public"."investments" enable row level security;

create table "public"."links" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "user_id" uuid,
    "url" text,
    "password" text,
    "expires" timestamp with time zone,
    "filename" text
);


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


CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (id);

CREATE UNIQUE INDEX funds_pkey ON public.funds USING btree (id);

CREATE UNIQUE INDEX investments_pkey ON public.investments USING btree (id);

CREATE UNIQUE INDEX side_letters_pkey ON public.side_letters USING btree (id);

CREATE UNIQUE INDEX users_auth_id_key ON public.users USING btree (auth_id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";

alter table "public"."funds" add constraint "funds_pkey" PRIMARY KEY using index "funds_pkey";

alter table "public"."investments" add constraint "investments_pkey" PRIMARY KEY using index "investments_pkey";

alter table "public"."side_letters" add constraint "side_letters_pkey" PRIMARY KEY using index "side_letters_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."companies" add constraint "companies_founder_id_fkey" FOREIGN KEY (founder_id) REFERENCES users(id) not valid;

alter table "public"."companies" validate constraint "companies_founder_id_fkey";

alter table "public"."funds" add constraint "funds_investor_id_fkey" FOREIGN KEY (investor_id) REFERENCES users(id) not valid;

alter table "public"."funds" validate constraint "funds_investor_id_fkey";

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

alter table "public"."users" add constraint "users_auth_id_fkey" FOREIGN KEY (auth_id) REFERENCES auth.users(id) not valid;

alter table "public"."users" validate constraint "users_auth_id_fkey";

alter table "public"."users" add constraint "users_auth_id_key" UNIQUE using index "users_auth_id_key";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public."checkIfUser"(given_mail text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  RETURN (EXISTS (SELECT 1 FROM auth.users a WHERE a.email = given_mail));
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
using (((auth.uid() = ( SELECT users.auth_id
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
          WHERE (companies.id = investments.company_id)))))));


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



CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


