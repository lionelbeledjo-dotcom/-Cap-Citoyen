import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { translateAuthError } from "@/lib/auth-errors";

export const Route = createFileRoute("/mot-de-passe-oublie")({
  head: () => ({
    meta: [
      { title: "Mot de passe oublié — Cap Citoyen" },
      { name: "description", content: "Réinitialisez votre mot de passe Cap Citoyen." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Adresse email invalide.");
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/connexion`,
    });
    setSubmitting(false);
    if (error) return toast.error(translateAuthError(error.message));
    setSent(true);
    toast.success("Email de réinitialisation envoyé.");
  };

  return (
    <AppShell>
      <div className="container mx-auto max-w-md px-4 py-16">
        <Card className="shadow-elegant rounded-2xl">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Mot de passe oublié</CardTitle>
            <p className="text-sm text-muted-foreground">
              Saisissez votre email, nous vous enverrons un lien de réinitialisation.
            </p>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4 text-sm">
                <p>Si un compte existe avec cet email, un lien vient d'être envoyé.</p>
                <Button asChild className="w-full"><Link to="/connexion">Retour à la connexion</Link></Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Envoi…" : "Envoyer le lien"}
                </Button>
                <p className="text-center text-sm">
                  <Link to="/connexion" className="text-france-blue hover:underline">Retour à la connexion</Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
