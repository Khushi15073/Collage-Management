import { createContext, useContext } from "react";

type DashboardSearchContextValue = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
};

const DashboardSearchContext = createContext<DashboardSearchContextValue | null>(null);

export function DashboardSearchProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: DashboardSearchContextValue;
}) {
  return (
    <DashboardSearchContext.Provider value={value}>
      {children}
    </DashboardSearchContext.Provider>
  );
}

export function useDashboardSearch() {
  const context = useContext(DashboardSearchContext);

  if (!context) {
    return {
      searchQuery: "",
      setSearchQuery: () => undefined,
    };
  }

  return context;
}
