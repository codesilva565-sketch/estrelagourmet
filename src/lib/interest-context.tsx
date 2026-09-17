import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { InterestItem } from "./catalog.types";

type InterestContextValue = {
  items: InterestItem[];
  addItem: (item: Omit<InterestItem, "key">) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const InterestContext = createContext<InterestContextValue | null>(null);

export function InterestProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InterestItem[]>([]);
  const value = useMemo<InterestContextValue>(
    () => ({
      items,
      addItem: (item) => setItems((current) => [...current, { ...item, key: crypto.randomUUID() }]),
      removeItem: (key) => setItems((current) => current.filter((item) => item.key !== key)),
      clear: () => setItems([]),
    }),
    [items],
  );
  return <InterestContext.Provider value={value}>{children}</InterestContext.Provider>;
}

export function useInterest() {
  const context = useContext(InterestContext);
  if (!context) throw new Error("useInterest must be used inside InterestProvider");
  return context;
}
