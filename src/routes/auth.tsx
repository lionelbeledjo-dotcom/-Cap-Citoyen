import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Connexion — Cap Citoyen" },
      { name: "description", content: "Connectez-vous à Cap Citoyen pour suivre votre parcours." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/tableau-bord" });
  }, [user, loading, navigate]);

  return (
    <AppShell>
      <div className="container mx-auto max-w-md px-4 py-16">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Bienvenue sur Cap Citoyen</CardTitle>
            <p className="text-sm text-muted-foreground">
              Créez votre compte ou connectez-vous pour accéder à votre parcours.
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={mode === "signup" ? "signup" : "signin"}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>
              <TabsContent value="signin"><SignInForm /></TabsContent>
              <TabsContent value="signup"><SignUpForm /></TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Connecté !");
    navigate({ to: "/tableau-bord" });
  };

  const magic = async () => {
    if (!email) return toast.error("Saisissez votre email d'abord.");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/tableau-bord` },
    });
    if (error) return toast.error(error.message);
    toast.success("Lien magique envoyé !");
  };

  return (
    <form onSubmit={submit} className="space-y-4 mt-4">
      <div>
        <Label htmlFor="email-in">Email</Label>
        <Input id="email-in" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="password-in">Mot de passe</Label>
        <Input id="password-in" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" className="w-full bg-gradient-republic" disabled={submitting}>
        {submitting ? "Connexion…" : "Se connecter"}
      </Button>
      <Button type="button" variant="ghost" className="w-full" onClick={magic}>
        Recevoir un lien magique
      </Button>
    </form>
  );
}

function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Mot de passe d'au moins 8 caractères.");
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nom },
        emailRedirectTo: `${window.location.origin}/tableau-bord`,
      },
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Compte créé !");
    navigate({ to: "/tableau-bord" });
  };

  return (
    <form onSubmit={submit} className="space-y-4 mt-4">
      <div>
        <Label htmlFor="nom-up">Nom</Label>
        <Input id="nom-up" value={nom} onChange={(e) => setNom(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="email-up">Email</Label>
        <Input id="email-up" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="password-up">Mot de passe (≥ 8 caractères)</Label>
        <Input id="password-up" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" className="w-full bg-gradient-republic" disabled={submitting}>
        {submitting ? "Création…" : "Créer mon compte"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Le premier compte créé devient automatiquement administrateur.
      </p>
    </form>
  );
}
