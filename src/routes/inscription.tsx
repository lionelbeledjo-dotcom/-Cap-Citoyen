import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { translateAuthError } from "@/lib/auth-errors";

export const Route = createFileRoute("/inscription")({
  head: () => ({
    meta: [
      { title: "Inscription — Cap Citoyen" },
      { name: "description", content: "Créez votre compte Cap Citoyen pour préparer vos démarches." },
    ],
  }),
  component: InscriptionPage,
});

function InscriptionPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ nom?: string; email?: string; password?: string; confirm?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/tableau-bord" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!nom.trim()) errs.nom = "Votre nom est requis.";
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Adresse email invalide.";
    if (password.length < 8) errs.password = "Au moins 8 caractères.";
    if (confirm !== password) errs.confirm = "Les mots de passe ne correspondent pas.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nom },
        emailRedirectTo: `${window.location.origin}/tableau-bord`,
      },
    });
    setSubmitting(false);
    if (error) {
      const msg = translateAuthError(error.message);
      toast.error(msg);
      setErrors({ email: msg });
      return;
    }
    if (data.session) {
      toast.success("Compte créé !");
      navigate({ to: "/tableau-bord" });
    } else {
      toast.success("Vérifiez votre email pour activer votre compte.");
      navigate({ to: "/connexion" });
    }
  };

  return (
    <AppShell>
      <div className="container mx-auto max-w-md px-4 py-16">
        <Card className="shadow-elegant rounded-2xl">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Créer un compte</CardTitle>
            <p className="text-sm text-muted-foreground">Commencez gratuitement votre parcours.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} aria-invalid={!!errors.nom} />
                {errors.nom && <p className="mt-1 text-xs text-destructive">{errors.nom}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} />
                {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
              </div>
              <div>
                <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                <Input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={!!errors.confirm} />
                {errors.confirm && <p className="mt-1 text-xs text-destructive">{errors.confirm}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Création…" : "Créer mon compte"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Déjà inscrit ?{" "}
                <Link to="/connexion" className="text-france-blue hover:underline">Se connecter</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
