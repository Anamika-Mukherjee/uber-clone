//component to display list of accepted rides in driver dashboard
"use client";
import { DocumentData } from "firebase-admin/firestore";
import React, { useState } from "react";
import UpcomingRideCard from "./UpcomingRideCard";
import AcceptedRideModal from "./AcceptedRideModal";

const AcceptedRides = ({upcomingRides}: {upcomingRides: DocumentData[]}) => {
    const [open, setOpen] = useState<boolean>(false);
    const [rideData, setRideData] = useState<DocumentData>();

    const handleClick = (ride: DocumentData)=>{
      setOpen(true);
      setRideData(ride);
    }
   
    return (upcomingRides && upcomingRides.length) && (
        <div className="w-[500px] h-[500px] flex flex-col justify-start items-center space-y-6 px-2 bg-gray-300 rounded-md py-6 overflow-y-auto">
            <h2 className="font-semibold text-lg text-gray-700">Your Upcoming Rides</h2>
            {upcomingRides.map((ride, index)=>(
            <div 
              key={index}
              onClick={()=>handleClick(ride)}
              className="w-[400px] h-[180px] flex flex-col justify-start items-start space-y-2 bg-gray-200 p-4 rounded-md transition duration-200 ease-in-out hover:cursor-pointer hover:scale-105"
              >
              <UpcomingRideCard ride={ride}/>
            </div>
            ))}
            {/* display accepted ride modal when a ride is clicked */}
            {(open && rideData) && (
            <AcceptedRideModal ride = {rideData} openModal={open} setOpenModal={setOpen}/>
            )}
        </div>
      )
}
  
export default AcceptedRides;
