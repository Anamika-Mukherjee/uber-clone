//context to store success and other miscellaneous messages
"use client";
import {createContext, useContext} from "react";

export const InfoContext = createContext<InfoContextInterface | null>(null);

export const useInfoContext = ()=>{
    const context = useContext(InfoContext);

    if(!context) {
        throw new Error("useInfoContext must be used within a InfoContextProvider");
    }
    
      return context;
}