//component to display upcoming rides for rider
"use client";
import { convertToDateTime } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { DocumentData } from "firebase-admin/firestore";
import React, { useState } from "react";
import RideModal from "./RideModal";

const RiderNextRide = ({upcomingRides}: {upcomingRides: DocumentData[]}) => {
    const {user} = useUser();
    const [rideData, setRideData] = useState<DocumentData>();
    const [open, setOpen] = useState<boolean>(false);

    return (user && upcomingRides && upcomingRides.length) ? (
        <div className="next-rides-container">
            <p className="text-lg font-semibold">Your upcoming rides</p>
            {upcomingRides.map((ride, index)=>(
                <div 
                 key={index}
                 onClick={()=>{setOpen(true); setRideData(ride)}}
                 className="w-full h-[370px] flex flex-col justify-start items-start space-y-2 bg-gray-300 p-4 rounded-md transition duration-200 ease-in-out hover:cursor-pointer hover:scale-103"
                 >
                  <p className="font-medium">Ride Accepted By {ride.driverName?ride.driverName:ride.driverId}</p>
                  <p className="font-medium">Driver Phone: {ride.driverPhone}</p>
                    <p className="font-medium line-clamp-1">OTP: <span className="font-normal ml-1">{ride.rideStartOtp}</span></p>
                    <p className="text-sm font-normal">Share this OTP with driver before ride starts</p>
                    <p className="font-medium line-clamp-1">Vehicle Number: <span className="font-normal ml-1">{ride.vehicleNumber}</span></p>
                    <p className="font-medium line-clamp-1">Vehicle Description: <span className="font-normal ml-1">{ride.vehicleDescription}</span></p>
                    <p className="font-medium line-clamp-1">Pickup: <span className="font-normal ml-1">{ride.source.address}</span></p>
                    <p className="font-medium line-clamp-1">Dropoff: <span className="font-normal ml-1">{ride.destination.address}</span></p>
                    <p className="font-medium line-clamp-1">Requested at: <span className="font-normal ml-1">{convertToDateTime(ride.requestTime)}</span></p>
                    <p className="font-medium line-clamp-1">Estimated Fare: <span className="font-normal ml-1">{ride.estimatedFare}</span></p>
                </div>
            ))}
            {/* open modal to display ride details */}
            {(open && rideData) && (
                <RideModal ride={rideData} openModal={open} setOpenModal={setOpen}/>
            )}
            
        </div>
    ):null
}

export default RiderNextRide;
