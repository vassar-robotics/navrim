import type { Session } from "@/protocol/response";
import { createContext, useContext } from "react";

interface AuthContextType {
  session: Session | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
