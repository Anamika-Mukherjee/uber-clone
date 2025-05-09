//modal component for next ride details accessed from rider dashboard
"use client";
import { DocumentData } from "firebase-admin/firestore";
import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
import { convertToDateTime } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useErrorContext } from "@/context/ErrorContext";
import { useInfoContext } from "@/context/InfoContext";

interface RideModalProps{
    ride: DocumentData;
    openModal: boolean;
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const RideModal = ({ride, openModal, setOpenModal}: RideModalProps) => {
    const {user} = useUser();
    const {setError} = useErrorContext();
    const {setInfo} = useInfoContext();
    const [loading, setLoading] = useState<boolean>(false);

    //function to fetch driver token to send ride cancel request
    const fetchDriverToken = async ()=>{
      if(user && user.id && ride){
        try{
            setLoading(true);
            //api request to get driver fcm token
            const response = await fetch("/api/getMessageToken", {
              method: "POST",
              body: JSON.stringify({
                driverId: ride.driverId,
                tokenType: "driver",
              }),
              headers: {"Content-Type": "application/json"}
            });

            const data = await response.json();
            console.log(data.message);

            if(response.status !== 200){
              setError(data.message);
              return;
            }
            //return driver token
            if(data.driverToken){
              return data.driverToken;
            }
            else{
              return;
            }
        }
        catch(err){
          console.log(err);
        }
        finally{
          setLoading(false);
        }
      }
    }

    //event handler for ride cancel button
    const handleCancelClick = async()=>{
      if(user && user.id){
        try{
           //function to call api to fetch driver fcm token
           const token = await fetchDriverToken();
           if(!token){
            console.log("Token not available");
            setError("Token not available");
           }
           else{
            setLoading(true);
            //api to send ride cancel request to driver
            const response = await fetch("/api/riderRideCancel", {
              method: "POST",
              body: JSON.stringify({
                rideId: ride.rideId,
                token,
                data: {
                  title: "Ride Cancellation Message",
                  body: `Ride with ride Id ${ride.rideId} cancelled by ${ride.riderName}.`,
                  type: "RIDE_CANCELLATION",
                  rideId: ride.id,
                  senderId: user.id,
                  receiverId: ride.driverId,
                  riderName: ride.riderName,
                  status: "cancelled",
                }
              }), 
              headers: {"Content-Type": "application/json"}
             });
  
             const data = await response.json();
             console.log(data.message);
             
             if(response.status !== 200){
              setError(data.message);
              return;
             }
             //display message if ride cancelled successfully
              setInfo(data.message);
              setOpenModal(false);
           }  
        }
        catch(err){
          console.log(err);
        }
        finally{
          setLoading(false);
        }
      }
    }

    //display loading message if data not loaded   
    if(loading){
      return (
      <div className="w-screen h-screen flex flex-col justify-center items-center p-4">
          <p className="tracking-wider">Loading</p>
      </div>
      )
    } 
      //display ride details modal
      return (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent className="w-[600px] min-h-[200px] h-auto flex flex-col justify-center items-center space-y-6 px-8">
                <DialogHeader className="w-full h-auto flex flex-col justify-start items-start space-y-6">
                    <DialogTitle className="font-medium">Customer Name: {ride.riderName}</DialogTitle>
                </DialogHeader>
                    <div className="w-full h-auto flex flex-col justify-start items-start space-y-4">
                        <p className="font-medium">Ride Accepted By {ride.driverName?ride.driverName:ride.driverId}</p>
                        <p className="font-medium text-gray-500 flex">Driver Phone: <span className="ml-4 text-black">{ride.driverPhone}</span></p>
                        <p className="font-medium text-gray-500 flex">OTP: <span className="ml-4 text-black">{ride.rideStartOtp}</span></p>
                        <p className="text-sm font-normal text-gray-500 flex">Share this OTP with driver before ride starts</p>
                        <p className="font-medium text-gray-500 flex">Vehicle Number: <span className="ml-4 text-black">{ride.vehicleNumber}</span></p>
                        <p className="font-medium text-gray-500 flex">Vehicle Description: <span className="ml-4 text-black">{ride.vehicleDescription}</span></p>
                        <p className="font-medium text-gray-500 flex">Pickup: <span className="ml-4 text-black">{ride.source.address}</span></p>
                        <p className="font-medium text-gray-500 flex">Dropoff: <span className="ml-4 text-black">{ride.destination.address}</span></p>
                        <p className="font-medium text-gray-500 flex">Requested at: <span className="ml-4 text-black">{convertToDateTime(ride.requestTime)}</span></p>
                        <p className="font-medium text-gray-500 flex">Estimated Fare: <span className="ml-4 text-black">{ride.estimatedFare}</span></p>
                    </div>
                    <div className="w-full h-[45px] flex justify-center items-center p-4 bg-black rounded-md hover:cursor-pointer hover:bg-gray-800">
                      <button
                        type="button"
                        onClick={handleCancelClick}
                        className="w-full h-full flex justify-center items-center text-white rounded-md hover:cursor-pointer"
                        >
                        Cancel Ride
                      </button>
                    </div>
                </DialogContent>  
        </Dialog>           
      )
}

export default RideModal;
