import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { InterestItem } from "./catalog.types";

const STORAGE_KEY = "estrela-interest-items";

function loadItems(): InterestItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveItems(items: InterestItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota errors */
  }
}

type InterestContextValue = {
  items: InterestItem[];
  addItem: (item: Omit<InterestItem, "key">) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const InterestContext = createContext<InterestContextValue | null>(null);

export function InterestProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InterestItem[]>(loadItems);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const addItem = useCallback((item: Omit<InterestItem, "key">) => {
    setItems((current) => [...current, { ...item, key: crypto.randomUUID() }]);
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<InterestContextValue>(
    () => ({ items, addItem, removeItem, clear }),
    [items, addItem, removeItem, clear],
  );

  return <InterestContext.Provider value={value}>{children}</InterestContext.Provider>;
}

export function useInterest() {
  const context = useContext(InterestContext);
  if (!context) throw new Error("useInterest must be used inside InterestProvider");
  return context;
}
