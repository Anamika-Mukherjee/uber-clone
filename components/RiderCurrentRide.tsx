//component to display ongoing ride for rider
"use client";
import React, {useState, useEffect} from "react";
import { useUser } from "@clerk/nextjs";
import { DocumentData } from "firebase-admin/firestore";
import { convertToDateTime } from "@/lib/utils";
import Checkout from "./Checkout";
import { useErrorContext } from "@/context/ErrorContext";
import { useInfoContext } from "@/context/InfoContext";

const RiderCurrentRide = ({rideData}: {rideData: DocumentData}) => {
  const {user} = useUser();
  const {setError} = useErrorContext();
  const [paymentSessionId, setPaymentSessionId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const {setInfo} = useInfoContext();

  //function to get rider details
  const getRiderDetails = async ()=>{
    try{
       if(user && user.id){
        setLoading(true);
        //api to get rider details
        const response = await fetch("/api/getRiderDetails", {
          method: "POST",
          body: JSON.stringify({
            riderId: user.id,
          }),
          headers: {"Content-Type": "application/json"},
        });

        const data = await response.json();
        console.log(data.message);

        if(response.status !== 200){
          setError(data.message);
          return;
        }
          
        //return rider details fetched from api
        return data.riderDetails;
       }
    }
    catch(err){
       console.log(err);
    }
    finally{
      setLoading(false);
    }
  }

  //event handler for payment button 
  const handlePaymentClick = async ()=>{
          try{
              if(user && user.id && rideData){
                  setLoading(true);
                  //api to fetch current ride details
                  const res = await fetch("/api/getCurrentRide", {
                    method: "POST",
                    body: JSON.stringify({
                      userId: user.id,
                      role: "rider",
                    }),
                    headers: {"Content-Type": "application/json"}
                  });


                  const data = await res.json();
                  console.log(data.message);

                  if(res.status !== 200){
                    setError(data.message);
                    return;
                  }

                  if(data.currentRide){
                      if(data.currentRide.status === "ride ended"){
                          //api to get rider details if ride ended
                          const response = await getRiderDetails();

                          if(!response){
                            console.log("Could not fetch rider details");
                          }
                          else{
                              //store rider details in variable
                              const riderDetails: DocumentData = response as DocumentData;

                              //get rider email, name and phone number from rider details
                              const {emailAddress, fullName, phoneNumber} = riderDetails;
                    
                              //api to create payment order
                              const res = await fetch("/api/createPaymentOrder", {
                                method: "POST",
                                body: JSON.stringify({
                                  rideId: rideData.rideId,
                                  orderAmount: Number(rideData.estimatedFare),
                                  customerId: user.id,
                                  customerEmail: emailAddress,
                                  customerName: fullName,
                                  customerPhone: phoneNumber,
                                }),
                                headers: {"Content-Type": "application/json"}
                              });
        
                              const data = await res.json();
                              console.log(data.message);
        
                              if(res.status !== 200){
                                setError(data.message);
                                return;
                              }
                              
                              //store payment session id in state variable for use in checkout
                              if(data.paymentSessionId){
                                const sessionId: string = data.paymentSessionId;
                                setPaymentSessionId(sessionId);
                              }    
                          }
                      }
                      else{
                        console.log("The ride hasn't ended yet. You can make payment only when the ride ends");
                        setInfo("The ride hasn't ended yet. You can make payment only when the ride ends");
                      }
                    }
                    else{
                      console.log("Could not fetch current ride information");
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

  //display loading message if data not loaded   
  if(loading){
    return (
    <div className="w-full h-auto flex flex-col justify-start items-center space-y-6 px-6 py-8 bg-white rounded-md">
        <p className="tracking-wider">Loading</p>
    </div>
    )
  } 

  //display current ride details
  return (user && rideData && rideData.rideId) && (
    <div className="w-full h-auto flex flex-col justify-start items-center space-y-6 px-6 py-8 bg-white rounded-md">
      
        <p className="text-lg font-semibold tracking-wide">Your current Ride</p>
      
        <div className="current-ride-container">
        <p className="font-medium">Ride Accepted By {rideData.driverName?rideData.driverName:rideData.driverId}</p>
        <p className="font-medium text-gray-500 flex">Driver Phone: <span className="ml-4 text-black">{rideData.driverPhone}</span></p>
        <p className="font-medium text-gray-500 flex">Ride Start Time: <span className="ml-4 text-black">{convertToDateTime(rideData.startTime)}</span></p>
        <p className="font-medium text-gray-500 flex">Vehicle Number: <span className="ml-4 text-black">{rideData.vehicleNumber}</span></p>
        <p className="font-medium text-gray-500 flex">Vehicle Description: <span className="ml-4 text-black">{rideData.vehicleDescription}</span></p>
        <p className="font-medium text-gray-500 flex">Pickup: <span className="ml-4 text-black">{rideData.source.address}</span></p>
        <p className="font-medium text-gray-500 flex">Dropoff: <span className="ml-4 text-black">{rideData.destination.address}</span></p>
        <p className="font-medium text-gray-500 flex">Requested at: <span className="ml-4 text-black">{convertToDateTime(rideData.requestTime)}</span></p>
        <p className="font-medium text-gray-500 flex">Estimated Fare: <span className="ml-4 text-black">{rideData.estimatedFare}</span></p>
        </div>
        <div className="w-full h-[45px] flex justify-center items-center p-4 bg-black rounded-md hover:cursor-pointer hover:bg-gray-800">
          <button 
           type="button"
           onClick={handlePaymentClick}
           className="w-full h-full flex justify-center items-center rounded-md text-white hover:cursor-pointer"
           >
            Make Payment
          </button>
        </div>
        {/* redirect to checkout if order created and paymentSessionId received */}
        {paymentSessionId && (
                <Checkout paymentSessionId={paymentSessionId}/>
        )}
    </div>
  )
}

export default RiderCurrentRide;
