import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/checklist")({
  component: ChecklistPage,
});

const DEFAULTS: Record<"carte_resident" | "naturalisation", string[]> = {
  carte_resident: [
    "Passeport en cours de validité (copie intégrale)",
    "Titre de séjour actuel + récépissés successifs",
    "Justificatifs de 5 ans de résidence régulière et ininterrompue",
    "3 derniers bulletins de salaire + 2 derniers avis d'imposition",
    "Justificatif de domicile (≤ 3 mois)",
    "Justificatif de ressources stables ≥ SMIC",
    "Casier judiciaire de moins de 3 mois (pays d'origine si applicable)",
    "Attestation de niveau B1 (DELF B1, TCF IRN niveau B1 oral + écrit, ou diplôme équivalent ≤ 2 ans)",
    "Attestation de réussite à l'examen civique (1ère demande)",
    "Engagement à respecter les principes de la République (formulaire signé)",
    "Photos d'identité aux normes (récentes)",
    "Timbre fiscal",
  ],
  naturalisation: [
    "Acte de naissance traduit et légalisé",
    "Passeport en cours de validité (copie)",
    "Titre de séjour en cours de validité (copie)",
    "Justificatifs de 5 ans de résidence (ou 2 ans si études supérieures en France)",
    "3 derniers avis d'imposition",
    "Justificatifs de revenus (3 dernières années)",
    "Justificatif de domicile actuel (≤ 3 mois)",
    "Casier judiciaire (France + pays d'origine pour les 10 dernières années)",
    "Attestation de niveau B2 (DELF B2, TCF IRN niveau B2, ou diplôme équivalent ≤ 2 ans)",
    "Attestation de réussite à l'examen civique (≥ 32/40)",
    "Acte de mariage / livret de famille (le cas échéant)",
    "Actes de naissance des enfants mineurs (le cas échéant)",
    "Formulaire CERFA n°12753 rempli et signé",
    "Photos d'identité aux normes",
    "Timbre fiscal 55 €",
  ],
};

function ChecklistPage() {
  return (
    <AppShell>
      <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Checklist de dossier</h1>
          <p className="text-muted-foreground">Cochez au fur et à mesure que vous rassemblez vos pièces. Tout est sauvegardé automatiquement.</p>
        </div>

        <Tabs defaultValue="carte_resident">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="carte_resident">Carte de résident 10 ans</TabsTrigger>
            <TabsTrigger value="naturalisation">Naturalisation</TabsTrigger>
          </TabsList>
          <TabsContent value="carte_resident"><ChecklistFor type="carte_resident" /></TabsContent>
          <TabsContent value="naturalisation"><ChecklistFor type="naturalisation" /></TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function ChecklistFor({ type }: { type: "carte_resident" | "naturalisation" }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [seeding, setSeeding] = useState(false);

  const { data: items } = useQuery({
    queryKey: ["checklist", type, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("checklist_items")
        .select("*")
        .eq("user_id", user!.id)
        .eq("type_demarche", type)
        .order("ordre");
      return data ?? [];
    },
  });

  useEffect(() => {
    if (items && items.length === 0 && !seeding) {
      setSeeding(true);
      const rows = DEFAULTS[type].map((intitule, i) => ({
        user_id: user!.id,
        type_demarche: type,
        intitule,
        ordre: i,
      }));
      supabase.from("checklist_items").insert(rows).then(({ error }) => {
        setSeeding(false);
        if (error) toast.error(error.message);
        qc.invalidateQueries({ queryKey: ["checklist", type] });
      });
    }
  }, [items, type, user, qc, seeding]);

  const toggle = async (id: string, est_coche: boolean) => {
    qc.setQueryData(["checklist", type, user?.id], (old: any) =>
      old?.map((it: any) => (it.id === id ? { ...it, est_coche } : it))
    );
    const { error } = await supabase.from("checklist_items").update({ est_coche }).eq("id", id);
    if (error) toast.error(error.message);
  };

  const reset = async () => {
    if (!confirm("Réinitialiser cette checklist ?")) return;
    await supabase.from("checklist_items").delete().eq("user_id", user!.id).eq("type_demarche", type);
    qc.invalidateQueries({ queryKey: ["checklist", type] });
  };

  const total = items?.length ?? 0;
  const done = items?.filter((i) => i.est_coche).length ?? 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="font-display flex items-center justify-between">
          <span>Avancement</span>
          <span className="text-base text-muted-foreground">{done}/{total}</span>
        </CardTitle>
        <Progress value={pct} />
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items?.map((it) => (
            <li key={it.id} className="flex items-start gap-3 p-2 rounded hover:bg-accent/50">
              <Checkbox
                id={it.id}
                checked={it.est_coche}
                onCheckedChange={(v) => toggle(it.id, !!v)}
                className="mt-0.5"
              />
              <label htmlFor={it.id} className={`flex-1 cursor-pointer text-sm ${it.est_coche ? "line-through text-muted-foreground" : ""}`}>
                {it.intitule}
              </label>
            </li>
          ))}
        </ul>
        <Button variant="ghost" size="sm" onClick={reset} className="mt-4 text-muted-foreground">
          Réinitialiser cette checklist
        </Button>
      </CardContent>
    </Card>
  );
}
