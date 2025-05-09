//component to display rider dashboard page
"use client";
import React, { useState, useEffect } from "react";
import Search from "@/components/Search";
import GoogleMapSection from "@/components/GoogleMapSection";
import CarListSection from "@/components/CarListSection";
import { useDistanceContext } from "@/context/DistanceContext";
import {requestPermission} from "@/utils/requestNotificationPermission"
import { useUser } from "@clerk/nextjs";
import RiderNextRide from "./RiderNextRide";
import RiderCurrentRide from "./RiderCurrentRide";
import { DocumentData } from "firebase-admin/firestore";
import { useErrorContext } from "@/context/ErrorContext";
import { useSourceContext } from "@/context/SourceContext";
import { useDestinationContext } from "@/context/DestinationContext";

export default function RiderAccount() {
    const [loading, setLoading] = useState<boolean>(false);
    const {distance} = useDistanceContext();
    const {user} = useUser();
    const {setError} = useErrorContext();
    const {source} = useSourceContext();
    const {destination} = useDestinationContext();
    const [upcomingRides, setUpcomingRides] = useState<DocumentData[]>([]);
    const [rideData, setRideData] = useState<DocumentData>();
    
    useEffect(()=>{
      if(user && user.id && user.publicMetadata.role){
        try{
          const requestToken = async ()=>{
            setLoading(true);
            //request messaging token permission when rider logs in
            const response = await requestPermission(user.id, user.publicMetadata.role as string);

            if(response){
              console.log(response.message);
              if(response.status !== 200){
                setError(response.message);
                return;
              }
            } 
          }
          requestToken();
        }
        catch(err){
            console.log(err);
        }
        finally{
          setLoading(false);
        }
      }  
    }, [user]);

    
    useEffect(()=>{
        if(user && user.id){
            try{
              const fetchNextRide = async ()=>{
                  setLoading(true);
                  //api to fetch rider's upcoming ride details 
                  const response = await fetch("/api/getNextRides", {
                      method: "POST",
                      body: JSON.stringify({
                          riderId: user.id,
                          role: "rider",
                      }),
                      headers: {"Content-Type": "application/json"}
                  });

                  const data = await response.json();
                  console.log(data.message);

                  if(response.status !== 200){
                      setError(data.message);
                      return;
                  }
                  
                  if(data.upcomingRides){
                      //sort rides in chronological order and store in array state
                      const sortedRides : DocumentData[] = sortRides(data.upcomingRides);
                      setUpcomingRides(sortedRides);
                  }  
              }
              fetchNextRide();
            }
            catch(err){
                console.log(err);
            }   
            finally{
              setLoading(false);
            } 
        }
      }, [user]);

      
      useEffect(()=>{
          if(user && user.id){
            try{
              const fetchCurrentRide = async ()=>{
                setLoading(true);
                //api request to fetch rider's current ride details
                const response = await fetch("/api/getCurrentRide", {
                    method: "POST",
                    body: JSON.stringify({
                        userId: user.id,
                        role: "rider"
                    }),
                    headers: {"Content-Type": "application/json"}
                });
                const data = await response.json();
                console.log(data.message);

                if(response.status !== 200){
                    setError(data.message);
                    return;
                }

                if(data.currentRide){
                  //store current ride details in state variable
                  setRideData(data.currentRide);
                }
              };
              fetchCurrentRide();
            }
            catch(err){
              console.log(err);
            }
            finally{
              setLoading(false);
            }
          }
        }, [user]);

        //function to sort rides in chronological order
        const sortRides = (rides: DocumentData[])=>{
          return [...rides].sort((ride1, ride2)=>{
            const time1 = Number(ride1.requestTime);
            const time2 = Number(ride2.requestTime);
            return time1 - time2;
          });
        };

        //display loading message if data not loaded   
        if(loading){
          return (
          <div className="w-screen h-screen flex flex-col justify-center items-center p-4">
              <p className="tracking-wider">Loading</p>
          </div>
          )
        }  

        return (   
              <>      
                  <div className="rider-home-container">
                      <div className = "search-car-list-container">
                          <div className="search-container">
                            <Search />
                          </div>
                          {/* display car list if source and destination are entered by rider */}
                          {distance?(
                            <CarListSection />
                          ):null}   
                      </div>
                      <div className="map-message-section">
                          <div className="google-map-container">
                            <GoogleMapSection role = "rider"/>
                          </div>
                        <div className="ride-list-section">
                          {/* display current ride details if available */}
                          {rideData && (
                            <div className="current-ride-section">
                              <RiderCurrentRide rideData = {rideData}/>
                          </div>
                          )}
                          {/* display upcoming ride details if available */}
                          {upcomingRides && (
                            <div className="next-ride-section">
                              <RiderNextRide upcomingRides={upcomingRides}/>
                          </div>
                          )} 
                        </div>
                      </div>
                  </div> 
                  <div className="w-screen min-h-screen h-auto flex flex-col justify-start items-center space-y-6 py-6 px-2 lg:hidden">
                        <div className = "map-section-mob">
                          <div className="google-map-container">
                            <GoogleMapSection role = "rider"/>
                          </div>
                        </div>
                        <div className = "search-car-list-container-mob">
                          <div className="search-container">
                            <Search />
                          </div>
                          {/* display car list if source and destination are entered by rider */}
                          {distance && source && destination?(
                            <CarListSection />
                          ):null}   
                        </div>
                        <div className="message-section">
                          
                          <div className="ride-list-section">
                            {/* display current ride details if available */}
                            {rideData && (
                              <div className="current-ride-section">
                              <RiderCurrentRide rideData = {rideData}/>
                            </div>
                            )}
                            {/* display upcoming ride details if available */}
                            {upcomingRides && (
                              <div className="next-ride-section">
                              <RiderNextRide upcomingRides={upcomingRides}/>
                            </div>
                            )} 
                          </div>
                      </div>
                  </div>
            </>
        
        );
}
