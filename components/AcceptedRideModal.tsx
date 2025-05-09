//modal component to display accepted ride details in driver dashboard
"use client";
import { DocumentData } from "firebase-admin/firestore"
import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
import { convertToDateTime } from "@/lib/utils";
import { useErrorContext } from "@/context/ErrorContext";
import { useInfoContext } from "@/context/InfoContext";

interface AcceptModalProps{
    ride: DocumentData;
    openModal: boolean;
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const AcceptedRideModal = ({ride, openModal, setOpenModal}:AcceptModalProps) => {
    const [openOtpModal, setOpenOtpModal] = useState<boolean>(false);
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const {setError} = useErrorContext();
    const {setInfo} = useInfoContext();
    const [loading, setLoading] = useState<boolean>(false);

    //open otp modal when "Start Ride" button is clicked  
    const handleStartClick = (e: React.MouseEvent)=>{
        e.preventDefault();
        setOpenOtpModal(true);
    }

    //event handler to change input values in otp modal  
    const handleChange = (value: string, index: number)=>{
        //return if input is not a number  
        if (!/^\d?$/.test(value)) return;

        //store the new input digit with the previous entered digits in array  
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        //automatically shift cursor to next input field when current input is entered for initial 5 digits 
        if(value && index<5){
            const next = document.getElementById(`otp${index+1}`);
            (next as HTMLInputElement)?.focus();
        }
        //if last digit, blur the current input  
        else if(value && index===5){
            const currentInput = document.getElementById(`otp${index}`);
            (currentInput as HTMLInputElement)?.blur();
        }    
    }

    //event handler for "Verify OTP" button  
    const handleVerifyClick = async ()=>{
            try{
                setLoading(true);
                //convert otp array into string form
                const finalOtp = String(otp.join("")); 
                
                //api to start ride
                const response = await fetch("/api/startRide", {
                    method: "POST",
                    body: JSON.stringify({
                    otp: finalOtp,
                    rideId: ride.rideId,
                    }),
                    headers: {"Content-Type": "application/json"}
                });

                const data = await response.json();
                console.log(data.message);

                if(response.status !== 200){
                    setError(data.message);
                    return;
                }
              
                setInfo("Ride started successfully");

                //close accepted ride modal and otp modal
                setOpenModal(false);
                setOpenOtpModal(false);
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
    <div className="w-[600px] min-h-[200px] h-auto flex flex-col justify-center items-center space-y-6 px-8">
        <p className="tracking-wider">Loading</p>
    </div>
    )
 }  

  //display accepted ride modal  
  return (
    <>
            <Dialog open={openModal} onOpenChange={setOpenModal}>
                {/* display ride details in "accepted ride" modal */}
                {(!openOtpModal) &&(
                    <DialogContent className="w-[600px] min-h-[200px] h-auto flex flex-col justify-center items-center space-y-6 px-8">
                    <DialogHeader className="w-full h-auto flex flex-col justify-start items-start space-y-6">
                        <DialogTitle className="font-medium">Customer Name: {ride.riderName}</DialogTitle>
                    </DialogHeader>
                    <div className="w-full h-auto flex flex-col justify-start items-start space-y-4">
                        <p className="font-medium text-gray-500 flex">Pickup: <span className="ml-4 text-black">{ride.source.address}</span></p>
                        <p className="font-medium text-gray-500 flex">Dropoff: <span className="ml-4 text-black">{ride.destination.address}</span></p>
                        <p className="font-medium text-gray-500 flex">Request Time: <span className="ml-4 text-black">{convertToDateTime(ride.requestTime)}</span></p>
                        <p className="font-medium text-gray-500 flex">Fare: <span  className="ml-4 text-black">&#8377;{ride.estimatedFare}</span></p>
                    </div>
                    <div className="w-full h-[45px] flex justify-center items-center bg-black p-4 rounded-md  tracking-wide hover:cursor-pointer hover:bg-gray-800">
                        <button
                        type="button"
                        onClick={handleStartClick}
                        className="w-full h-full flex justify-center items-center rounded-md text-white hover:cursor-pointer outline-none"
                        >
                        Start Ride
                        </button>
                    </div>
                    
                    </DialogContent> 
                )}
                 {/*display otp modal */}
                {openOtpModal &&(
                    <DialogContent className="w-[600px] min-h-[200px] h-auto flex flex-col justify-center items-center space-y-6 px-8">
                        <DialogHeader className="w-full h-auto flex flex-col justify-start items-start space-y-6">
                            <DialogTitle className="font-medium">Enter Otp</DialogTitle>
                        </DialogHeader>
                        <div className="w-full h-[60px] flex justify-evenly items-center">
                            
                            <input 
                                type="text" 
                                id="otp0"
                                onChange={(e)=>handleChange(e.target.value, 0)}
                                maxLength={1} 
                                className="w-[50px] h-[50px] border border-black text-xl text-center"
                             />
                            <input 
                                type="text" 
                                id="otp1"
                                onChange={(e)=>handleChange(e.target.value, 1)}
                                maxLength={1}  
                                className="w-[50px] h-[50px] border border-black text-xl text-center"
                            />
                            <input 
                                type="text" 
                                id="otp2"
                                onChange={(e)=>handleChange(e.target.value, 2)}
                                maxLength={1}  
                                className="w-[50px] h-[50px] border border-black text-xl text-center"
                             />
                            <input 
                                type="text" 
                                id="otp3" 
                                onChange={(e)=>handleChange(e.target.value, 3)}
                                maxLength={1} 
                                className="w-[50px] h-[50px] border border-black text-xl text-center"
                            />
                            <input 
                                type="text" 
                                id="otp4"
                                onChange={(e)=>handleChange(e.target.value, 4)}
                                maxLength={1} 
                                className="w-[50px] h-[50px] border border-black text-xl text-center"
                            />
                            <input 
                                type="text" 
                                id="otp5" 
                                onChange={(e)=>handleChange(e.target.value, 5)}
                                maxLength={1} 
                                className="w-[50px] h-[50px] border border-black text-xl text-center"
                            />
                        </div>
                        <div className="w-full h-[45px] flex justify-center items-center bg-black p-4 rounded-md  tracking-wide hover:cursor-pointer hover:bg-gray-800">
                            <button
                                type="button"
                                onClick={handleVerifyClick}
                                className="w-full h-full flex justify-center items-center rounded-md text-white hover:cursor-pointer outline-none"
                            >
                                Verify OTP
                            </button>
                        </div>    
                    </DialogContent> 
                )}
            </Dialog>           
    </>
  )
}

export default AcceptedRideModal;
