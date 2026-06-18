import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/tableau-de-bord")({
  beforeLoad: () => { throw redirect({ to: "/tableau-bord" }); },
});
