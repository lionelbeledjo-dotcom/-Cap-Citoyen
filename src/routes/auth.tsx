import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    throw redirect({ to: search.mode === "signup" ? "/inscription" : "/connexion" });
  },
});
