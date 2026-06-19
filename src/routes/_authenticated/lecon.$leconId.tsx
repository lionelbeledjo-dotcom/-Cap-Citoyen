import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/lecon/$leconId")({
  beforeLoad: async ({ params }) => {
    const { data } = await supabase
      .from("lecons")
      .select("module_id")
      .eq("id", params.leconId)
      .maybeSingle();
    if (data?.module_id) {
      throw redirect({
        to: "/parcours/$moduleId/lecon/$leconId",
        params: { moduleId: data.module_id, leconId: params.leconId },
      });
    }
    throw redirect({ to: "/parcours" });
  },
});
