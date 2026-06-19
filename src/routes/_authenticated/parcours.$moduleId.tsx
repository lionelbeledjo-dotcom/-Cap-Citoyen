import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, CheckCircle2, ChevronRight, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/parcours/$moduleId")({
  component: ModulePage,
});

function ModulePage() {
  const { moduleId } = Route.useParams();
  const { user } = useAuth();

  const { data: mod, isLoading } = useQuery({
    queryKey: ["module-detail", moduleId],
    queryFn: async () => {
      const { data } = await supabase
        .from("modules")
        .select("id, titre, description, categorie, lecons(id, titre, ordre)")
        .eq("id", moduleId)
        .maybeSingle();
      return data;
    },
  });

  const { data: progression } = useQuery({
    queryKey: ["progression", user?.id],
    queryFn: async () =>
      (await supabase.from("progression").select("lecon_id, statut").eq("user_id", user!.id)).data ?? [],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return <AppShell><div className="container mx-auto max-w-3xl px-4 py-10 text-muted-foreground">Chargement…</div></AppShell>;
  }
  if (!mod) {
    return <AppShell><div className="container mx-auto max-w-3xl px-4 py-10 text-muted-foreground">Module introuvable.</div></AppShell>;
  }

  const lecons = (mod.lecons ?? []).sort((a: any, b: any) => a.ordre - b.ordre);
  const total = lecons.length;
  const doneCount = lecons.filter((l: any) => progression?.some((p) => p.lecon_id === l.id && p.statut === "termine")).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const nextLecon = lecons.find((l: any) => !progression?.some((p) => p.lecon_id === l.id && p.statut === "termine"));

  return (
    <AppShell>
      <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
        {/* Fil d'Ariane */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/parcours" className="hover:text-foreground transition-colors">Parcours</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{mod.titre}</span>
        </nav>

        {/* En-tête module */}
        <div className="space-y-4">
          <h1 className="font-display text-3xl font-bold">{mod.titre}</h1>
          {mod.description && <p className="text-muted-foreground">{mod.description}</p>}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={pct} className="h-2" />
            </div>
            <span className="text-sm font-medium">{doneCount}/{total}</span>
          </div>
        </div>

        {/* Bouton d'action principal */}
        {nextLecon && (
          <Button asChild size="lg" className="w-full bg-gradient-republic">
            <Link to="/parcours/$moduleId/lecon/$leconId" params={{ moduleId, leconId: nextLecon.id }}>
              <PlayCircle className="h-5 w-5 mr-2" />
              {doneCount === 0 ? "Commencer la première leçon" : "Continuer — " + nextLecon.titre}
            </Link>
          </Button>
        )}
        {!nextLecon && total > 0 && (
          <div className="rounded-lg bg-success/10 border border-success/30 p-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-success mx-auto mb-2" />
            <p className="font-medium">Module terminé !</p>
            <p className="text-sm text-muted-foreground">Vous pouvez revoir les leçons ci-dessous.</p>
          </div>
        )}

        {/* Liste des leçons */}
        <Card>
          <CardContent className="p-0 divide-y">
            {lecons.length === 0 && (
              <p className="p-6 text-sm text-muted-foreground">Aucune leçon dans ce module pour le moment.</p>
            )}
            {lecons.map((l: any, idx: number) => {
              const done = progression?.some((p) => p.lecon_id === l.id && p.statut === "termine");
              return (
                <Link
                  key={l.id}
                  to="/parcours/$moduleId/lecon/$leconId"
                  params={{ moduleId, leconId: l.id }}
                  className="flex items-center gap-3 p-4 hover:bg-accent transition group"
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>
                  <span className="flex-1 font-medium">{l.titre}</span>
                  {done && <Badge variant="outline" className="text-success border-success/30 text-xs">Terminé</Badge>}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Lien quiz */}
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link to="/quiz/$moduleId" params={{ moduleId }}>
              Tester mes connaissances (quiz)
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
