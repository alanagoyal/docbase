BEGIN;

-- Drop all dependent policies
DROP POLICY IF EXISTS "Investors and founders in investment with fund can delete" ON "public"."companies";
DROP POLICY IF EXISTS "Investors and founders in investment with fund can update" ON "public"."companies";
DROP POLICY IF EXISTS "Founders and investors of investment with company can delete" ON "public"."funds";
DROP POLICY IF EXISTS "Founders and investors of investment with company can update" ON "public"."funds";
DROP POLICY IF EXISTS "Founders or investors in investment can delete" ON "public"."investments";
DROP POLICY IF EXISTS "Authenticated users can delete themselves" ON "public"."users";

-- Drop all dependent foreign key constraints
ALTER TABLE "public"."investments" DROP CONSTRAINT IF EXISTS "investments_created_by_fkey";
ALTER TABLE "public"."investments" DROP CONSTRAINT IF EXISTS "investments_founder_id_fkey";
ALTER TABLE "public"."investments" DROP CONSTRAINT IF EXISTS "investments_investor_id_fkey";
ALTER TABLE "public"."links" DROP CONSTRAINT IF EXISTS "links_created_by_fkey";
ALTER TABLE "public"."contacts" DROP CONSTRAINT IF EXISTS "contacts_created_by_fkey";
ALTER TABLE "public"."groups" DROP CONSTRAINT IF EXISTS "groups_created_by_fkey";
ALTER TABLE "public"."companies" DROP CONSTRAINT IF EXISTS "companies_founder_id_fkey";
ALTER TABLE "public"."funds" DROP CONSTRAINT IF EXISTS "funds_investor_id_fkey";

-- Drop constraints on the users table
ALTER TABLE "public"."users" DROP CONSTRAINT IF EXISTS "users_pkey";
ALTER TABLE "public"."users" DROP CONSTRAINT IF EXISTS "users_id_key";
ALTER TABLE "public"."users" DROP CONSTRAINT IF EXISTS "users_id_fkey";

-- Update the id column to use the values from id
UPDATE "public"."users" SET id = id::uuid;

-- Drop the id column
ALTER TABLE "public"."users" DROP COLUMN IF EXISTS "id";

-- Set the id as the primary key
ALTER TABLE "public"."users" ADD PRIMARY KEY (id);

-- Recreate foreign key constraints
ALTER TABLE "public"."investments" ADD CONSTRAINT "investments_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE "public"."investments" ADD CONSTRAINT "investments_founder_id_fkey" FOREIGN KEY (founder_id) REFERENCES users(id);
ALTER TABLE "public"."investments" ADD CONSTRAINT "investments_investor_id_fkey" FOREIGN KEY (investor_id) REFERENCES users(id);
ALTER TABLE "public"."links" ADD CONSTRAINT "links_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE "public"."contacts" ADD CONSTRAINT "contacts_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE "public"."groups" ADD CONSTRAINT "groups_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE "public"."companies" ADD CONSTRAINT "companies_founder_id_fkey" FOREIGN KEY (founder_id) REFERENCES users(id);
ALTER TABLE "public"."funds" ADD CONSTRAINT "funds_investor_id_fkey" FOREIGN KEY (investor_id) REFERENCES users(id);

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (new.id, new.email, now())
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = now();
  RETURN new;
END;
$function$;

-- Recreate policies
CREATE POLICY "Authenticated users can delete themselves" ON "public"."users"
AS PERMISSIVE FOR DELETE
TO public
USING (auth.uid() = id);

CREATE POLICY "Investors and founders in investment with fund can delete" ON "public"."companies"
AS PERMISSIVE FOR DELETE
TO public
USING ((auth.uid() = (SELECT users.id FROM users WHERE users.id = companies.founder_id)) OR 
       (EXISTS (SELECT 1 FROM investments i JOIN users u ON u.id = i.investor_id 
                WHERE i.company_id = companies.id AND u.id = auth.uid())));

CREATE POLICY "Investors and founders in investment with fund can update" ON "public"."companies"
AS PERMISSIVE FOR UPDATE
TO public
USING ((auth.uid() = (SELECT users.id FROM users WHERE users.id = companies.founder_id)) OR 
       (EXISTS (SELECT 1 FROM investments i JOIN users u ON u.id = i.investor_id 
                WHERE i.company_id = companies.id AND u.id = auth.uid())));

CREATE POLICY "Founders and investors of investment with company can delete" ON "public"."funds"
AS PERMISSIVE FOR DELETE
TO public
USING ((auth.uid() = (SELECT users.id FROM users WHERE users.id = funds.investor_id)) OR 
       (EXISTS (SELECT 1 FROM investments i JOIN users u ON u.id = i.founder_id 
                WHERE i.fund_id = funds.id AND u.id = auth.uid())));

CREATE POLICY "Founders and investors of investment with company can update" ON "public"."funds"
AS PERMISSIVE FOR UPDATE
TO public
USING ((auth.uid() = (SELECT users.id FROM users WHERE users.id = funds.investor_id)) OR 
       (EXISTS (SELECT 1 FROM investments i JOIN users u ON u.id = i.founder_id 
                WHERE i.fund_id = funds.id AND u.id = auth.uid())));

CREATE POLICY "Founders or investors in investment can delete" ON "public"."investments"
AS PERMISSIVE FOR DELETE
TO public
USING ((auth.uid() = created_by) OR 
       (auth.uid() = (SELECT users.id FROM users WHERE users.id = investments.founder_id)) OR 
       (auth.uid() = (SELECT users.id FROM users WHERE users.id = investments.investor_id)) OR 
       (auth.uid() IN (SELECT users.id FROM users WHERE users.id IN 
                      (SELECT funds.investor_id FROM funds WHERE funds.id = investments.fund_id))) OR 
       (auth.uid() IN (SELECT users.id FROM users WHERE users.id IN 
                      (SELECT companies.founder_id FROM companies WHERE companies.id = investments.company_id))));

COMMIT;