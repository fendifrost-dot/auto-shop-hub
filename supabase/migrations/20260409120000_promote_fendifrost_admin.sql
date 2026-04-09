-- Grant admin role to the shop owner account.
-- Requires that the user has signed up at least once (row exists in auth.users).
-- Apply via: Supabase Dashboard → SQL → New query, or `supabase db push`.

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = lower('fendifrost@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;
