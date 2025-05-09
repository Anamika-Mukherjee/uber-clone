//component to display driver dashboard page
"use client";
import React, {useState, useEffect} from "react";
import GoogleMapSection from "@/components/GoogleMapSection";
import { useUser } from "@clerk/nextjs";
import { useRideLocationContext } from "@/context/RideLocationContext";
import { requestPermission } from "@/utils/requestNotificationPermission";
import { DocumentData } from "firebase-admin/firestore";
import AcceptedRides from "./AcceptedRides";
import OngoingRide from "./OngoingRide";
import { useErrorContext } from "@/context/ErrorContext";

export default function DriverAccount() {

   const {setError} = useErrorContext();
   const {user} = useUser();
   const {setRideLocation} = useRideLocationContext(); 
   const [fcmToken, setFcmToken] = useState<string>("");
   const [upcomingRides, setUpcomingRides] = useState<DocumentData[]>([]);
   const [rideData, setRideData] = useState<DocumentData>();
   const [loading, setLoading] = useState<boolean>(false);

   useEffect(()=>{
      if(user && user.id && user.publicMetadata.role){
        try{
          setLoading(true);
          //request messaging token permission when driver logs in
          const requestToken = async ()=>{
            const response = await requestPermission(user.id, user.publicMetadata.role as string);
          
            if(response){
               console.log(response.message);

               if(response.status !== 200){
                  setError(response.message);
                  return;
              }
              else{
                  if(response.token){
                     //store driver fcm token in a state variable
                     setFcmToken(response.token);
                  }
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
                     //api to fetch driver's upcoming ride details 
                     const response = await fetch("/api/getNextRides", {
                        method: "POST",
                        body: JSON.stringify({
                              driverId: user.id,
                              role: "driver",
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
                        const sortedRides: DocumentData[] = sortRides(data.upcomingRides);
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
            setLoading(true);
            //api request to fetch driver's current ride details
            const fetchCurrentRide = async ()=>{
               const response = await fetch("/api/getCurrentRide", {
                  method: "POST",
                  body: JSON.stringify({
                     userId: user.id,
                     role: "driver"
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

   useEffect(()=>{  
         //get driver's real time location      
         const fetchLocation = (userId: string)=>{
            if("geolocation" in navigator){
               navigator.geolocation.getCurrentPosition((position)=>{
                  const {latitude, longitude} = position.coords;

                  //store driver's location in context variable
                  setRideLocation((prev: RideInterface[])=>
                     prev.map((ride)=>
                        ride.driverId === userId
                        ?{...ride, lat: latitude, lng: longitude}
                        :ride
                     )                 
                  ) 

                  //call function to update driver location in database
                  updateLocation(latitude, longitude);
               },
               (error)=>{
                  setError(error.message);
               },
               {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0,
               }
               )
            }
            else{
               setError("Geolocation is not supported in this browser");

            }
         };
         if(user && user.id){
            fetchLocation(user.id);
         }
           
   }, [user]);

   //function to update driver location in database
   const updateLocation = async (latitude: number, longitude: number)=>{
        try{
            if(user && user.id){
               setLoading(true);
               //api to update driver location in database
               const response = await fetch("/api/updateDriverLocation", {
                  method: "POST", 
                  body: JSON.stringify({
                     driverId: user.id,
                     lat: latitude,
                     lng: longitude,
                  }),
                  headers: {"Content-Type": "application/json"}
              });
              
              const data = await response.json();
              console.log(data.message);

              if(response.status !== 200){
                setError(data.message);
                return;
              }
            }   
        }
        catch(err){
           console.log(err);
        }
        finally{
         setLoading(false);
        }
   }

   //function to sort rides in chronological order
   const sortRides = (rides: DocumentData[])=>{
      return [...rides].sort((ride1, ride2)=>{
         const time1 = Number(ride1.requestTime);
         const time2 = Number(ride2.requestTime);
         return time1 - time2;
      })
   }

   //display loading message if data not loaded   
   if(loading){
      return (
      <div className="driver-home-container">
          <p className="tracking-wider">Loading</p>
      </div>
      )
   }  
     
  //display driver dashboard  
  return (   
      <div className="driver-home-container">
         <div className="driver-map-container">
            <GoogleMapSection role = "driver"/>
         </div>
         
         <div className="driver-ride-list-container">
            {rideData && rideData.rideId ? (
               <div className="driver-current-ride">
                   <OngoingRide rideData = {rideData}/>
               </div>
            ):null}
             {upcomingRides && upcomingRides.length ?(
               <div className="driver-upcoming-rides">
                  <AcceptedRides upcomingRides={upcomingRides}/>
               </div>
             ):null}
         </div>                 
      </div>    
  );
}