//component to display dialog box for notification details
"use client";
import React, {useState,useEffect} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { DocumentData } from "firebase-admin/firestore";
import { useUser } from "@clerk/nextjs";
import Checkout from "./Checkout";
import { useErrorContext } from "@/context/ErrorContext";
import { useInfoContext } from "@/context/InfoContext";
  
interface MessageDialogProps{
    notification: DocumentData;
    openDialog: boolean;
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const MessageDialog = ({notification, openDialog, setOpenDialog}: MessageDialogProps) => {
    
    const {user} = useUser();
    const [riderId, setRiderId] = useState<string>("");
    const [driverData, setDriverData] = useState<DocumentData>();
    const {setError} = useErrorContext();
    const {setInfo} = useInfoContext();
    const [loading, setLoading] = useState<boolean>(false);
    const [isAcceptClicked, setIsAcceptClicked] = useState<boolean>(false);

    useEffect(()=>{
        //process for driver role
        if(user && user.id && user.publicMetadata.role === "driver"){
            const fetchDriverDetails = async()=>{
              try{
                setLoading(true);
                //api to fetch driver details from server
                const response = await fetch("/api/getDriverDetails", {
                method: "POST",
                body: JSON.stringify({
                  driverId: user.id,
                }),
                headers: {"Content-Type": "application/json"}
                });

                const data = await response.json();
                console.log(data.message);

                if(response.status !== 200){
                  setError(data.message);
                  return;
                } 
                
                //retrieve driver details from api response and store in state variable
                const driverDocument = data.driverDetails;
                setDriverData(driverDocument);
              
              }
              catch(err){
                console.log(err);
              }
              finally{
                setLoading(false);
              }
            };
            fetchDriverDetails();
        }  
          
      }, [user]);

    useEffect(()=>{
        if(notification){
          //retrieve rider id from notification details and store in a variable
          const riderUserId = notification.data.senderId;
          setRiderId(riderUserId);
        }
    }, [notification]);

    //event handler for "accept" button click (in driver notifications page)
    const handleAcceptClick = async ()=>{
      try{
        if(user && user.id && driverData && notification && user.publicMetadata.role === "driver"){
          //close message dialog when accept button clicked
          setOpenDialog(false);
          //set state variable to true to make sure accept button only appears for unaccepted requests
          setIsAcceptClicked(true);
          setLoading(true);
          //api to get rider's firebase cloud messaging (fcm) token to send acception request to rider
          const res = await fetch("/api/getMessageToken", {
            method: "POST",
            body: JSON.stringify({
              riderId,
              tokenType: "rider",
            }),
            headers: {"Content-Type": "application/json"}
          });
  
          const riderData = await res.json();
          console.log(riderData.message);

          if(res.status !== 200){
            setError(riderData.message);
            return;
          }
  
          //store rider token in a variable  
          const riderToken = riderData.riderToken;

          //api request to send notification to rider for accepting ride request
          const response = await fetch("/api/acceptRideRequest", {
            method: "POST",
            body: JSON.stringify({
              token: riderToken,
              data: {
                title: "Ride Request Accepted",
                body: `${driverData.fullName} with vehicle number ${driverData.vehicleNumber} accepted your ride request`,
                type: "RIDE_ACCEPTION",
                rideId: notification.data.rideId,
                receiverId: riderId,
                senderId: user.id,
                driverName: driverData.fullName,
                driverPhone: driverData.phoneNumber,
                vehicleNumber: driverData.vehicleNumber,
                driverLat: driverData.driverLocation.lat,
                driverLng: driverData.driverLocation.lng,
                estimatedFare: notification.data.estimatedFare,
                requestStatus: "accepted",
                requestTime: Date.now(),
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
          
          setInfo(data.message);       
        }
      }
      catch(err){
        console.log(err);
      } 
      finally{
        setLoading(false);
      } 
    };

    //display loading if data not loaded
    if(loading){
      return(
          <div className="w-[600px] min-h-[200px] h-auto flex flex-col justify-center items-center space-y-6 px-8">
              <p className="tracking-wide">
                  Loading...
              </p>
          </div>
      )
    }

    return (
          <div>
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogContent className="w-[600px] min-h-[200px] h-auto flex flex-col justify-center items-center space-y-6 px-8">
                      <DialogHeader className="w-full h-auto flex flex-col justify-start items-start space-y-6">
                      <DialogTitle>{notification.data.title}</DialogTitle>
                      <DialogDescription className="text-justify">
                          {notification.data.body}
                      </DialogDescription>
                      </DialogHeader>
                      {user && user.publicMetadata.role === "rider" && (
                        <div className="w-full h-auto flex flex-col justify-start items-start space-y-1">
                          <p>Driver Name: {notification.data.driverName}</p>
                          <p>Driver Phone: {notification.data.driverPhone}</p>
                          <p>OTP: {notification.data.rideStartOtp}</p>
                          <p>Vehicle Number: {notification.data.vehicleNumber}</p>
                        </div>
                      )}
                      {user && user.publicMetadata.role === "driver" && !isAcceptClicked && notification.data.type === "RIDE_REQUEST" &&(
                          <div className="w-full h-[40px] bg-black text-white rounded-md hover:cursor-pointer hover:bg-gray-800">
                          <button 
                          type="button" 
                          className="w-full h-full hover:cursor-pointer rounded-md" 
                          onClick={handleAcceptClick}
                          >
                              Accept
                          </button>
                          </div>
                      )
                      } 
                  </DialogContent>
              </Dialog>
          </div>
    )
}

export default MessageDialog;
