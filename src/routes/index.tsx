import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  GraduationCap,
  ListChecks,
  ShieldCheck,
  FileCheck2,
  Languages,
  CheckCircle2,
  Clock,
  Sparkles,
  CalendarCheck,
} from "lucide-react";

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
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 hero-pattern" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-france-blue/20 blur-3xl" />
        <div className="relative container mx-auto max-w-6xl px-4 py-20 md:py-28 text-primary-foreground">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
            {/* LEFT — copy */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-republic opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-republic" />
                </span>
                Outil pédagogique — sources officielles
              </div>
              <h1 className="mt-6 font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
                Préparez sereinement votre{" "}
                <span className="text-white">carte de résident</span> et votre{" "}
                <span className="text-white">nationalité française</span>.
              </h1>
              <p className="mt-6 text-lg text-white/85 max-w-xl leading-relaxed">
                Cours sourcés, examen civique blanc en conditions réelles et checklist de
                dossier interactive. Tout ce qu'il faut pour réussir vos démarches, à votre
                rythme.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-primary hover:bg-white shadow-elegant hover:scale-[1.02] transition-all duration-200"
                >
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Commencer mon parcours
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/70 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-white transition-all"
                >
                  <Link to="/auth">Se connecter</Link>
                </Button>
              </div>

              {/* TRUST BAR */}
              <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/80">
                <TrustItem icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                  Sources officielles
                </TrustItem>
                <TrustItem icon={<Sparkles className="h-3.5 w-3.5" />}>
                  Conforme aux exigences 2026
                </TrustItem>
                <TrustItem icon={<Languages className="h-3.5 w-3.5" />}>
                  B1 · B2 · Examen civique
                </TrustItem>
                <TrustItem icon={<CalendarCheck className="h-3.5 w-3.5" />}>
                  Mis à jour le 01/01/2026
                </TrustItem>
              </ul>
            </div>

            {/* RIGHT — exam mockup */}
            <div className="relative hidden lg:block">
              <ExamMockup />
            </div>
          </div>

          {/* Mobile mockup */}
          <div className="mt-12 lg:hidden">
            <ExamMockup />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-background">
        <div className="container mx-auto max-w-6xl px-4 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Tout ce qu'il faut pour réussir
            </h2>
            <p className="mt-3 text-muted-foreground">
              Une plateforme pensée pour les démarches d'intégration en France, alimentée
              par des sources officielles et mise à jour avec les évolutions législatives.
            </p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<BookOpen className="h-6 w-6" />}
              title="Cours sourcés"
              desc="Chaque info avec sa source officielle et sa date de vérification."
            />
            <FeatureCard
              icon={<GraduationCap className="h-6 w-6" />}
              title="Examen civique blanc"
              desc="40 questions en conditions réelles, seuil 32/40, correction détaillée."
            />
            <FeatureCard
              icon={<ListChecks className="h-6 w-6" />}
              title="Checklist de dossier"
              desc="Toutes les pièces à fournir, cochables et sauvegardées."
            />
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Languages className="h-6 w-6" />}
              title="Niveaux de langue"
              desc="A2 / B1 / B2 : ce qu'on attend de vous et quels justificatifs sont acceptés."
            />
            <FeatureCard
              icon={<FileCheck2 className="h-6 w-6" />}
              title="Suivi de progression"
              desc="Tableau de bord, derniers scores et prochaine leçon recommandée."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Fiabilité"
              desc="service-public.gouv.fr, immigration.interieur.gouv.fr, legifrance.gouv.fr."
            />
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="container mx-auto max-w-4xl px-4 pb-12">
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="p-6 text-sm leading-relaxed">
            <strong className="font-semibold">À lire avant de commencer.</strong>{" "}
            Cap Citoyen est un outil pédagogique. Les informations sont issues de sources
            officielles mais ne constituent pas un conseil juridique. Référez-vous toujours
            à{" "}
            <a
              className="text-france-blue underline underline-offset-2 hover:text-republic transition-colors"
              href="https://service-public.gouv.fr"
              target="_blank"
              rel="noreferrer"
            >
              service-public.gouv.fr
            </a>{" "}
            et à votre préfecture pour toute démarche officielle.
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function TrustItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <span className="text-republic">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card className="border-border/60 bg-card shadow-card hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 rounded-2xl">
      <CardContent className="p-6">
        <div className="h-12 w-12 rounded-xl bg-france-blue/10 text-france-blue flex items-center justify-center">
          {icon}
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}

function ExamMockup() {
  return (
    <div className="relative animate-fade-in">
      {/* Glow */}
      <div className="absolute -inset-6 bg-france-blue/20 blur-3xl rounded-full" />

      {/* Card */}
      <div
        className="relative rounded-2xl border border-white/30 bg-white/10 backdrop-blur-xl p-6 shadow-elegant"
        style={{ transform: "rotate(2.5deg)" }}
      >
        <div className="flex items-center justify-between text-xs text-white/80">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <GraduationCap className="h-4 w-4" /> Examen civique blanc
          </span>
          <span className="inline-flex items-center gap-1 font-mono">
            <Clock className="h-3.5 w-3.5" /> 18:42
          </span>
        </div>

        {/* Progress */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-white/70 shrink-0">Question 12 / 40</span>
          <div className="h-1.5 flex-1 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full w-[30%] bg-white rounded-full" />
          </div>
        </div>

        <h4 className="mt-5 text-white font-display text-lg leading-snug">
          Quelle est la devise de la République française ?
        </h4>

        <ul className="mt-4 space-y-2 text-sm">
          <MockOption>Égalité, Travail, Patrie</MockOption>
          <MockOption selected>Liberté, Égalité, Fraternité</MockOption>
          <MockOption>Liberté, Justice, Solidarité</MockOption>
          <MockOption>Unité, République, Démocratie</MockOption>
        </ul>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-[11px] text-white/60">
            Source : service-public.gouv.fr
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-white bg-france-blue/80 rounded-full px-3 py-1">
            Valider
          </span>
        </div>
      </div>
    </div>
  );
}

function MockOption({
  children,
  selected,
}: {
  children: React.ReactNode;
  selected?: boolean;
}) {
  return (
    <li
      className={
        "flex items-center gap-2 rounded-lg border px-3 py-2 transition " +
        (selected
          ? "border-white/60 bg-white/20 text-white"
          : "border-white/15 bg-white/5 text-white/80")
      }
    >
      {selected ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
      ) : (
        <span className="h-4 w-4 shrink-0 rounded-full border border-white/40" />
      )}
      <span>{children}</span>
    </li>
  );
}
