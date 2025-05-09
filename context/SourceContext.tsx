//context to store source location
"use client";
import { createContext, useContext } from "react";

export const SourceContext = createContext<SourceObject | null>(null);
                                          
export const useSourceContext = () => {
  const context = useContext(SourceContext);

  if (!context) {
    throw new Error("useSourceContext must be used within a SourceProvider");
  }

  return context;
};                                          