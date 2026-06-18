import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IdCard, Flag, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/demarches")({
  head: () => ({
    meta: [
      { title: "Démarches — Cap Citoyen" },
      { name: "description", content: "Carte de résident 10 ans et naturalisation française : ce qu'il faut savoir." },
    ],
  }),
  component: DemarchesPage,
});

function DemarchesPage() {
  return (
    <AppShell>
      <div className="container mx-auto max-w-5xl px-4 py-12 space-y-10">
        <header>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Vos démarches</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Deux parcours, un même objectif : sécuriser votre situation en France. Choisissez celui qui vous concerne.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="rounded-2xl shadow-card hover:shadow-elegant transition">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-france-blue/10 text-france-blue flex items-center justify-center">
                <IdCard className="h-6 w-6" />
              </div>
              <h2 className="font-display text-2xl font-semibold">Carte de résident 10 ans</h2>
              <p className="text-sm text-muted-foreground">
                Pour les personnes justifiant de 5 ans de séjour régulier, d'une intégration républicaine et du niveau B1.
              </p>
              <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
                <li>Justificatifs de séjour et de ressources</li>
                <li>Niveau B1 attesté</li>
                <li>Réussite à l'examen civique</li>
              </ul>
              <Button asChild><Link to="/inscription">Commencer ce parcours <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-card hover:shadow-elegant transition">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-france-blue/10 text-france-blue flex items-center justify-center">
                <Flag className="h-6 w-6" />
              </div>
              <h2 className="font-display text-2xl font-semibold">Naturalisation française</h2>
              <p className="text-sm text-muted-foreground">
                Pour acquérir la nationalité française par décret après 5 ans de résidence (durée réduite dans certains cas).
              </p>
              <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
                <li>Niveau B2 oral et écrit</li>
                <li>Connaissance de l'histoire et des valeurs</li>
                <li>Entretien d'assimilation</li>
              </ul>
              <Button asChild><Link to="/inscription">Commencer ce parcours <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
