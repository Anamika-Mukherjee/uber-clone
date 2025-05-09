//component to display ride options when user enters source and destination addresses
"use client";
import React, {useContext, useEffect, useState} from "react";
import Image from "next/image";
import { carList } from "@/utils/carList";
import { useDistanceContext } from "@/context/DistanceContext";
import { useSourceContext } from "@/context/SourceContext";
import { useDestinationContext } from "@/context/DestinationContext";
import { HiUser } from "react-icons/hi";
import { useUser } from "@clerk/nextjs";
import { useRideLocationContext } from "@/context/RideLocationContext";
import { DocumentData } from "firebase-admin/firestore";
import { useErrorContext } from "@/context/ErrorContext";
import { useInfoContext } from "@/context/InfoContext";

//define type for ride option
interface CarOption{
  id: number;
  name: string;
  seat: number;
  desc: string;
  amount: number;
  image: string;
};

const CarListSection = () => {
  
  const [open, setOpen] = useState<boolean>(true);
  const {distance} = useDistanceContext();
  const {source} = useSourceContext();
  const {destination} = useDestinationContext();
  const [activeOption, setActiveOption] = useState<CarOption | null>(null);
  const {user} = useUser();
  const [estimatedFare, setEstimatedFare] = useState<number>(0);
  const {setError} = useErrorContext();
  const {setInfo} = useInfoContext();
  const {setRideLocation} = useRideLocationContext();
  const [loading, setLoading] = useState<boolean>(false);

  //set maximum distance in kms to fetch drivers for a particular rider location
  const maxDistance = 3000;

  //function to send ride request notification to all nearby drivers
  const sendRideRequest = async (driverId: string, token: string, rideId: string, riderName: string)=>{
    try{
      if(user && user.id){
        setLoading(true);
        //api request to send notification to all nearby drivers
        const response = await fetch("/api/sendNotification", {
          method: "POST",
          body: JSON.stringify({  
            token,
            data: {
              title: "New Ride Request",
              body: `Customer Name: ${riderName}, Pickup: ${source.label}, Dropoff: ${destination.label}, Fare: ${estimatedFare}`,
              type: "RIDE_REQUEST",
              rideId,
              senderId: user.id,
              receiverId: driverId,
              riderName,
              requestTime: Date.now(),
              pickupLat: source.lat,
              pickupLng: source.lng,
              dropoffLat: destination.lat,
              dropoffLng: destination.lng,
              fare: estimatedFare,
              status: "requested",
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
        //return response if successful 
        return data; 
      }
    }
    catch(err){
      console.log(err);
    }
    finally{
      setLoading(false);
    }
  }

  //function to fetch driver fcm tokens
  const getDriverTokens = async (driverIds: string[])=>{
    try{
      setLoading(true);
      //api request to fetch driver fcm token from server
      const response = await fetch("/api/getDriverToken", {
        method: "POST",
        body: JSON.stringify({
          driverIds 
        }),
        headers: {"Content-Type": "application/json"}
      });

      const data = await response.json();
      console.log(data.message);

      if(response.status !== 200){
        setError(data.message);
        return;
      }
      
      //return driver id and tokens 
      if(data.driverIdTokens){
        return data.driverIdTokens;
      }
      
    }
    catch(err){
      console.log(err);
    }
    finally{
      setLoading(false);
    }
  }

  //function to fetch details about all nearby drivers
  const fetchNearbyRides = async ()=>{
    try{
      setLoading(true);
      //api request to get all nearby driver details
      const response = await fetch("/api/getNearbyDrivers", {
        method: "POST",
        body: JSON.stringify({
          riderLat: source.lat,
          riderLng: source.lng,
          maxDistance,
        }),
        headers: {"Content-Type": "application/json"}
      });

      const data = await response.json();
      console.log(data.message);

      if(response.status !== 200){
        setError(data.message); 
        return;
      }
      
      //return response
      return data;

    }
    catch(err){
      console.log(err);
    } 
    finally{
      setLoading(false);
    }  
  }

  //function to store ride request details in database
  const storeRequestDetails = async (carOption: CarOption)=>{
    try{
      setLoading(true);
      //api to store ride request details in database
      const response = await fetch("/api/createRideRequest", {
       method: "POST",
       body: JSON.stringify({
         user,
         carOption,
         source,
         destination,
         estimatedFare,
       }),
       headers: {"Content-Type": "application/json"}
      });

      const data = await response.json();
      console.log(data.message);

      if(response.status !== 200){
        setError(data.message);
        return;
      } 
      //return ride details from response
      if(data.rideData){
        return data.rideData;
      }
    }
    catch(err){
      console.log(err);
    }
    finally{
      setLoading(false);
    }
  }

  //event handler for ride option button click
  const handleOptionClick = (carOption: CarOption, fare: number)=>{
      setActiveOption(carOption);
      //store estimated fare in state variable
      setEstimatedFare(fare);
  }

  //event handler for ride request button click
  const handleRequestClick = async (carOption: CarOption) =>{
      //function to call api to store ride request details in server
      const response = await storeRequestDetails(carOption);
      
      //proceed if response received
      if(response){
        //get ride details from response and store in a variable
        const rideData: DocumentData = response;
        //get ride id and rider name from ride details
        const { rideId, riderName } = rideData;   
      
        //function to call api to fetch all nearby driver details 
        const res = await fetchNearbyRides();

        //proceed if nearby driver details fetched successfully
        if(res && res.nearbyDrivers){
            //store nearby driver details in array
            const nearbyDrivers: DocumentData[] = res.nearbyDrivers as DocumentData[];

            //declare array to store driver id and location
            let availableRides: RideInterface[] = [];

            //map through all nearby driver details
            nearbyDrivers.map((nearbyDriver: DocumentData)=>{

              //get driver id and location from individual driver detail
              const {id, driverLocation} = nearbyDriver;

              //get latitude and longitude from driver location
              const {lat, lng} = driverLocation;

              //store driver id and location in an array
              const nearbyRide: RideInterface = {driverId: id, lat, lng};

              //push driver id and location in array declared earlier
              availableRides.push(nearbyRide);
            })
            
            //store all nearby driver ids and locations in array state
            setRideLocation(availableRides); 

            //store driver ids in a separate array
            const nearbyDriverIds: string[] = availableRides.map((ride)=>ride.driverId);

            //function to call api to fetch driver ids and tokens for all nearby drivers
            const responseData = await getDriverTokens(nearbyDriverIds); 
             
            //proceed if driver ids and tokens fetched successfully
            if(responseData){
              //store driver ids and tokens in a variable
              const driverIdTokens : [{driverId: string, token: string}]= responseData;

              //proceed if data available
              if(driverIdTokens && driverIdTokens.length){

                //map through all driver details to send ride request to all nearby drivers
                const sendRequestToAll = driverIdTokens.map(async (driverIdToken: {driverId: string, token: string})=>{
                  //get driver id and token from the given driver details
                  const {driverId, token} = driverIdToken;

                  //function to call api to send ride request to the given driver
                  const reqResponse = await sendRideRequest(driverId, token, rideId, riderName);

                  //display message if could not send ride request
                  if(!reqResponse){
                    console.log("Could not send ride request");
                    setInfo("Could not send ride request")
                  }
                });
  
                //wait for all ride requests to complete
                await Promise.all(sendRequestToAll);

                //display message if request sent to all nearby drivers
                console.log("Request sent to all nearby drivers");
                setInfo("Request sent to all nearby drivers");
                setOpen(false); 
              }  
            }            
        }
        else{ 
          console.log("Error fetching nearby drivers");
          setError("Error fetching nearby drivers");
          return;
        }
      }
      else{
        console.log("Error storing ride details");
        setError("Error storing ride details");
        return;
      }
  }

  //display loading message if data not loaded   
  if(loading){
    return (
    <div className="car-list-section">
        <p className="tracking-wider">Loading</p>
    </div>
    )
  } 

  //display ride options
  return open && (
    <div className="car-list-section">
        <h2 className="text-lg font-semibold tracking-wider">Recommended</h2>
        <div className="car-list-container">
        {carList.map((carOption)=>{
          const fare = parseFloat((carOption.amount * distance).toFixed(2));
          return (
            <div 
            key={carOption.id}
            className={activeOption && activeOption.id === carOption.id?"active-car-option":"car-option"}
            onClick={()=>handleOptionClick(carOption, fare)}
            >
              <Image 
               src={carOption.image}
               alt="car option"
               width={100}
               height={100}
               className="rounded-md px-2"
              />
              <div className="ride-detail-card">
                  <div className="w-4/5 h-auto flex flex-col justify-center items-start">
                    <p className="font-medium text-base text-gray-800 tracking-wide">{carOption.name}</p>
                    <p className="font-normal text-xs text-gray-600 tracking-wide">{carOption.desc}</p>
                    
                    <div className="flex justify-start items-center w-full h-[20px]">
                      <HiUser width={15} height={15} className="flex justify-center items-center fill-gray-600 mr-1"/>
                        <span className="w-[10px] h-[15px] text-xs font-semibold text-gray-800 flex justify-center items-center text-center">{carOption.seat}</span>
                    </div>
                  </div>
                  <p className="font-semibold text-sm tracking-wide text-gray-700"> &#8377;{fare}</p>
              </div>
            </div>
          )
        })}
        </div>
        {activeOption && (
          <div className="w-full h-[100px] flex justify-center items-center">
            <button 
            type="button"
            className="ride-request-button"
            onClick = {()=>handleRequestClick(activeOption)}
            >
              Request {activeOption.name}
            </button>
          </div>
        )}
    </div>
  );
}

export default CarListSection;
