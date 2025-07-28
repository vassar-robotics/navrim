import type { Session } from "@/protocol/response";
import { AuthContext } from "@/lib/auth";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedSession = localStorage.getItem("session");
    if (storedSession) {
      setSession(JSON.parse(storedSession));
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session: session,
        isLoading: isLoading
      }}
    >
      {children}
    </AuthContext.Provider>);
}