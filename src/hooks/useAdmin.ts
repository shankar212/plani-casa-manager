import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAdmin = () => {
    const { user } = useAuth();

    const { data: isAdmin, isLoading } = useQuery({
        queryKey: ["isAdmin", user?.id],
        queryFn: async () => {
            if (!user) return false;

            console.log("Checking admin status for user:", user.id);
            const { data, error } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", user.id)
                .eq("role", "admin")
                .maybeSingle();

            if (error) {
                console.error("Error checking admin status:", error);
                return false;
            }

            console.log("Admin check result:", data);
            return !!data;
        },
        enabled: !!user,
    });

    return { isAdmin, isLoading };
};
