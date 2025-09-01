import React, { useEffect, useState } from "react";
import { fetchUserProfile } from "../../service/supabaseApi";
import { Card, CardContent } from "../../ui/card";
import { ShieldAlert } from "lucide-react";

export default function AdminGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return setAllowed(false);
        const profile = await fetchUserProfile(userId);
        setAllowed(profile?.role === "admin");
      } catch {
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4" />
      </div>
    );

  if (!allowed)
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Card className="max-w-xl w-full">
          <CardContent className="p-8 text-center">
            <ShieldAlert className="mx-auto mb-4 h-10 w-10" />
            <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              This area is restricted to admins only.
            </p>
          </CardContent>
        </Card>
      </div>
    );

  return children;
}
