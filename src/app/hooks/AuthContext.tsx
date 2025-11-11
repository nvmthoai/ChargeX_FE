import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../../api/user/type";


interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

// ✅ Provider chính
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // ✅ Khôi phục thông tin từ localStorage khi reload trang
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (err) {
        console.error("Invalid stored user data:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);


  const login = (user: User, token: string) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    setUser(user);
    setToken(token);

    // Initialize notification socket when user logs in
    (async () => {
      try {
        const mod = await import("../../services/notificationSocket");
        const notificationSocket = mod.notificationSocket;
        // extract uid in a type-safe way
        const u = user as unknown as Record<string, unknown> | null;
        const uid = (u && (typeof u["sub"] === "string"
          ? (u["sub"] as string)
          : typeof u["id"] === "string"
          ? (u["id"] as string)
          : null)) as string | null;
        if (uid) {
          notificationSocket.connectWithToken(uid, token);
        }
      } catch (err) {
        console.warn("Failed to init notification socket on login", err);
      }
    })();
  };


  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);

    (async () => {
      try {
        const mod = await import("../../services/notificationSocket");
        mod.notificationSocket.disconnect();
      } catch (err) {
        console.warn("Failed to disconnect notification socket on logout", err);
      }
    })();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook tiện dụng
export const useAuth = () => useContext(AuthContext);
