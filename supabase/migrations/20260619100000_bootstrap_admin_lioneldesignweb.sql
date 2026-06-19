-- Bootstrap admin pour lioneldesignweb
-- Si le rôle existe déjà, ON CONFLICT ignore l'insert
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'lioneldesignweb@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
