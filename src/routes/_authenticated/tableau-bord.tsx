import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GraduationCap, ArrowRight, Trophy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tableau-bord")({
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const uid = user?.id;

  const { data: lecons } = useQuery({
    queryKey: ["lecons-all"],
    queryFn: async () => (await supabase.from("lecons").select("id, titre, module_id, ordre").order("ordre")).data ?? [],
    enabled: !!uid,
  });
  const { data: progression } = useQuery({
    queryKey: ["progression", uid],
    queryFn: async () => (await supabase.from("progression").select("lecon_id, statut").eq("user_id", uid!)).data ?? [],
    enabled: !!uid,
  });
  const { data: tentatives } = useQuery({
    queryKey: ["tentatives", uid],
    queryFn: async () =>
      (await supabase.from("quiz_tentatives").select("score, total, date").eq("user_id", uid!).order("date", { ascending: true })).data ?? [],
    enabled: !!uid,
  });

  if (loading || !user) {
    return (
      <AppShell>
        <div className="container mx-auto max-w-6xl px-4 py-10">
          <p className="text-muted-foreground">Chargement…</p>
        </div>
      </AppShell>
    );
  }

  const total = lecons?.length ?? 0;
  const done = progression?.filter((p) => p.statut === "termine").length ?? 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const next = lecons?.find((l) => !progression?.some((p) => p.lecon_id === l.id && p.statut === "termine"));

  const chartData = (tentatives ?? []).map((t, i) => ({
    n: `#${i + 1}`,
    score: Math.round((t.score / t.total) * 100),
  }));

  const lastScore = tentatives?.[tentatives.length - 1];

  return (
    <AppShell>
      <div className="container mx-auto max-w-6xl px-4 py-10 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Bonjour {user?.email?.split("@")[0]} 👋</h1>
          <p className="text-muted-foreground">Voici votre progression sur Cap Citoyen.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Progression globale</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">{pct}%</div>
              <Progress value={pct} className="mt-3" />
              <p className="text-xs text-muted-foreground mt-2">{done} sur {total} leçons terminées</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Dernier examen</CardTitle></CardHeader>
            <CardContent>
              {lastScore ? (
                <>
                  <div className="text-3xl font-bold font-display flex items-center gap-2">
                    {lastScore.score}/{lastScore.total}
                    {lastScore.score / lastScore.total >= 0.8 && <Trophy className="h-6 w-6 text-warning" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(lastScore.date).toLocaleDateString("fr-FR")}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune tentative encore — lancez votre 1er examen blanc.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Tentatives</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">{tentatives?.length ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-2">Examens blancs réalisés</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="font-display">Évolution de vos scores</CardTitle></CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-12 text-center">Réalisez un examen blanc pour voir votre progression.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.012 250)" />
                      <XAxis dataKey="n" />
                      <YAxis domain={[0, 100]} unit="%" />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="oklch(0.34 0.13 265)" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-republic text-primary-foreground">
            <CardHeader><CardTitle className="font-display flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Mon parcours</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {next ? (
                <>
                  <p className="text-sm opacity-90">
                    {done === 0 ? "Commencez votre première leçon :" : "Prochaine leçon :"}
                  </p>
                  <p className="font-semibold">{next.titre}</p>
                  <Button asChild variant="secondary" className="w-full">
                    <Link to="/parcours/$moduleId/lecon/$leconId" params={{ moduleId: next.module_id, leconId: next.id }}>
                      {done === 0 ? "Commencer" : "Reprendre"} <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </>
              ) : (
                <p className="text-sm">Toutes les leçons sont terminées. Lancez un examen blanc !</p>
              )}
              <Button asChild variant="outline" className="w-full border-white/40 text-white hover:bg-white/10 hover:text-white">
                <Link to="/examen-blanc">Examen civique blanc</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
