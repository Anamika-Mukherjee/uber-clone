//client component for layout to wrap all pages in contexts
"use client";

import { ReactNode, useState } from "react";
import { ErrorContext } from "@/context/ErrorContext";
import ErrorMessage from "./ErrorMessage";
import { InfoContext } from "@/context/InfoContext";
import { SourceContext } from "@/context/SourceContext";
import { DestinationContext } from "@/context/DestinationContext";
import { DistanceContext } from "@/context/DistanceContext";
import { RideLocationContext } from "@/context/RideLocationContext";
import InfoMessage from "./InfoMessage";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string>("");
  const [info, setInfo] = useState<string>("");
  const [source, setSource] = useState<{lat: number, lng: number, label: string}>({lat: 0, lng: 0, label: ""});
  const [destination, setDestination] = useState<{lat: number, lng: number, label: string}>({lat: 0, lng: 0, label: ""});
  const [distance, setDistance] = useState<number>(0);
  const [rideLocation, setRideLocation] = useState<RideInterface[]>([]);

  return (
        <InfoContext.Provider value={{info, setInfo}}>
          <ErrorContext.Provider value={{ error, setError }}>
            <SourceContext.Provider value = {{source, setSource}}>
              <DestinationContext.Provider value={{destination, setDestination}}>
                <DistanceContext.Provider value = {{distance, setDistance}}>
                  <RideLocationContext.Provider value = {{rideLocation, setRideLocation}}>
                      {error && (
                        <ErrorMessage errorMessage={error} />
                      )}
                      {info && (
                        <InfoMessage infoMessage={info} />
                      )}
                      {children}
                  </RideLocationContext.Provider>
                </DistanceContext.Provider>
              </DestinationContext.Provider>
            </SourceContext.Provider>
          </ErrorContext.Provider>
        </InfoContext.Provider>
  );
}