"use client";

import { createContext, useContext, useState } from "react";

type AnalysisData = {
  nome?: string;
  renda?: string;
  entrada?: string;
  urgencia?: string;
  bairros?: string[];
  tipo?: string;
  preco?: string;
  resultado?: any;
};

type AnalysisContextType = {
  data: AnalysisData;
  setData: (data: Partial<AnalysisData>) => void;
  reset: () => void;
};

const AnalysisContext = createContext<AnalysisContextType | null>(null);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<AnalysisData>({});

  function setData(newData: Partial<AnalysisData>) {
    setDataState((prev) => ({ ...prev, ...newData }));
  }

  function reset() {
    setDataState({});
  }

  return (
    <AnalysisContext.Provider value={{ data, setData, reset }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) throw new Error("useAnalysis must be used within provider");
  return context;
}