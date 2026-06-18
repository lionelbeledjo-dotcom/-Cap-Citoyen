import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/modules")({
  component: AdminModules,
});

type ModuleForm = { id?: string; titre: string; description: string; categorie: string; ordre: number; icone: string };
type LeconForm = { id?: string; module_id: string; titre: string; contenu_markdown: string; source_officielle: string; date_verification: string; ordre: number };

const CATEGORIES = [
  { v: "langue", l: "Langue" },
  { v: "carte_resident", l: "Carte de résident" },
  { v: "naturalisation", l: "Naturalisation" },
  { v: "examen_civique", l: "Examen civique" },
];

function AdminModules() {
  const qc = useQueryClient();
  const [editMod, setEditMod] = useState<ModuleForm | null>(null);
  const [editLec, setEditLec] = useState<LeconForm | null>(null);

  const { data: modules } = useQuery({
    queryKey: ["admin-mod-full"],
    queryFn: async () => (await supabase.from("modules").select("*, lecons(*)").order("ordre")).data ?? [],
  });

  const saveMod = async (f: ModuleForm) => {
    const payload = { titre: f.titre, description: f.description, categorie: f.categorie as any, ordre: f.ordre, icone: f.icone };
    const { error } = f.id ? await supabase.from("modules").update(payload).eq("id", f.id) : await supabase.from("modules").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Module enregistré"); setEditMod(null);
    qc.invalidateQueries({ queryKey: ["admin-mod-full"] });
  };
  const delMod = async (id: string) => {
    if (!confirm("Supprimer ce module et toutes ses leçons / questions liées ?")) return;
    const { error } = await supabase.from("modules").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-mod-full"] });
  };

  const saveLec = async (f: LeconForm) => {
    const payload = {
      module_id: f.module_id, titre: f.titre, contenu_markdown: f.contenu_markdown,
      source_officielle: f.source_officielle, date_verification: f.date_verification, ordre: f.ordre,
    };
    if (!payload.source_officielle || !payload.date_verification) return toast.error("Source et date obligatoires.");
    const { error } = f.id ? await supabase.from("lecons").update(payload).eq("id", f.id) : await supabase.from("lecons").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Leçon enregistrée"); setEditLec(null);
    qc.invalidateQueries({ queryKey: ["admin-mod-full"] });
  };
  const delLec = async (id: string) => {
    if (!confirm("Supprimer cette leçon ?")) return;
    await supabase.from("lecons").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-mod-full"] });
  };

  return (
    <AppShell>
      <div className="container mx-auto max-w-5xl px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">Modules & leçons</h1>
          <Button onClick={() => setEditMod({ titre: "", description: "", categorie: "langue", ordre: (modules?.length ?? 0) + 1, icone: "" })} className="bg-gradient-republic">
            <Plus className="h-4 w-4 mr-1" /> Nouveau module
          </Button>
        </div>

        {modules?.map((m: any) => (
          <Card key={m.id}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2"><Badge>{m.categorie}</Badge><span className="text-xs text-muted-foreground">Ordre {m.ordre}</span></div>
                  <h2 className="font-display text-xl font-semibold mt-1">{m.titre}</h2>
                  <p className="text-sm text-muted-foreground">{m.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setEditMod({ id: m.id, titre: m.titre, description: m.description ?? "", categorie: m.categorie, ordre: m.ordre, icone: m.icone ?? "" })}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => delMod(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>

              <div className="pl-4 border-l-2 border-muted space-y-2">
                {(m.lecons ?? []).sort((a: any, b: any) => a.ordre - b.ordre).map((l: any) => (
                  <div key={l.id} className="flex items-center gap-2 group">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{l.titre}</span>
                    <Button variant="ghost" size="icon" onClick={() => setEditLec({ id: l.id, module_id: l.module_id, titre: l.titre, contenu_markdown: l.contenu_markdown, source_officielle: l.source_officielle, date_verification: l.date_verification, ordre: l.ordre })}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => delLec(l.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={() => setEditLec({ module_id: m.id, titre: "", contenu_markdown: "", source_officielle: "", date_verification: new Date().toISOString().slice(0, 10), ordre: (m.lecons?.length ?? 0) + 1 })}>
                  <Plus className="h-3 w-3 mr-1" /> Ajouter une leçon
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Module dialog */}
      {editMod && (
        <Dialog open onOpenChange={(o) => !o && setEditMod(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">{editMod.id ? "Modifier" : "Nouveau"} module</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Titre</Label><Input value={editMod.titre} onChange={(e) => setEditMod({ ...editMod, titre: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editMod.description} onChange={(e) => setEditMod({ ...editMod, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Catégorie</Label>
                  <Select value={editMod.categorie} onValueChange={(v) => setEditMod({ ...editMod, categorie: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Ordre</Label><Input type="number" value={editMod.ordre} onChange={(e) => setEditMod({ ...editMod, ordre: +e.target.value })} /></div>
              </div>
              <div><Label>Icône (nom lucide, optionnel)</Label><Input value={editMod.icone} onChange={(e) => setEditMod({ ...editMod, icone: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditMod(null)}>Annuler</Button>
              <Button onClick={() => saveMod(editMod)} className="bg-gradient-republic">Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Leçon dialog */}
      {editLec && (
        <Dialog open onOpenChange={(o) => !o && setEditLec(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display">{editLec.id ? "Modifier" : "Nouvelle"} leçon</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Titre</Label><Input value={editLec.titre} onChange={(e) => setEditLec({ ...editLec, titre: e.target.value })} /></div>
              <div>
                <Label>Contenu (Markdown)</Label>
                <Textarea value={editLec.contenu_markdown} onChange={(e) => setEditLec({ ...editLec, contenu_markdown: e.target.value })} rows={14} className="font-mono text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Source officielle (URL)</Label><Input type="url" value={editLec.source_officielle} onChange={(e) => setEditLec({ ...editLec, source_officielle: e.target.value })} /></div>
                <div><Label>Date de vérification</Label><Input type="date" value={editLec.date_verification} onChange={(e) => setEditLec({ ...editLec, date_verification: e.target.value })} /></div>
              </div>
              <div><Label>Ordre</Label><Input type="number" value={editLec.ordre} onChange={(e) => setEditLec({ ...editLec, ordre: +e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditLec(null)}>Annuler</Button>
              <Button onClick={() => saveLec(editLec)} className="bg-gradient-republic">Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AppShell>
  );
}
