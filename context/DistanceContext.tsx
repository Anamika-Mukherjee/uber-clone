//context to store distance between source and destination location
"use client";
import { createContext, useContext } from "react";

export const DistanceContext = createContext<DistanceContextInterface | null>(null);

export const useDistanceContext = ()=>{
    const context = useContext(DistanceContext);

    if(!context){
        throw new Error("useDistanceContext must be used inside a DistanceProvider")
    }

    return context;
}