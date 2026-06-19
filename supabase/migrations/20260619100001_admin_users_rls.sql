-- Permettre aux admins de voir tous les profils
CREATE POLICY "Admins voient tous les profils"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Permettre aux admins de lire tous les rôles
CREATE POLICY "Admins voient tous les rôles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Permettre aux admins d'insérer des rôles
CREATE POLICY "Admins ajoutent des rôles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Permettre aux admins de supprimer des rôles
CREATE POLICY "Admins suppriment des rôles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Grants nécessaires
GRANT INSERT, DELETE ON public.user_roles TO authenticated;
