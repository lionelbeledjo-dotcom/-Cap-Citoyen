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

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion — Cap Citoyen" },
      { name: "description", content: "Connectez-vous à Cap Citoyen pour suivre votre parcours." },
    ],
  }),
  component: ConnexionPage,
});

function ConnexionPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/tableau-de-bord" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Adresse email invalide.";
    if (!password) errs.password = "Mot de passe requis.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      const msg = translateAuthError(error.message);
      toast.error(msg);
      setErrors({ password: msg });
      return;
    }
    toast.success("Connecté !");
    navigate({ to: "/tableau-de-bord" });
  };

  return (
    <AppShell>
      <div className="container mx-auto max-w-md px-4 py-16">
        <Card className="shadow-elegant rounded-2xl">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Connexion</CardTitle>
            <p className="text-sm text-muted-foreground">Accédez à votre parcours Cap Citoyen.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} />
                {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Connexion…" : "Se connecter"}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <Link to="/mot-de-passe-oublie" className="text-france-blue hover:underline">Mot de passe oublié ?</Link>
                <Link to="/inscription" className="text-france-blue hover:underline">Créer un compte</Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
