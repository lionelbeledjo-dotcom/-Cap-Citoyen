import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, GraduationCap, ListChecks, ShieldCheck, FileCheck2, Languages } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cap Citoyen — Préparez votre carte de résident et la nationalité française" },
      {
        name: "description",
        content:
          "Cours, examen civique blanc et checklist de dossier pour la carte de résident 10 ans et la naturalisation française. Sources officielles.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <AppShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_30%_20%,white_0,transparent_50%),radial-gradient(circle_at_80%_80%,white_0,transparent_40%)]" />
        <div className="relative container mx-auto max-w-6xl px-4 py-20 md:py-28 text-primary-foreground">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-republic" />
              Outil pédagogique — sources officielles
            </div>
            <h1 className="mt-6 font-display text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
              Préparez sereinement votre <span className="text-white/90">carte de résident</span> et votre{" "}
              <span className="text-white/90">nationalité française</span>.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed">
              Cours sourcés, examen civique blanc en conditions réelles et checklist de dossier
              interactive. Tout ce qu'il faut pour réussir vos démarches, à votre rythme.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link to="/auth" search={{ mode: "signup" }}>Commencer mon parcours</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 hover:text-white">
                <Link to="/auth">Se connecter</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-white/70">
              Informations vérifiées au 01/01/2026 — service-public.gouv.fr, immigration.interieur.gouv.fr, legifrance.gouv.fr
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto max-w-6xl px-4 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Tout ce qu'il faut pour réussir</h2>
          <p className="mt-3 text-muted-foreground">
            Une plateforme pensée pour les démarches d'intégration en France, alimentée par des sources officielles
            et mise à jour avec les évolutions législatives.
          </p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <FeatureCard icon={<BookOpen className="h-6 w-6" />} title="Parcours d'apprentissage" desc="Modules organisés : conditions, langue, carte de résident, naturalisation. Chaque leçon affiche sa source et sa date de vérification." />
          <FeatureCard icon={<GraduationCap className="h-6 w-6" />} title="Examen civique blanc" desc="40 QCM tirés aléatoirement, chronomètre, seuil officiel 32/40. Correction détaillée avec explication et source." />
          <FeatureCard icon={<ListChecks className="h-6 w-6" />} title="Checklist de dossier" desc="Les pièces à fournir, cochables et sauvegardées, pour la carte de résident 10 ans et la naturalisation." />
          <FeatureCard icon={<Languages className="h-6 w-6" />} title="Niveaux de langue" desc="A2 / B1 / B2 : sachez exactement ce qu'on attend de vous et quels justificatifs sont acceptés." />
          <FeatureCard icon={<FileCheck2 className="h-6 w-6" />} title="Suivi de progression" desc="Tableau de bord avec graphique d'évolution, derniers scores et prochaine leçon recommandée." />
          <FeatureCard icon={<ShieldCheck className="h-6 w-6" />} title="Fiabilité" desc="Chaque contenu cite sa source officielle (service-public.gouv.fr, immigration.interieur.gouv.fr…) et sa date de vérification." />
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="container mx-auto max-w-4xl px-4 pb-12">
        <Card className="border-warning/40">
          <CardContent className="p-6 text-sm leading-relaxed">
            <strong className="font-semibold">À lire avant de commencer.</strong>{" "}
            Cap Citoyen est un outil pédagogique. Les informations sont issues de sources officielles mais
            ne constituent pas un conseil juridique. Référez-vous toujours à{" "}
            <a className="text-primary underline" href="https://service-public.gouv.fr" target="_blank" rel="noreferrer">service-public.gouv.fr</a>{" "}
            et à votre préfecture pour toute démarche officielle.
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="border-border/60 shadow-card hover:shadow-elegant transition">
      <CardContent className="p-6">
        <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}
