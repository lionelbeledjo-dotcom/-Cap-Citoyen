import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ListChecks, Trophy, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [{ count: profilesC }, { count: questionsC }, { data: tentatives }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("questions").select("*", { count: "exact", head: true }),
        supabase.from("quiz_tentatives").select("score, total"),
      ]);
      const totalTent = tentatives?.length ?? 0;
      const avgPct = totalTent
        ? Math.round(
            (tentatives!.reduce((s, t) => s + t.score / t.total, 0) / totalTent) * 100
          )
        : 0;
      const reussis = tentatives?.filter((t) => t.score / t.total >= 0.8).length ?? 0;
      return { profilesC, questionsC, totalTent, avgPct, reussis };
    },
  });

  return (
    <AppShell>
      <div className="container mx-auto max-w-6xl px-4 py-10 space-y-6">
        <h1 className="font-display text-3xl font-bold">Tableau de bord admin</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={<Users />} label="Utilisateurs" value={stats?.profilesC ?? "…"} />
          <Stat icon={<ListChecks />} label="Questions en base" value={stats?.questionsC ?? "…"} />
          <Stat icon={<Trophy />} label="Tentatives d'examen" value={stats?.totalTent ?? "…"} />
          <Stat icon={<AlertTriangle />} label="Taux de réussite moyen" value={stats ? `${stats.avgPct} %` : "…"} />
        </div>

        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Recommandations</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>• Atteignez au moins <strong>100 questions</strong> pour garantir un tirage varié à l'examen blanc.</p>
            <p>• Vérifiez chaque trimestre les dates de vérification et les sources officielles.</p>
            <p>• Le premier compte inscrit a été automatiquement promu administrateur.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold font-display">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
