//context to store destination location
"use client";
import { createContext, useContext } from "react";

export const DestinationContext = createContext<DestinationObject | null>(null);

export const useDestinationContext = () => {
  const context = useContext(DestinationContext);

  if (!context) {
    throw new Error("useSourceContext must be used within a SourceProvider");
  }

  return context;
}; 