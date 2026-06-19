import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { IdCard, Flag, GraduationCap, Languages, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/parcours/")({
  component: ParcoursIndex,
});

const CATEGORIES: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  langue: { label: "Langue française", icon: Languages },
  carte_resident: { label: "Carte de résident", icon: IdCard },
  naturalisation: { label: "Naturalisation", icon: Flag },
  examen_civique: { label: "Examen civique", icon: GraduationCap },
};

function ParcoursIndex() {
  const { user } = useAuth();
  const { data: modules } = useQuery({
    queryKey: ["modules-lecons"],
    queryFn: async () => {
      const { data } = await supabase
        .from("modules")
        .select("id, titre, description, categorie, ordre, lecons(id, titre, ordre)")
        .order("ordre");
      return data ?? [];
    },
  });
  const { data: progression } = useQuery({
    queryKey: ["progression", user?.id],
    queryFn: async () =>
      (await supabase.from("progression").select("lecon_id, statut").eq("user_id", user!.id)).data ?? [],
    enabled: !!user?.id,
  });

  return (
    <AppShell>
      <div className="container mx-auto max-w-5xl px-4 py-10 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Parcours d'apprentissage</h1>
          <p className="text-muted-foreground">Cliquez sur un module pour voir ses leçons et commencer l'apprentissage.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {modules?.map((m: any) => {
            const cat = CATEGORIES[m.categorie] ?? { label: m.categorie, icon: GraduationCap };
            const Icon = cat.icon;
            const lecons = (m.lecons ?? []).sort((a: any, b: any) => a.ordre - b.ordre);
            const total = lecons.length;
            const doneCount = lecons.filter((l: any) => progression?.some((p) => p.lecon_id === l.id && p.statut === "termine")).length;
            const pct = total ? Math.round((doneCount / total) * 100) : 0;
            const status = doneCount === 0 ? "non_commence" : doneCount >= total ? "termine" : "en_cours";
            const statusLabel = status === "non_commence" ? "Commencer" : status === "termine" ? "Revoir" : "Reprendre";

            return (
              <Link key={m.id} to="/parcours/$moduleId" params={{ moduleId: m.id }} className="block group">
                <Card className="h-full hover:shadow-elegant transition-all hover:-translate-y-0.5">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">{m.titre}</h2>
                        <p className="text-sm text-muted-foreground line-clamp-2">{m.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{doneCount}/{total} leçons</span>
                        <Badge variant={status === "termine" ? "default" : status === "en_cours" ? "secondary" : "outline"}>
                          {statusLabel}
                        </Badge>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {(!modules || modules.length === 0) && (
          <p className="text-center text-muted-foreground py-12">Aucun module disponible pour le moment.</p>
        )}
      </div>
    </AppShell>
  );
}
