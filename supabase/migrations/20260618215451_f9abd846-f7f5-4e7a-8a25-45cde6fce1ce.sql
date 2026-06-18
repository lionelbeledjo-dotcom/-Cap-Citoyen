
-- ============= ENUMS =============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.module_categorie AS ENUM ('carte_resident','naturalisation','examen_civique','langue');
CREATE TYPE public.question_type AS ENUM ('qcm','vrai_faux');
CREATE TYPE public.progression_statut AS ENUM ('non_commence','en_cours','termine');
CREATE TYPE public.type_demarche AS ENUM ('carte_resident','naturalisation');

-- ============= PROFILES =============
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  nom TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Utilisateurs voient leur profil" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Utilisateurs modifient leur profil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Insert auto" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ============= USER_ROLES =============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lire ses propres rôles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============= TRIGGER : profile + 1er admin auto =============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_count INT;
BEGIN
  INSERT INTO public.profiles (id, email, nom)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nom', split_part(NEW.email,'@',1)));

  SELECT count(*) INTO v_count FROM public.user_roles;
  IF v_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============= MODULES =============
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  description TEXT,
  categorie module_categorie NOT NULL,
  ordre INT NOT NULL DEFAULT 0,
  icone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.modules TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.modules TO authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules visibles à tous" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Admins gèrent modules ins" ON public.modules FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins gèrent modules upd" ON public.modules FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins gèrent modules del" ON public.modules FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============= LECONS =============
CREATE TABLE public.lecons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  contenu_markdown TEXT NOT NULL,
  source_officielle TEXT NOT NULL,
  date_verification DATE NOT NULL,
  ordre INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lecons TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.lecons TO authenticated;
GRANT ALL ON public.lecons TO service_role;
ALTER TABLE public.lecons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecons visibles à tous" ON public.lecons FOR SELECT USING (true);
CREATE POLICY "Admins gèrent lecons ins" ON public.lecons FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins gèrent lecons upd" ON public.lecons FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins gèrent lecons del" ON public.lecons FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============= QUESTIONS =============
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  enonce TEXT NOT NULL,
  type question_type NOT NULL DEFAULT 'qcm',
  options_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  bonne_reponse TEXT NOT NULL,
  explication TEXT NOT NULL,
  source_officielle TEXT NOT NULL,
  date_verification DATE NOT NULL,
  difficulte INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.questions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions visibles authentifiés" ON public.questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins gèrent questions ins" ON public.questions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins gèrent questions upd" ON public.questions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins gèrent questions del" ON public.questions FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============= QUIZ_TENTATIVES =============
CREATE TABLE public.quiz_tentatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
  score INT NOT NULL,
  total INT NOT NULL,
  details_json JSONB,
  date TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.quiz_tentatives TO authenticated;
GRANT ALL ON public.quiz_tentatives TO service_role;
ALTER TABLE public.quiz_tentatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voir ses tentatives" ON public.quiz_tentatives FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Créer ses tentatives" ON public.quiz_tentatives FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============= PROGRESSION =============
CREATE TABLE public.progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lecon_id UUID NOT NULL REFERENCES public.lecons(id) ON DELETE CASCADE,
  statut progression_statut NOT NULL DEFAULT 'non_commence',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lecon_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progression TO authenticated;
GRANT ALL ON public.progression TO service_role;
ALTER TABLE public.progression ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voir sa progression" ON public.progression FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insérer sa progression" ON public.progression FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Modifier sa progression" ON public.progression FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Supprimer sa progression" ON public.progression FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============= CHECKLIST_ITEMS =============
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type_demarche type_demarche NOT NULL,
  intitule TEXT NOT NULL,
  est_coche BOOLEAN NOT NULL DEFAULT false,
  ordre INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checklist_items TO authenticated;
GRANT ALL ON public.checklist_items TO service_role;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voir sa checklist" ON public.checklist_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Créer sa checklist" ON public.checklist_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Modifier sa checklist" ON public.checklist_items FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Supprimer sa checklist" ON public.checklist_items FOR DELETE TO authenticated USING (auth.uid() = user_id);
