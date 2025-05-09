//component to display current ride in driver dashboard
"use client";
import { useErrorContext } from "@/context/ErrorContext";
import { useInfoContext } from "@/context/InfoContext";
import { convertToDateTime } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { DocumentData } from "firebase-admin/firestore";
import React, { useState } from "react";

const OngoingRide = ({rideData}: {rideData: DocumentData}) => {
    const {user} = useUser();
    const {setError} = useErrorContext();
    const {setInfo} = useInfoContext();
    const [loading, setLoading] = useState<boolean>(false);

    //event handler for ride end button 
    const handleClick= async ()=>{
          try{
                setLoading(true);
                //api to end ongoing ride from driver dashboard
                const response = await fetch("/api/endRide", {
                  method: "POST",
                  body: JSON.stringify({
                    rideId: rideData.rideId,
                  }),
                  headers: {"Content-Type": "application/json"}
                });

                const data = await response.json();
                console.log(data.message);

                if(response.status !== 200){
                 setError(data.message);
                 return;
                }
                setInfo("Ride ended successfully");
          }
          catch(err){
            console.log(err);
          }
          finally{
            setLoading(false);
          }
      }

  //display current ride    
  return (user && rideData) && (
    <div className="w-full h-auto flex flex-col justify-start items-center space-y-6 px-6 py-8 bg-white rounded-md">
      
        <p className="text-lg font-semibold tracking-wide">Your current Ride</p>
      
        <div className="current-ride-container">
        <p className="font-medium">Customer: {rideData.riderName?rideData.riderName:rideData.riderId}</p>
        <p className="font-medium text-gray-500 flex">Customer Phone: <span className="ml-4 text-black">{rideData.riderContactNumber}</span></p>
        <p className="font-medium text-gray-500 flex">Ride Start Time: <span className="ml-4 text-black">{convertToDateTime(rideData.startTime)}</span></p>
        <p className="font-medium text-gray-500 flex">Pickup: <span className="ml-4 text-black">{rideData.source.address}</span></p>
        <p className="font-medium text-gray-500 flex">Dropoff: <span className="ml-4 text-black">{rideData.destination.address}</span></p>
        <p className="font-medium text-gray-500 flex">Requested at: <span className="ml-4 text-black">{convertToDateTime(rideData.requestTime)}</span></p>
        <p className="font-medium text-gray-500 flex">Estimated Fare: <span className="ml-4 text-black">{rideData.estimatedFare}</span></p>
        </div>
        <div className="w-full h-[45px] flex justify-center items-center p-4 bg-black rounded-md hover:cursor-pointer hover:bg-gray-800">
          <button 
           type="button"
           onClick={handleClick}
           className="w-full h-full flex justify-center items-center rounded-md text-white hover:cursor-pointer"
           >
           End Ride
          </button>
        </div>
       
    </div>
  )
}

export default OngoingRide;
