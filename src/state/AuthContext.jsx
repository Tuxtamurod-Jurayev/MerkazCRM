import { createContext, useContext, useMemo, useState } from "react";

const USERS = [
  {
    username: "admin",
    password: "admin123",
    role: "admin",
    fullName: "Tizim administratori",
  },
  {
    username: "qabulxona",
    password: "qabul123",
    role: "qabulxona",
    fullName: "Qabulxona xodimi",
  },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const persisted = localStorage.getItem("crm_auth_user");
    return persisted ? JSON.parse(persisted) : null;
  });

  const login = ({ username, password }) => {
    const matched = USERS.find(
      (candidate) =>
        candidate.username.trim().toLowerCase() === username.trim().toLowerCase() &&
        candidate.password === password,
    );

    if (!matched) {
      return { ok: false, message: "Login yoki parol noto'g'ri." };
    }

    const safeUser = {
      username: matched.username,
      role: matched.role,
      fullName: matched.fullName,
    };

    setUser(safeUser);
    localStorage.setItem("crm_auth_user", JSON.stringify(safeUser));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("crm_auth_user");
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
