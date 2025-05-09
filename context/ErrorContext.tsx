//context to store error message
"use client";
import {createContext, useContext} from "react";

export const ErrorContext = createContext<ErrorContextInterface | null>(null);

export const useErrorContext = ()=>{
    const context = useContext(ErrorContext);

    if(!context) {
        throw new Error("useErrorContext must be used within a ErrorContextProvider");
    }
    
      return context;
}