import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AppShell, SourceBadge } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trophy, XCircle, CheckCircle2, Clock, GraduationCap, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/examen-blanc")({
  component: ExamenBlanc,
});

const NB_QUESTIONS = 40;
const SEUIL = 32;
const DUREE_MIN = 30;

type Q = {
  id: string;
  enonce: string;
  options_json: string[];
  bonne_reponse: string;
  explication: string;
  source_officielle: string;
  date_verification: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ExamenBlanc() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<"intro" | "test" | "result">("intro");
  const [questions, setQuestions] = useState<Q[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remaining, setRemaining] = useState(DUREE_MIN * 60);

  const { data: allQuestions } = useQuery({
    queryKey: ["all-questions"],
    queryFn: async () => {
      const { data } = await supabase.from("questions").select("*");
      return (data ?? []) as any[];
    },
  });

  const start = () => {
    if (!allQuestions || allQuestions.length === 0) {
      toast.error("Aucune question disponible. L'admin doit en ajouter.");
      return;
    }
    const picked = shuffle(allQuestions).slice(0, Math.min(NB_QUESTIONS, allQuestions.length));
    setQuestions(picked);
    setAnswers({});
    setCurrent(0);
    setRemaining(DUREE_MIN * 60);
    setPhase("test");
  };

  useEffect(() => {
    if (phase !== "test") return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setPhase("result");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const score = useMemo(
    () => questions.reduce((s, q) => s + (answers[q.id] === q.bonne_reponse ? 1 : 0), 0),
    [questions, answers]
  );

  useEffect(() => {
    if (phase !== "result" || questions.length === 0 || !user?.id) return;
    const details = questions.map((q) => ({
      question_id: q.id,
      enonce: q.enonce,
      choisi: answers[q.id] ?? null,
      correct: q.bonne_reponse,
    }));
    supabase.from("quiz_tentatives").insert({
      user_id: user.id,
      score,
      total: questions.length,
      details_json: details as any,
    }).then(({ error }) => {
      if (error) toast.error(error.message);
    });
  }, [phase]); // eslint-disable-line

  if (phase === "intro") {
    return (
      <AppShell>
        <div className="container mx-auto max-w-3xl px-4 py-10">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="font-display text-2xl flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" /> Examen civique blanc
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Simulez l'examen officiel dans les mêmes conditions :
              </p>
              <ul className="space-y-2 text-sm">
                <li>• <strong>{NB_QUESTIONS} questions</strong> tirées aléatoirement</li>
                <li>• Durée : <strong>{DUREE_MIN} minutes</strong></li>
                <li>• Seuil de réussite : <strong>{SEUIL}/{NB_QUESTIONS} (80 %)</strong></li>
                <li>• Correction détaillée avec source officielle</li>
              </ul>
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                Questions disponibles dans la base : <strong>{allQuestions?.length ?? "…"}</strong>
              </div>
              <Button size="lg" className="w-full bg-gradient-republic" onClick={start}>
                Démarrer l'examen
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (phase === "test") {
    const q = questions[current];
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return (
      <AppShell>
        <div className="container mx-auto max-w-3xl px-4 py-8 space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-sm">Question {current + 1} / {questions.length}</Badge>
            <Badge className="bg-republic text-republic-foreground gap-1"><Clock className="h-3 w-3" /> {mins}:{secs.toString().padStart(2, "0")}</Badge>
          </div>
          <Progress value={((current + 1) / questions.length) * 100} />
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="font-medium text-lg">{q.enonce}</p>
              <div className="space-y-2">
                {(q.options_json as string[]).map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    className={`w-full text-left p-3 rounded-md border-2 transition ${
                      answers[q.id] === opt ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between gap-2">
            <Button variant="outline" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
              Précédent
            </Button>
            {current < questions.length - 1 ? (
              <Button onClick={() => setCurrent((c) => c + 1)} className="bg-gradient-republic">Suivant</Button>
            ) : (
              <Button onClick={() => setPhase("result")} className="bg-republic text-republic-foreground">Terminer l'examen</Button>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  // Result
  const pct = Math.round((score / questions.length) * 100);
  const reussi = score >= Math.ceil((SEUIL / NB_QUESTIONS) * questions.length);

  return (
    <AppShell>
      <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
        <Card className={reussi ? "border-success/40 shadow-elegant" : "border-destructive/40"}>
          <CardContent className="p-8 text-center space-y-3">
            {reussi ? (
              <Trophy className="h-14 w-14 mx-auto text-warning" />
            ) : (
              <XCircle className="h-14 w-14 mx-auto text-destructive" />
            )}
            <h1 className="font-display text-3xl font-bold">
              {reussi ? "Bravo, examen réussi !" : "Examen non réussi"}
            </h1>
            <div className="text-5xl font-bold font-display text-primary">{score} / {questions.length}</div>
            <p className="text-muted-foreground">{pct} % de bonnes réponses (seuil officiel : 80 %)</p>
            <Button onClick={() => setPhase("intro")} variant="outline">
              <RefreshCw className="h-4 w-4 mr-1" /> Recommencer
            </Button>
          </CardContent>
        </Card>

        <h2 className="font-display text-2xl font-semibold pt-4">Correction détaillée</h2>
        {questions.map((q, i) => {
          const userAns = answers[q.id];
          const ok = userAns === q.bonne_reponse;
          return (
            <Card key={q.id} className={ok ? "border-success/30" : "border-destructive/30"}>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start gap-2">
                  {ok ? <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />}
                  <p className="font-medium"><span className="text-muted-foreground">Q{i + 1}.</span> {q.enonce}</p>
                </div>
                <div className="text-sm space-y-1 pl-7">
                  <p>Votre réponse : <span className={ok ? "text-success font-medium" : "text-destructive font-medium"}>{userAns ?? "—"}</span></p>
                  {!ok && <p>Bonne réponse : <span className="text-success font-medium">{q.bonne_reponse}</span></p>}
                  <p className="text-muted-foreground italic">{q.explication}</p>
                </div>
                <SourceBadge source={q.source_officielle} date={q.date_verification} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
