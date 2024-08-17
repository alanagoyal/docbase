-- Modify the contacts table
ALTER TABLE "public"."contacts" 
  ADD COLUMN IF NOT EXISTS "title" text,
  ADD COLUMN IF NOT EXISTS "is_investor" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "is_founder" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "user_id" uuid;

-- Add a foreign key constraint for user_id
ALTER TABLE "public"."contacts" 
  ADD CONSTRAINT "contacts_user_id_fkey" 
  FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Create a unique constraint on email and created_by
ALTER TABLE "public"."contacts" 
  ADD CONSTRAINT "contacts_email_created_by_unique" 
  UNIQUE (email, created_by);

-- Update the contacts_created_by_fkey constraint if it doesn't exist
ALTER TABLE "public"."contacts" 
  DROP CONSTRAINT IF EXISTS "contacts_created_by_fkey";

ALTER TABLE "public"."contacts" 
  ADD CONSTRAINT "contacts_created_by_fkey" 
  FOREIGN KEY (created_by) REFERENCES public.users(id);

-- First, ensure that the contacts table has the necessary columns
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.users(id);

-- Update the funds table
ALTER TABLE public.funds
DROP CONSTRAINT IF EXISTS funds_investor_id_fkey;

ALTER TABLE public.funds
RENAME COLUMN investor_id TO contact_id;

ALTER TABLE public.funds
ADD CONSTRAINT funds_contact_id_fkey
FOREIGN KEY (contact_id)
REFERENCES public.contacts(id);

-- Update the investments table
ALTER TABLE public.investments
DROP CONSTRAINT IF EXISTS investments_investor_id_fkey;

ALTER TABLE public.investments
DROP CONSTRAINT IF EXISTS investments_founder_id_fkey;

ALTER TABLE public.investments
RENAME COLUMN investor_id TO investor_contact_id;

ALTER TABLE public.investments
RENAME COLUMN founder_id TO founder_contact_id;

ALTER TABLE public.investments
ADD CONSTRAINT investments_investor_contact_id_fkey
FOREIGN KEY (investor_contact_id)
REFERENCES public.contacts(id);

ALTER TABLE public.investments
ADD CONSTRAINT investments_founder_contact_id_fkey
FOREIGN KEY (founder_contact_id)
REFERENCES public.contacts(id);

-- Update the companies table
ALTER TABLE public.companies
DROP CONSTRAINT IF EXISTS companies_founder_id_fkey;

ALTER TABLE public.companies
RENAME COLUMN founder_id TO contact_id;

ALTER TABLE public.companies
ADD CONSTRAINT companies_contact_id_fkey
FOREIGN KEY (contact_id)
REFERENCES public.contacts(id);

-- Drop existing functions
DROP FUNCTION IF EXISTS public.get_user_documents(uuid);
DROP FUNCTION IF EXISTS public.get_user_investments(uuid);
DROP FUNCTION IF EXISTS public.get_user_investments_by_id(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_user_links(uuid);
DROP FUNCTION IF EXISTS public.get_user_links_with_views(uuid);

-- Recreate functions with updated signatures and correct table structure

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
            WHEN lower(l.filename) LIKE '%.doc' OR lower(l.filename) LIKE '%.docx' THEN 'Word'
            WHEN lower(l.filename) LIKE '%.xls' OR lower(l.filename) LIKE '%.xlsx' THEN 'Excel'
            WHEN lower(l.filename) LIKE '%.jpg' OR lower(l.filename) LIKE '%.jpeg' OR lower(l.filename) LIKE '%.png' THEN 'Image'
            ELSE 'Other'
        END as document_type,
        l.url as document_url,
        l.filename as document_name,
        l.created_at
    FROM links l
    WHERE l.created_by = id_arg
    ORDER BY l.created_at DESC;
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
    SELECT id FROM contacts WHERE user_id = id_arg OR created_by = id_arg
  )
  SELECT
    i.id,
    i.purchase_amount,
    i.investment_type,
    i.valuation_cap,
    i.discount,
    i.date,
    json_build_object('id', fc.id, 'name', fc.name, 'title', fc.title, 'email', fc.email) AS founder,
    json_build_object('id', c.id, 'name', c.name, 'street', c.street, 'city_state_zip', c.city_state_zip, 'state_of_incorporation', c.state_of_incorporation) AS company,
    json_build_object('id', ic.id, 'name', ic.name, 'title', ic.title, 'email', ic.email) AS investor,
    json_build_object('id', f.id, 'name', f.name, 'byline', f.byline, 'street', f.street, 'city_state_zip', f.city_state_zip) AS fund,
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
    LEFT JOIN contacts fc ON i.founder_contact_id = fc.id
    LEFT JOIN companies c ON i.company_id = c.id
    LEFT JOIN contacts ic ON i.investor_contact_id = ic.id
    LEFT JOIN funds f ON i.fund_id = f.id
    LEFT JOIN side_letters sl ON i.side_letter_id = sl.id
  WHERE
    i.founder_contact_id IN (SELECT id FROM user_contacts)
    OR i.investor_contact_id IN (SELECT id FROM user_contacts)
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
    SELECT id FROM contacts WHERE user_id = id_arg OR created_by = id_arg
  )
  SELECT
    i.id,
    i.purchase_amount,
    i.investment_type,
    i.valuation_cap,
    i.discount,
    i.date,
    json_build_object('id', fc.id, 'name', fc.name, 'title', fc.title, 'email', fc.email) AS founder,
    json_build_object('id', c.id, 'name', c.name, 'street', c.street, 'city_state_zip', c.city_state_zip, 'state_of_incorporation', c.state_of_incorporation) AS company,
    json_build_object('id', ic.id, 'name', ic.name, 'title', ic.title, 'email', ic.email) AS investor,
    json_build_object('id', f.id, 'name', f.name, 'byline', f.byline, 'street', f.street, 'city_state_zip', f.city_state_zip) AS fund,
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
    LEFT JOIN contacts fc ON i.founder_contact_id = fc.id
    LEFT JOIN companies c ON i.company_id = c.id
    LEFT JOIN contacts ic ON i.investor_contact_id = ic.id
    LEFT JOIN funds f ON i.fund_id = f.id
    LEFT JOIN side_letters sl ON i.side_letter_id = sl.id
  WHERE
    i.id = investment_id_arg
    AND (i.founder_contact_id IN (SELECT id FROM user_contacts)
         OR i.investor_contact_id IN (SELECT id FROM user_contacts)
         OR i.created_by = id_arg);
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_links(id_arg uuid)
 RETURNS SETOF links
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT *
  FROM links
  WHERE created_by = id_arg;
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
    SELECT link_id, COUNT(*) AS view_count
    FROM viewers
    GROUP BY link_id
  ) v ON l.id = v.link_id
  WHERE 
    l.created_by = id_arg
  ORDER BY 
    l.created_at DESC;
END;
$function$
;