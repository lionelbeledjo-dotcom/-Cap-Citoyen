import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/modules/$id")({
  beforeLoad: () => { throw redirect({ to: "/parcours" }); },
});
