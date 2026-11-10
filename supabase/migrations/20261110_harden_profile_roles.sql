-- Public sign-up can create organization accounts, but cannot create admins.
-- Role changes must be made by a trusted server-side process.

BEGIN;

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
  AND role IN ('kitchen', 'fpu', 'ngo')
);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.prevent_authenticated_profile_role_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  IF auth.role() = 'authenticated'
     AND NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Account roles can only be changed by a trusted administrator.';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS prevent_authenticated_profile_role_change ON public.profiles;
CREATE TRIGGER prevent_authenticated_profile_role_change
BEFORE UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_authenticated_profile_role_change();

COMMIT;
