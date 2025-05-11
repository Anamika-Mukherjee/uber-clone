//card component to display individual ride details for past rides
"use client";
import { useErrorContext } from "@/context/ErrorContext";
import { convertToDateTime } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { DocumentData } from "firebase-admin/firestore";
import React, { useEffect, useState } from "react";

const RideHistoryCard = ({ride, role}:{ride: DocumentData, role: string}) => {
    const {user} = useUser();
    const {setError} = useErrorContext();
    const [paymentDetails, setPaymentDetails] = useState<DocumentData>();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(()=>{
       if(ride && ride.paymentOrderId){
        try{
          const fetchPaymentDetails = async ()=>{
            if(user && user.id){
                setLoading(true);
                //api request to get payment details for given ride from server
                const response = await fetch("/api/getPaymentDetails", {
                    method: "POST",
                    body: JSON.stringify({
                        orderId: ride.paymentOrderId,
                        customerId: user.id
                    }),
                    headers: {"Content-Type": "application/json"}
                });

                const data = await response.json();
                console.log(data.message);

                if(response.status !== 200){
                    setError(data.message);
                    return;
                }
                
                if(data.paymentDetails){
                    //store payment details in a variable
                    setPaymentDetails(data.paymentDetails); 
                }
            }
            
          }
          fetchPaymentDetails();
        }
        catch(err){
            console.log(err);
        }
        finally{
            setLoading(false);
        }
       }
    }, [ride]);

    //display loading message if data not loaded   
    if(loading){
        return (
        <div className="w-screen h-screen flex flex-col justify-center items-center p-4">
            <p className="tracking-wider">Loading</p>
        </div>
        )
    }   

    //display details for rider
    if(role === "rider"){
        return (
            <div className="w-full h-full flex flex-col justify-start items-start space-y-2 tracking-wide text-sm bg-white">
                <div className="w-full h-auto flex justify-start items-start space-x-16">
                    <p className="text-gray-500">Ride Date: </p>
                    <p>{convertToDateTime(ride.requestTime)}</p>
                </div>
                <div className="w-full h-auto flex justify-start items-start space-x-22">
                    <p className="text-gray-500">Pickup: </p>
                    <p>{ride.source.address}</p>
                </div>
                <div className="w-full h-auto flex justify-start items-start space-x-20">
                    <p className="text-gray-500">Dropoff: </p>
                    <p>{ride.destination.address}</p>
                </div>
                <div className="w-full h-auto flex justify-start items-start space-x-11">
                    <p className="text-gray-500">Driver Name: </p>
                    <p>{ride.driverName}</p>
                </div>
                <div className="w-full h-auto flex justify-start items-start space-x-4">
                    <p className="text-gray-500">Vehicle Number:  </p>
                    <p>{ride.vehicleNumber}</p>
                </div>
                <div className="w-full h-auto flex justify-start items-start space-x-13">
                    <p className="text-gray-500">Ride Status: </p>
                    <p>{ride.status}</p>
                </div>
                {ride.status === "payment successful" && paymentDetails && (
                    <div className="w-1/2 h-auto flex flex-col justify-start items-start space-y-4 ">
                        <p className="font-semibold">Payment Details:</p>
                        <div className="w-full h-auto flex flex-col justify-start items-start space-y-2 ml-10">           
                            <div className="w-full h-auto flex justify-start items-start space-x-21">
                                <p className="text-gray-500">Order Id: </p>
                                <p>{paymentDetails.orderId}</p>
                            </div>
                            <div className="w-full h-auto flex justify-start items-start space-x-15">
                                <p className="text-gray-500">Payment Id: </p>
                                <p>{paymentDetails.paymentId}</p>
                            </div>
                            <div className="w-full h-auto flex justify-start items-start space-x-12">
                                <p className="text-gray-500">Amount Paid: </p>
                                <p>{paymentDetails.amount}</p>
                            </div>
                            <div className="w-full h-auto flex justify-start items-start space-x-5">
                                <p className="text-gray-500">Payment Method: </p>
                                <p>{Object.keys(paymentDetails.paymentMethod)[0]}</p>
                            </div>
                            <div className="w-full h-auto flex justify-start items-start space-x-10">
                                <p className="text-gray-500">Payment Date: </p>
                                <p>{convertToDateTime(paymentDetails.time)}</p>
                            </div>
                        </div>
                    </div>
                   
                )}
            </div>
        )
    }
    //display details for driver
    else{
        return (
            <div className="w-full h-full flex flex-col justify-start items-start space-y-2 tracking-wide text-sm ">
                <div className="w-full h-auto flex justify-start items-start space-x-16">
                    <p className="text-gray-500">Ride Date: </p>
                    <p>{convertToDateTime(ride.requestTime)}</p>
                </div>
                <div className="w-full h-auto flex justify-start items-start space-x-22">
                    <p className="text-gray-500">Pickup: </p>
                    <p>{ride.source.address}</p>
                </div>
                <div className="w-full h-auto flex justify-start items-start space-x-20">
                    <p className="text-gray-500">Dropoff: </p>
                    <p>{ride.destination.address}</p>
                </div>
                <div className="w-full h-auto flex justify-start items-start space-x-11">
                    <p className="text-gray-500">Rider Name: </p>
                    <p>{ride.riderName}</p>
                </div>
                <div className="w-full h-auto flex justify-start items-start space-x-4">
                    <p className="text-gray-500">Rider Contact Number:  </p>
                    <p>{ride.riderContactNumber}</p>
                </div>
                <div className="w-full h-auto flex justify-start items-start space-x-13">
                    <p className="text-gray-500">Ride Status: </p>
                    <p>{ride.status}</p>
                </div>
                {ride.status === "payment successful" && paymentDetails && (
                    <div className="w-1/2 h-auto flex flex-col justify-start items-start space-y-4 ">
                        <p className="font-semibold">Payment Details:</p>
                        <div className="w-full h-auto flex flex-col justify-start items-start space-y-2 ml-10">           
                            <div className="w-full h-auto flex justify-start items-start space-x-21">
                                <p className="text-gray-500">Order Id: </p>
                                <p>{paymentDetails.orderId}</p>
                            </div>
                            <div className="w-full h-auto flex justify-start items-start space-x-15">
                                <p className="text-gray-500">Payment Id: </p>
                                <p>{paymentDetails.paymentId}</p>
                            </div>
                            <div className="w-full h-auto flex justify-start items-start space-x-12">
                                <p className="text-gray-500">Amount Paid: </p>
                                <p>{paymentDetails.amount}</p>
                            </div>
                            <div className="w-full h-auto flex justify-start items-start space-x-5">
                                <p className="text-gray-500">Payment Method: </p>
                                <p>{Object.keys(paymentDetails.paymentMethod)[0]}</p>
                            </div>
                            <div className="w-full h-auto flex justify-start items-start space-x-10">
                                <p className="text-gray-500">Payment Date: </p>
                                <p>{convertToDateTime(paymentDetails.time)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }
    
}

export default RideHistoryCard;
