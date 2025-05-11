//ride history page to display previous rides for rider and driver 
"use client";
import RideHistoryCard from "@/components/RideHistoryCard";
import { useErrorContext } from "@/context/ErrorContext";
import { useUser } from "@clerk/nextjs";
import { DocumentData } from "firebase-admin/firestore";
import React, { useEffect, useState } from "react";

const RideHistoryPage = () => {
    const {user} = useUser(); 
    const [loading, setLoading] = useState<boolean>(false);
    const {error, setError} = useErrorContext();
    const [rideHistory, setRideHistory] = useState<DocumentData[]>();

    useEffect(()=>{
      if(user && user.id && user.publicMetadata.role){
        try{
          const fetchRideHistory =  async ()=>{
            setLoading(true);

            //api to fetch ride history from server database for given user 
            const response = await fetch("/api/getRideHistory", {
                method: "POST",
                body: JSON.stringify({
                    userId: user.id,
                    role: user.publicMetadata.role,
                }),
                headers: {"Content-Type": "application/json"}
            });

            const data = await response.json();
            console.log(data.message);

            if(response.status !== 200){
              setError(data.message);
              return;
            }
            
            if(data.rideHistory && data.rideHistory.length){
                //sort ride history in reverse chronology and store in state variable
                const sortedRideHistory = sortRides(data.rideHistory);
                setRideHistory(sortedRideHistory);
            }   
           
          };
          fetchRideHistory();
        }
        catch(err){
          console.log(err);
        }
        finally{
            setLoading(false);
        }
      }
    }, [user]);

    //function to sort rides in reverse chronology
    const sortRides = (ride: DocumentData[])=>{
        return [...ride].sort((ride1, ride2)=>{
            const time1 = Number(ride1.requestTime);
            const time2 = Number(ride2.requestTime);
            return time2 - time1;
        })
    }

    //display loading if data not loaded
    if(loading){
        return(
            <div className="w-screen h-screen flex justify-center items-center p-4">
                <p className="tracking-wide">
                    Loading...
                </p>
            </div>
        )
    }

    //display ride history
    return (user && user.publicMetadata.role) &&(
        <div className="ride-history-page">
            <p className="text-lg font-semibold tracking-wider">Your Past Rides</p>
            {(rideHistory && rideHistory.length) ? (
            <div className="ride-history-container">
                {rideHistory.map((ride, index)=>(
                    <div 
                    key={index}
                    className="w-full h-full flex flex-col justify-start items-start"
                    >
                        
                        <RideHistoryCard ride={ride} role={user.publicMetadata.role as string}/>
                    </div>
                ))}
        </div>
        ):(
            <div className="w-screen h-[500px] flex flex-col justify-center items-center">
                <p>
                    You don't have any past rides
                </p>
            </div>
        )}
        </div>
    );

    
}

export default RideHistoryPage;
