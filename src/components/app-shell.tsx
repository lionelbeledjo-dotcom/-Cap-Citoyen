import { Link, useRouter } from "@tanstack/react-router";
import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, LayoutDashboard, BookOpen, ClipboardCheck, GraduationCap, ListChecks } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-foreground">
      <strong className="font-semibold">Information importante :</strong>{" "}
      Cap Citoyen est un outil pédagogique. Les informations sont issues de sources officielles
      mais ne constituent pas un conseil juridique. Référez-vous toujours à{" "}
      <a href="https://service-public.gouv.fr" target="_blank" rel="noopener noreferrer" className="underline font-medium">
        service-public.gouv.fr
      </a>{" "}
      et à votre préfecture.
    </div>
  );
}

export function SourceBadge({ source, date }: { source: string; date: string }) {
  const d = new Date(date).toLocaleDateString("fr-FR");
  let host = source;
  try {
    host = new URL(source).hostname.replace(/^www\./, "");
  } catch {}
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      <span>Source :</span>
      <a href={source} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
        {host}
      </a>
      <span>— vérifié le {d}</span>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-4">
        <Disclaimer />
        <div className="flex flex-col items-center justify-between gap-2 pt-2 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Cap Citoyen — outil pédagogique indépendant.</p>
          <div className="flex gap-4">
            <a className="hover:text-primary" href="https://service-public.gouv.fr" target="_blank" rel="noreferrer">service-public.gouv.fr</a>
            <a className="hover:text-primary" href="https://www.immigration.interieur.gouv.fr" target="_blank" rel="noreferrer">immigration.interieur.gouv.fr</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isAdmin, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-1 bg-gradient-to-r from-primary via-white to-republic" />
      <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-republic flex items-center justify-center text-primary-foreground font-display font-bold">
              C
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">Cap Citoyen</span>
          </Link>

          {user ? (
            <nav className="hidden md:flex items-center gap-1 text-sm">
              <NavLink to="/tableau-bord" icon={<LayoutDashboard className="h-4 w-4" />}>Tableau de bord</NavLink>
              <NavLink to="/parcours" icon={<BookOpen className="h-4 w-4" />}>Parcours</NavLink>
              <NavLink to="/examen-blanc" icon={<GraduationCap className="h-4 w-4" />}>Examen blanc</NavLink>
              <NavLink to="/checklist" icon={<ListChecks className="h-4 w-4" />}>Checklist</NavLink>
              {isAdmin && (
                <NavLink to="/admin" icon={<Shield className="h-4 w-4" />}>Admin</NavLink>
              )}
            </nav>
          ) : null}

          <div className="flex items-center gap-2">
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" /> Quitter
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Se connecter</Link>
                </Button>
                <Button variant="default" size="sm" asChild className="bg-gradient-republic">
                  <Link to="/auth" search={{ mode: "signup" }}>S'inscrire</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        {user && (
          <div className="md:hidden border-t">
            <div className="container mx-auto max-w-6xl px-4 py-2 flex flex-wrap gap-1 text-xs">
              <NavLink to="/tableau-bord" icon={<LayoutDashboard className="h-3 w-3" />}>Bord</NavLink>
              <NavLink to="/parcours" icon={<BookOpen className="h-3 w-3" />}>Parcours</NavLink>
              <NavLink to="/examen-blanc" icon={<GraduationCap className="h-3 w-3" />}>Examen</NavLink>
              <NavLink to="/checklist" icon={<ListChecks className="h-3 w-3" />}>Checklist</NavLink>
              {isAdmin && <NavLink to="/admin" icon={<Shield className="h-3 w-3" />}>Admin</NavLink>}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function NavLink({ to, children, icon }: { to: string; children: ReactNode; icon?: ReactNode }) {
  return (
    <Link
      to={to}
      className="px-3 py-2 rounded-md font-medium text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-1.5 transition"
      activeProps={{ className: "px-3 py-2 rounded-md font-medium text-primary bg-accent flex items-center gap-1.5" }}
    >
      {icon}
      {children}
    </Link>
  );
}
