import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SourceBadge } from "@/components/app-shell";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/lecon/$leconId")({
  component: LeconPage,
});

function LeconPage() {
  const { leconId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: lecon, isLoading } = useQuery({
    queryKey: ["lecon", leconId],
    queryFn: async () => {
      const { data } = await supabase.from("lecons").select("*, modules(titre, categorie)").eq("id", leconId).maybeSingle();
      return data;
    },
  });

  const { data: prog } = useQuery({
    queryKey: ["prog", leconId, user?.id],
    queryFn: async () =>
      (await supabase.from("progression").select("statut").eq("user_id", user!.id).eq("lecon_id", leconId).maybeSingle()).data,
  });

  const marquerTermine = async () => {
    const { error } = await supabase.from("progression").upsert(
      { user_id: user!.id, lecon_id: leconId, statut: "termine" },
      { onConflict: "user_id,lecon_id" }
    );
    if (error) return toast.error(error.message);
    toast.success("Leçon marquée comme terminée");
    qc.invalidateQueries({ queryKey: ["prog"] });
    qc.invalidateQueries({ queryKey: ["progression"] });
  };

  if (isLoading) return <AppShell><div className="container mx-auto max-w-3xl px-4 py-10">Chargement…</div></AppShell>;
  if (!lecon) return <AppShell><div className="container mx-auto max-w-3xl px-4 py-10">Leçon introuvable.</div></AppShell>;

  const done = prog?.statut === "termine";

  return (
    <AppShell>
      <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/parcours" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour au parcours
        </Button>

        <Card className="shadow-card">
          <CardContent className="p-8 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{(lecon as any).modules?.titre}</p>
              <h1 className="font-display text-3xl font-bold mt-1">{lecon.titre}</h1>
            </div>

            <article className="prose prose-slate max-w-none prose-headings:font-display prose-h2:text-xl prose-h2:mt-6 prose-h3:text-lg prose-strong:text-foreground prose-a:text-primary">
              <ReactMarkdown>{lecon.contenu_markdown}</ReactMarkdown>
            </article>

            <SourceBadge source={lecon.source_officielle} date={lecon.date_verification} />

            <div className="pt-4 border-t flex flex-wrap gap-3">
              {done ? (
                <Button variant="outline" disabled className="border-success text-success">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Leçon terminée
                </Button>
              ) : (
                <Button onClick={marquerTermine} className="bg-gradient-republic">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Marquer comme terminé
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to="/parcours">Continuer le parcours</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
