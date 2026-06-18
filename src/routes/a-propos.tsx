import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — Cap Citoyen" },
      { name: "description", content: "Cap Citoyen : un outil pédagogique indépendant, fondé sur des sources officielles." },
    ],
  }),
  component: AProposPage,
});

function AProposPage() {
  return (
    <AppShell>
      <div className="container mx-auto max-w-3xl px-4 py-12 space-y-8">
        <header>
          <h1 className="font-display text-4xl font-semibold tracking-tight">À propos de Cap Citoyen</h1>
          <p className="mt-3 text-muted-foreground">
            Une plateforme indépendante pour préparer sereinement la carte de résident et la nationalité française.
          </p>
        </header>

        <Card className="rounded-2xl">
          <CardContent className="p-6 prose prose-sm max-w-none">
            <h2 className="font-display">Notre mission</h2>
            <p>
              Rendre accessibles, gratuitement, les connaissances et les outils nécessaires pour réussir
              vos démarches d'intégration. Sans jargon, sans démarche cachée.
            </p>
            <h2 className="font-display">Nos sources</h2>
            <ul>
              <li><a href="https://service-public.gouv.fr" target="_blank" rel="noreferrer">service-public.gouv.fr</a></li>
              <li><a href="https://www.immigration.interieur.gouv.fr" target="_blank" rel="noreferrer">immigration.interieur.gouv.fr</a></li>
              <li><a href="https://www.legifrance.gouv.fr" target="_blank" rel="noreferrer">legifrance.gouv.fr</a></li>
            </ul>
            <h2 className="font-display">Engagement</h2>
            <p>
              Cap Citoyen est un outil pédagogique. Il ne constitue pas un conseil juridique. Pour toute
              démarche officielle, référez-vous à votre préfecture.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
