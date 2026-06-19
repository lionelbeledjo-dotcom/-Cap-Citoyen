import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, ShieldOff, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/utilisateurs")({
  component: AdminUtilisateurs,
});

function AdminUtilisateurs() {
  const qc = useQueryClient();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => (await supabase.from("profiles").select("id, email, nom, created_at").order("created_at")).data ?? [],
  });

  const { data: allRoles } = useQuery({
    queryKey: ["admin-all-roles"],
    queryFn: async () => (await supabase.from("user_roles").select("user_id, role")).data ?? [],
  });

  const promouvoir = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) {
      if (error.code === "23505") return toast.info("Déjà admin.");
      return toast.error(error.message);
    }
    toast.success("Promu admin !");
    qc.invalidateQueries({ queryKey: ["admin-all-roles"] });
  };

  const retrograder = async (userId: string) => {
    if (!confirm("Retirer le rôle admin à cet utilisateur ?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    if (error) return toast.error(error.message);
    await supabase.from("user_roles").upsert({ user_id: userId, role: "user" }, { onConflict: "user_id,role" });
    toast.success("Rétrogradé en utilisateur simple.");
    qc.invalidateQueries({ queryKey: ["admin-all-roles"] });
  };

  const getRoles = (userId: string) =>
    (allRoles ?? []).filter((r) => r.user_id === userId).map((r) => r.role);

  return (
    <AppShell>
      <div className="container mx-auto max-w-5xl px-4 py-10 space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="font-display text-3xl font-bold">Utilisateurs ({profiles?.length ?? 0})</h1>
        </div>

        {isLoading && <p className="text-muted-foreground">Chargement…</p>}

        <div className="space-y-3">
          {profiles?.map((p: any) => {
            const roles = getRoles(p.id);
            const isAdmin = roles.includes("admin");
            return (
              <Card key={p.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{p.nom || p.email.split("@")[0]}</span>
                      {isAdmin && <Badge className="bg-primary text-primary-foreground">Admin</Badge>}
                      {!isAdmin && <Badge variant="outline">Utilisateur</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{p.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Inscrit le {new Date(p.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  {isAdmin ? (
                    <Button variant="outline" size="sm" onClick={() => retrograder(p.id)} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                      <ShieldOff className="h-4 w-4 mr-1" /> Rétrograder
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => promouvoir(p.id)}>
                      <Shield className="h-4 w-4 mr-1" /> Promouvoir admin
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
