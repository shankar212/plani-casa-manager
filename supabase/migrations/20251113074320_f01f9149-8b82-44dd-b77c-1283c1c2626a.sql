-- Add customer role to the user who is trying to create projects
INSERT INTO public.user_roles (user_id, role)
VALUES ('7f987e2c-bd61-4dd1-af18-1e4e05b49f0c', 'customer')
ON CONFLICT (user_id, role) DO NOTHING;