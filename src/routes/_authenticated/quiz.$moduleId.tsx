import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/quiz/$moduleId")({
  component: QuizPage,
});

function QuizPage() {
  const { moduleId } = Route.useParams();
  return (
    <AppShell>
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Card className="rounded-2xl">
          <CardContent className="p-8 space-y-4">
            <h1 className="font-display text-3xl font-semibold">Quiz du module</h1>
            <p className="text-muted-foreground">
              Module : <code className="text-xs">{moduleId}</code>. Le quiz détaillé arrive prochainement —
              en attendant, accédez à l'examen civique blanc complet.
            </p>
            <div className="flex gap-3">
              <Button asChild><Link to="/examen-blanc">Lancer l'examen blanc</Link></Button>
              <Button asChild variant="outline"><Link to="/parcours">Retour au parcours</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
