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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Upload, Database } from "lucide-react";
import seedBase from "../../../../seed-questions.json";
import seedExtra from "../../../../seed-questions-extra.json";

export const Route = createFileRoute("/_authenticated/admin/questions")({
  component: AdminQuestions,
});

type QForm = {
  id?: string;
  module_id: string;
  enonce: string;
  type: "qcm" | "vrai_faux";
  options: string[];
  bonne_reponse: string;
  explication: string;
  source_officielle: string;
  date_verification: string;
  difficulte: number;
};

const EMPTY: QForm = {
  module_id: "",
  enonce: "",
  type: "qcm",
  options: ["", "", "", ""],
  bonne_reponse: "",
  explication: "",
  source_officielle: "",
  date_verification: new Date().toISOString().slice(0, 10),
  difficulte: 1,
};

function AdminQuestions() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [editing, setEditing] = useState<QForm | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const { data: modules } = useQuery({
    queryKey: ["admin-modules"],
    queryFn: async () => (await supabase.from("modules").select("id, titre, categorie").order("ordre")).data ?? [],
  });

  const { data: questions } = useQuery({
    queryKey: ["admin-questions"],
    queryFn: async () =>
      (await supabase.from("questions").select("*, modules(titre)").order("created_at", { ascending: false })).data ?? [],
  });

  const filtered = (questions ?? []).filter((q: any) => {
    const mok = moduleFilter === "all" || q.module_id === moduleFilter;
    const sok = !search || q.enonce.toLowerCase().includes(search.toLowerCase());
    return mok && sok;
  });

  const save = async (f: QForm) => {
    const payload = {
      module_id: f.module_id,
      enonce: f.enonce,
      type: f.type,
      options_json: f.options.filter(Boolean),
      bonne_reponse: f.bonne_reponse,
      explication: f.explication,
      source_officielle: f.source_officielle,
      date_verification: f.date_verification,
      difficulte: f.difficulte,
    };
    if (!payload.module_id || !payload.enonce || !payload.bonne_reponse || !payload.source_officielle) {
      return toast.error("Tous les champs obligatoires doivent être remplis.");
    }
    const { error } = f.id
      ? await supabase.from("questions").update(payload).eq("id", f.id)
      : await supabase.from("questions").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(f.id ? "Question modifiée" : "Question ajoutée");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-questions"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette question ?")) return;
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Supprimée");
    qc.invalidateQueries({ queryKey: ["admin-questions"] });
  };

  const seedAll = async () => {
    if (!confirm("Insérer les 88 questions d'entraînement ? (ignoré si déjà présentes)")) return;
    const all = [...seedBase, ...seedExtra];
    const { error, count } = await supabase.from("questions").insert(all as any, { count: "exact" });
    if (error) {
      if (error.code === "23505") toast.info("Des questions existent déjà.");
      else toast.error(error.message);
      return;
    }
    toast.success(`${count} questions insérées !`);
    qc.invalidateQueries({ queryKey: ["admin-questions"] });
  };

  const startEdit = (q?: any) => {
    if (!q) {
      setEditing({ ...EMPTY, module_id: modules?.[0]?.id ?? "" });
      return;
    }
    setEditing({
      id: q.id,
      module_id: q.module_id,
      enonce: q.enonce,
      type: q.type,
      options: Array.isArray(q.options_json) ? [...q.options_json, "", "", "", ""].slice(0, 4) : ["", "", "", ""],
      bonne_reponse: q.bonne_reponse,
      explication: q.explication,
      source_officielle: q.source_officielle,
      date_verification: q.date_verification,
      difficulte: q.difficulte,
    });
  };

  return (
    <AppShell>
      <div className="container mx-auto max-w-6xl px-4 py-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-bold">Questions ({filtered.length})</h1>
          <div className="flex gap-2">
            {(questions?.length ?? 0) === 0 && (
              <Button variant="outline" onClick={seedAll}>
                <Database className="h-4 w-4 mr-1" /> Peupler (88 questions)
              </Button>
            )}
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4 mr-1" /> Import JSON
            </Button>
            <Button onClick={() => startEdit()} className="bg-gradient-republic">
              <Plus className="h-4 w-4 mr-1" /> Nouvelle question
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input className="pl-9" placeholder="Rechercher dans les énoncés…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les modules</SelectItem>
                {modules?.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.titre}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {filtered.map((q: any) => (
            <Card key={q.id}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant="secondary">{q.modules?.titre}</Badge>
                    <Badge variant="outline">Difficulté {q.difficulte}</Badge>
                  </div>
                  <p className="font-medium">{q.enonce}</p>
                  <p className="text-xs text-success mt-1">✓ {q.bonne_reponse}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => startEdit(q)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-10">Aucune question trouvée.</p>}
        </div>
      </div>

      <QuestionEditor form={editing} setForm={setEditing} modules={modules ?? []} onSave={save} />
      <ImportDialog open={importOpen} setOpen={setImportOpen} modules={modules ?? []} onDone={() => qc.invalidateQueries({ queryKey: ["admin-questions"] })} />
    </AppShell>
  );
}

function QuestionEditor({
  form, setForm, modules, onSave,
}: { form: QForm | null; setForm: (f: QForm | null) => void; modules: any[]; onSave: (f: QForm) => void }) {
  if (!form) return null;
  return (
    <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display">{form.id ? "Modifier" : "Nouvelle"} question</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Module *</Label>
            <Select value={form.module_id} onValueChange={(v) => setForm({ ...form, module_id: v })}>
              <SelectTrigger><SelectValue placeholder="Choisir un module" /></SelectTrigger>
              <SelectContent>
                {modules.map((m) => <SelectItem key={m.id} value={m.id}>{m.titre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Énoncé *</Label>
            <Textarea value={form.enonce} onChange={(e) => setForm({ ...form, enonce: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="qcm">QCM</SelectItem>
                  <SelectItem value="vrai_faux">Vrai / Faux</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulté</Label>
              <Input type="number" min={1} max={3} value={form.difficulte} onChange={(e) => setForm({ ...form, difficulte: +e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Options de réponse</Label>
            {form.options.map((opt, i) => (
              <Input key={i} placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => {
                const o = [...form.options]; o[i] = e.target.value; setForm({ ...form, options: o });
              }} />
            ))}
          </div>
          <div>
            <Label>Bonne réponse * (texte exact)</Label>
            <Input value={form.bonne_reponse} onChange={(e) => setForm({ ...form, bonne_reponse: e.target.value })} />
          </div>
          <div>
            <Label>Explication *</Label>
            <Textarea value={form.explication} onChange={(e) => setForm({ ...form, explication: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Source officielle (URL) *</Label>
              <Input type="url" value={form.source_officielle} onChange={(e) => setForm({ ...form, source_officielle: e.target.value })} />
            </div>
            <div>
              <Label>Date de vérification *</Label>
              <Input type="date" value={form.date_verification} onChange={(e) => setForm({ ...form, date_verification: e.target.value })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setForm(null)}>Annuler</Button>
          <Button onClick={() => onSave(form)} className="bg-gradient-republic">Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImportDialog({
  open, setOpen, modules, onDone,
}: { open: boolean; setOpen: (b: boolean) => void; modules: any[]; onDone: () => void }) {
  const [text, setText] = useState("");
  const sample = `[
  {
    "module_id": "${modules[0]?.id ?? ""}",
    "enonce": "…",
    "type": "qcm",
    "options_json": ["A","B","C","D"],
    "bonne_reponse": "A",
    "explication": "…",
    "source_officielle": "https://…",
    "date_verification": "2026-01-01",
    "difficulte": 1
  }
]`;
  const submit = async () => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("Doit être un tableau JSON");
      const { error } = await supabase.from("questions").insert(parsed);
      if (error) return toast.error(error.message);
      toast.success(`${parsed.length} questions importées`);
      setText(""); setOpen(false); onDone();
    } catch (e: any) {
      toast.error("JSON invalide : " + e.message);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle className="font-display">Import en masse (JSON)</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Collez un tableau JSON. Tous les champs doivent être présents.</p>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} placeholder={sample} className="font-mono text-xs" />
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={submit} className="bg-gradient-republic">Importer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
