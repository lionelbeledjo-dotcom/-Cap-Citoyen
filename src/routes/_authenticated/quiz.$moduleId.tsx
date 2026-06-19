import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AppShell, SourceBadge } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/quiz/$moduleId")({
  component: QuizPage,
});

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

function QuizPage() {
  const { moduleId } = Route.useParams();
  const { user } = useAuth();
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const { data: allQuestions } = useQuery({
    queryKey: ["quiz-questions", moduleId],
    queryFn: async () => {
      const { data } = await supabase
        .from("questions")
        .select("id, enonce, options_json, bonne_reponse, explication, source_officielle, date_verification")
        .eq("module_id", moduleId);
      return (data ?? []) as Q[];
    },
  });

  const { data: moduleInfo } = useQuery({
    queryKey: ["module-info", moduleId],
    queryFn: async () => {
      const { data } = await supabase.from("modules").select("titre").eq("id", moduleId).maybeSingle();
      return data;
    },
  });

  const start = () => {
    if (!allQuestions || allQuestions.length === 0) {
      toast.error("Aucune question disponible pour ce module.");
      return;
    }
    setQuestions(shuffle(allQuestions).slice(0, Math.min(20, allQuestions.length)));
    setScore(0);
    setCurrent(0);
    setSelected(null);
    setValidated(false);
    setFinished(false);
    setAnswers({});
    setStarted(true);
  };

  const validate = () => {
    if (!selected) return;
    setValidated(true);
    setAnswers((a) => ({ ...a, [questions[current].id]: selected }));
    if (selected === questions[current].bonne_reponse) {
      setScore((s) => s + 1);
    }
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      const details = questions.map((q) => ({
        question_id: q.id,
        enonce: q.enonce,
        choisi: answers[q.id] ?? selected,
        correct: q.bonne_reponse,
      }));
      if (user?.id) {
        supabase.from("quiz_tentatives").insert({
          user_id: user.id,
          module_id: moduleId,
          score,
          total: questions.length,
          details_json: details as any,
        });
      }
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
    setValidated(false);
  };

  if (!started) {
    return (
      <AppShell>
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <Card className="rounded-2xl shadow-elegant">
            <CardContent className="p-8 space-y-4">
              <h1 className="font-display text-2xl font-bold">
                Quiz : {moduleInfo?.titre ?? "Chargement..."}
              </h1>
              <p className="text-muted-foreground">
                Testez vos connaissances sur ce module. Correction immédiate après chaque question.
              </p>
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                Questions disponibles : <strong>{allQuestions?.length ?? "..."}</strong> (max 20 par session)
              </div>
              <div className="flex gap-3">
                <Button onClick={start} className="bg-gradient-republic" disabled={!allQuestions?.length}>
                  Commencer le quiz
                </Button>
                <Button asChild variant="outline">
                  <Link to="/parcours">Retour au parcours</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <AppShell>
        <div className="container mx-auto max-w-3xl px-4 py-12 space-y-6">
          <Card className="rounded-2xl shadow-elegant">
            <CardContent className="p-8 text-center space-y-4">
              {pct >= 80 ? (
                <CheckCircle2 className="h-14 w-14 mx-auto text-success" />
              ) : (
                <XCircle className="h-14 w-14 mx-auto text-destructive" />
              )}
              <h1 className="font-display text-3xl font-bold">
                {pct >= 80 ? "Bravo !" : "Continuez vos efforts"}
              </h1>
              <div className="text-4xl font-bold font-display text-primary">
                {score} / {questions.length}
              </div>
              <p className="text-muted-foreground">{pct}% de bonnes réponses</p>
              <div className="flex justify-center gap-3">
                <Button onClick={start}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Recommencer
                </Button>
                <Button asChild variant="outline">
                  <Link to="/parcours">Retour au parcours</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  const q = questions[current];
  const isCorrect = selected === q.bonne_reponse;

  return (
    <AppShell>
      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Question {current + 1} / {questions.length}</Badge>
          <Badge variant="outline">Score : {score}</Badge>
        </div>
        <Progress value={((current + 1) / questions.length) * 100} />

        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="font-medium text-lg">{q.enonce}</p>
            <div className="space-y-2">
              {(q.options_json as string[]).map((opt, i) => {
                let style = "border-border hover:border-primary/40";
                if (validated) {
                  if (opt === q.bonne_reponse) style = "border-success bg-success/10";
                  else if (opt === selected) style = "border-destructive bg-destructive/10";
                } else if (opt === selected) {
                  style = "border-primary bg-primary/5";
                }
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={validated}
                    onClick={() => setSelected(opt)}
                    className={`w-full text-left p-3 rounded-md border-2 transition ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {validated && (
              <div className={`rounded-lg p-4 text-sm ${isCorrect ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"}`}>
                <div className="flex items-center gap-2 mb-1">
                  {isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="font-medium">{isCorrect ? "Bonne réponse !" : "Mauvaise réponse"}</span>
                </div>
                {!isCorrect && (
                  <p className="mb-1">Réponse correcte : <span className="font-medium text-success">{q.bonne_reponse}</span></p>
                )}
                <p className="text-muted-foreground italic">{q.explication}</p>
                <SourceBadge source={q.source_officielle} date={q.date_verification} />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          {!validated ? (
            <Button onClick={validate} disabled={!selected} className="bg-gradient-republic">
              Valider
            </Button>
          ) : (
            <Button onClick={next}>
              {current + 1 >= questions.length ? "Voir le résultat" : "Suivante"} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
