"use client";

import { createContext, useContext, useState, useEffect } from "react";

const FavoritesContext = createContext({
  favorites: [],
  recents: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  addRecent: () => {},
  isCommandPaletteOpen: false,
  openCommandPalette: () => {},
  closeCommandPalette: () => {},
});

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [recents, setRecents] = useState([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem("devutilix_favorites");
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
      const savedRecents = localStorage.getItem("devutilix_recents");
      if (savedRecents) {
        setRecents(JSON.parse(savedRecents));
      }
    } catch {
      // Ignore JSON parse errors
    }
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      let updated;
      if (prev.includes(id)) {
        updated = prev.filter((item) => item !== id);
      } else {
        updated = [...prev, id];
      }
      try {
        localStorage.setItem("devutilix_favorites", JSON.stringify(updated));
      } catch {
        // Storage full or disabled
      }
      return updated;
    });
  };

  const isFavorite = (id) => favorites.includes(id);

  const addRecent = (id) => {
    if (!id) return;
    setRecents((prev) => {
      const filtered = prev.filter((item) => item !== id);
      const updated = [id, ...filtered].slice(0, 6);
      try {
        localStorage.setItem("devutilix_recents", JSON.stringify(updated));
      } catch {
        // Storage full or disabled
      }
      return updated;
    });
  };

  const openCommandPalette = () => setIsCommandPaletteOpen(true);
  const closeCommandPalette = () => setIsCommandPaletteOpen(false);

  // Global keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        recents,
        isFavorite,
        toggleFavorite,
        addRecent,
        isCommandPaletteOpen,
        openCommandPalette,
        closeCommandPalette,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
