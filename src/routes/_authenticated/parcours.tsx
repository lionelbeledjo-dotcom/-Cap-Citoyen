import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { IdCard, Flag, GraduationCap, Languages, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/parcours")({
  component: ParcoursPage,
});

const CATEGORIES: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  langue: { label: "Langue française", icon: Languages },
  carte_resident: { label: "Carte de résident", icon: IdCard },
  naturalisation: { label: "Naturalisation", icon: Flag },
  examen_civique: { label: "Examen civique", icon: GraduationCap },
};

function ParcoursPage() {
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
  });

  return (
    <AppShell>
      <div className="container mx-auto max-w-5xl px-4 py-10 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Parcours d'apprentissage</h1>
          <p className="text-muted-foreground">Modules organisés par thématique. Chaque leçon cite ses sources officielles.</p>
        </div>

        <div className="space-y-6">
          {modules?.map((m: any) => {
            const cat = CATEGORIES[m.categorie] ?? { label: m.categorie, icon: GraduationCap };
            const Icon = cat.icon;
            const lecons = (m.lecons ?? []).sort((a: any, b: any) => a.ordre - b.ordre);
            const doneCount = lecons.filter((l: any) => progression?.some((p) => p.lecon_id === l.id && p.statut === "termine")).length;
            return (
              <Card key={m.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 bg-muted/40 px-6 py-4 border-b">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-display text-xl font-semibold">{m.titre}</h2>
                      <p className="text-sm text-muted-foreground">{m.description}</p>
                    </div>
                    <Badge variant="secondary">{doneCount}/{lecons.length}</Badge>
                  </div>
                  <ul className="divide-y">
                    {lecons.length === 0 && <li className="p-6 text-sm text-muted-foreground">Aucune leçon dans ce module pour le moment.</li>}
                    {lecons.map((l: any) => {
                      const done = progression?.some((p) => p.lecon_id === l.id && p.statut === "termine");
                      return (
                        <li key={l.id}>
                          <Link
                            to="/lecon/$leconId"
                            params={{ leconId: l.id }}
                            className="flex items-center gap-3 p-4 hover:bg-accent transition group"
                          >
                            <div className={`h-2 w-2 rounded-full ${done ? "bg-success" : "bg-muted-foreground/30"}`} />
                            <span className="flex-1">{l.titre}</span>
                            {done && <Badge variant="outline" className="text-success border-success/30">Terminé</Badge>}
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
