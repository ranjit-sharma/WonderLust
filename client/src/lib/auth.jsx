import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { api } from "./api.js";
import { useToast } from "./toast.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(async () => {
    await api("/logout", { method: "POST" });
    setUser(null);
  }, []);

  const setWishlisted = useCallback((listingId, saved) => {
    setUser((u) =>
      u && {
        ...u,
        wishlist: saved ? [...u.wishlist, listingId] : u.wishlist.filter((id) => id !== listingId),
      },
    );
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, setWishlisted }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Sends a signed-out visitor to log in, then back to where they were.
export function useRequireLogin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  return useCallback(() => {
    if (user) return true;
    toast("You must be logged in to do that!", "error");
    navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
    return false;
  }, [user, navigate, location, toast]);
}
