
-- 1. Neutraliser le trigger de bootstrap : tout nouveau compte = 'user'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nom)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nom', split_part(NEW.email,'@',1)));

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- 2. Fonction sécurisée pour qu'un admin promeuve / change le rôle d'un autre compte
CREATE OR REPLACE FUNCTION public.set_user_role(_email text, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden: only admins can change roles';
  END IF;

  SELECT id INTO v_target FROM auth.users WHERE email = _email;
  IF v_target IS NULL THEN
    RAISE EXCEPTION 'No user found with email %', _email;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_target, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- 3. Fonction sécurisée pour retirer un rôle
CREATE OR REPLACE FUNCTION public.remove_user_role(_email text, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden: only admins can change roles';
  END IF;

  SELECT id INTO v_target FROM auth.users WHERE email = _email;
  IF v_target IS NULL THEN
    RAISE EXCEPTION 'No user found with email %', _email;
  END IF;

  DELETE FROM public.user_roles WHERE user_id = v_target AND role = _role;
END;
$$;

REVOKE ALL ON FUNCTION public.set_user_role(text, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.remove_user_role(text, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_user_role(text, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_user_role(text, app_role) TO authenticated;
