import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", u.user.id);
    if (!roles?.some((r) => r.role === "admin")) {
      throw redirect({ to: "/tableau-bord" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div>
      <div className="bg-primary text-primary-foreground border-b">
        <div className="container mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-4 text-sm">
          <span className="font-display font-semibold">Espace administrateur</span>
          <nav className="flex flex-wrap gap-1">
            <AdminLink to="/admin">Tableau</AdminLink>
            <AdminLink to="/admin/modules">Modules & leçons</AdminLink>
            <AdminLink to="/admin/questions">Questions</AdminLink>
          </nav>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

function AdminLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="px-3 py-1.5 rounded text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground"
      activeOptions={{ exact: true }}
      activeProps={{ className: "px-3 py-1.5 rounded bg-white/15 text-primary-foreground font-medium" }}
    >
      {children}
    </Link>
  );
}
