import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AppShell, SourceBadge } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/parcours/$moduleId/lecon/$leconId")({
  component: LeconPage,
});

function LeconPage() {
  const { moduleId, leconId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: lecon, isLoading } = useQuery({
    queryKey: ["lecon", leconId],
    queryFn: async () => {
      const { data } = await supabase
        .from("lecons")
        .select("*, modules(id, titre)")
        .eq("id", leconId)
        .maybeSingle();
      return data;
    },
  });

  const { data: allLecons } = useQuery({
    queryKey: ["module-lecons", moduleId],
    queryFn: async () => {
      const { data } = await supabase
        .from("lecons")
        .select("id, titre, ordre")
        .eq("module_id", moduleId)
        .order("ordre");
      return data ?? [];
    },
  });

  const { data: prog } = useQuery({
    queryKey: ["prog", leconId, user?.id],
    queryFn: async () =>
      (await supabase.from("progression").select("statut").eq("user_id", user!.id).eq("lecon_id", leconId).maybeSingle()).data,
    enabled: !!user?.id,
  });

  const marquerTermine = async () => {
    if (!user?.id) return;
    const { error } = await supabase.from("progression").upsert(
      { user_id: user.id, lecon_id: leconId, statut: "termine" },
      { onConflict: "user_id,lecon_id" }
    );
    if (error) return toast.error(error.message);
    toast.success("Leçon marquée comme terminée !");
    qc.invalidateQueries({ queryKey: ["prog"] });
    qc.invalidateQueries({ queryKey: ["progression"] });
  };

  if (isLoading) {
    return <AppShell><div className="container mx-auto max-w-3xl px-4 py-10 text-muted-foreground">Chargement…</div></AppShell>;
  }
  if (!lecon) {
    return <AppShell><div className="container mx-auto max-w-3xl px-4 py-10 text-muted-foreground">Leçon introuvable.</div></AppShell>;
  }

  const done = prog?.statut === "termine";
  const currentIdx = allLecons?.findIndex((l) => l.id === leconId) ?? -1;
  const nextLecon = allLecons && currentIdx >= 0 && currentIdx < allLecons.length - 1
    ? allLecons[currentIdx + 1]
    : null;
  const moduleTitre = (lecon as any).modules?.titre ?? "Module";

  return (
    <AppShell>
      <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
        {/* Fil d'Ariane */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
          <Link to="/parcours" className="hover:text-foreground transition-colors">Parcours</Link>
          <span>/</span>
          <Link to="/parcours/$moduleId" params={{ moduleId }} className="hover:text-foreground transition-colors">{moduleTitre}</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{lecon.titre}</span>
        </nav>

        {/* Contenu */}
        <Card className="shadow-card">
          <CardContent className="p-8 space-y-6">
            <h1 className="font-display text-3xl font-bold">{lecon.titre}</h1>

            <article className="prose prose-slate max-w-none prose-headings:font-display prose-h2:text-xl prose-h2:mt-6 prose-h3:text-lg prose-strong:text-foreground prose-a:text-primary">
              <ReactMarkdown>{lecon.contenu_markdown}</ReactMarkdown>
            </article>

            <SourceBadge source={lecon.source_officielle} date={lecon.date_verification} />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {done ? (
            <Button variant="outline" disabled className="border-success text-success">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Leçon terminée
            </Button>
          ) : (
            <Button onClick={marquerTermine} className="bg-gradient-republic">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Marquer comme terminé
            </Button>
          )}

          {nextLecon ? (
            <Button asChild variant={done ? "default" : "outline"}>
              <Link to="/parcours/$moduleId/lecon/$leconId" params={{ moduleId, leconId: nextLecon.id }}>
                Leçon suivante <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/parcours/$moduleId" params={{ moduleId }}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Retour au module
              </Link>
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
