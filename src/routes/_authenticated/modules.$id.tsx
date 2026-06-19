import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/modules/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/parcours/$moduleId", params: { moduleId: params.id } });
  },
});
