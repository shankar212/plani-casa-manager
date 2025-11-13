-- Grant 'customer' role to the currently logged-in user so they can create projects
INSERT INTO public.user_roles (user_id, role)
VALUES ('4c28219d-7ab0-4e22-a31e-7dc3be7a16a0', 'customer')
ON CONFLICT (user_id, role) DO NOTHING;