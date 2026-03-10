import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
  } from "react";
  import { useNavigate } from "react-router-dom";

/* =========================
   CONFIG
========================= */

const AuthContext = createContext(null);

const SESSION_KEY = "sessionKey";
const ONE_DAY = 24 * 60 * 60 * 1000;

/* =========================
   SESSION HELPERS
========================= */

// đọc session
function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);

    // không có expires
    if (!session?.expiresAt) return null;

    // hết hạn
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    return session;
  } catch (err) {
    console.error("Session parse error:", err);
    return null;
  }
}

// lưu session
function saveSession(user, token) {
  const session = {
    user,
    token,
    expiresAt: Date.now() + ONE_DAY,
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// xoá session
function removeSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

/* =========================
   AUTH PROVIDER
========================= */

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  /* =========================
     Restore session khi load app
  ========================= */

  useEffect(() => {
    const session = getSession();

    if (session?.user) {
      setUser(session.user);
    }

    setAuthReady(true);
  }, []);

  /* =========================
     Auto logout khi session hết hạn
  ========================= */

  useEffect(() => {
    const interval = setInterval(() => {
      const session = getSession();

      if (!session && user) {
        setUser(null);
        navigate("/login");
      }
    }, 60000); // check mỗi phút

    return () => clearInterval(interval);
  }, [user, navigate]);

  /* =========================
     LOGIN
  ========================= */

  const login = (userData) => {
    const token = userData.token || userData.user?.token;
    setUser(userData);

    saveSession(userData, token);

    // điều hướng theo role
    if (userData.role === "volunteer") {
      navigate("/home-volunteer");
    } else if (userData.role === "organization") {
      navigate("/dashboard-org");
    } else {
      navigate("/");
    }
  };

  /* =========================
     LOGOUT
  ========================= */

  const logout = () => {
    setUser(null);
    removeSession();
    navigate("/login");
  };

  /* =========================
     UPDATE USER
  ========================= */

  const updateSession = (updatedUser) => {
    const session = getSession();

    if (!session) return;

    const newSession = {
      ...session,
      user: updatedUser,
      expiresAt: Date.now() + ONE_DAY,
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));

    setUser(updatedUser);
  };

  /* =========================
     CONTEXT VALUE
  ========================= */

  const value = useMemo(() => {
    return {
      user,
      authReady,
      login,
      logout,
      updateSession,
    };
  }, [user, authReady, login, logout, updateSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* =========================
   HOOK
========================= */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
