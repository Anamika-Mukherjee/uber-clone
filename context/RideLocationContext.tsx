//context to store available rides location details
"use client";
import {createContext, useContext} from "react";

export const RideLocationContext = createContext<RideLocationInterface | null>(null);

export const useRideLocationContext = ()=>{
    const context = useContext(RideLocationContext);
     
    if(!context){
        throw new Error("useRideLocationContext can only be used inside RideLocationContextProvider");
    }

    return context;
}