//card component to display accepted ride in driver dashboard
"use client";
import { DocumentData } from "firebase-admin/firestore";
import React from "react";
import { convertToDateTime } from "@/lib/utils";

const UpcomingRideCard = ({ride}: {ride: DocumentData}) => {
  return (
    <>
        <p className="font-medium">Customer: {ride.riderName?ride.riderName:ride.riderId}</p>
        <p className="font-medium line-clamp-1">Pickup: <span className="font-normal ml-1">{ride.source.address}</span></p>
        <p className="font-medium line-clamp-1">Dropoff: <span className="font-normal ml-1">{ride.destination.address}</span></p>
        <p className="font-medium line-clamp-1">Requested at: <span className="font-normal ml-1">{convertToDateTime(ride.requestTime)}</span></p>
    </>
  )
}

export default UpcomingRideCard;
