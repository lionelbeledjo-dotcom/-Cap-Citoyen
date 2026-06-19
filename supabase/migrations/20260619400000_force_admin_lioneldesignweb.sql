-- Force le rôle admin pour lioneldesignweb (peu importe quand le compte a été créé)
-- Couvre les variantes d'email possibles

-- Tentative 1 : email exact
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'lioneldesignweb@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Tentative 2 : email ILIKE au cas où casse différente
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email ILIKE 'lioneldesignweb%'
ON CONFLICT (user_id, role) DO NOTHING;

-- Tentative 3 : email lbcloudadmin (email admin secondaire)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'lbcloudadmin@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
