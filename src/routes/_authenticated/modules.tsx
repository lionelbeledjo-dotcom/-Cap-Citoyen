import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/modules")({
  beforeLoad: () => { throw redirect({ to: "/parcours" }); },
});
