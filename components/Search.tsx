//component to display search section for rides
"use client";
import React from "react";
import Image from "next/image";
import GoogleAutoComplete from "./GoogleAutoComplete";
import { useSourceContext } from "@/context/SourceContext";
import { useDestinationContext } from "@/context/DestinationContext";
import { useDistanceContext } from "@/context/DistanceContext";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const Search = () => {

    const {source} = useSourceContext();
    const {destination} = useDestinationContext();
    const {setDistance} = useDistanceContext();
    const {user} = useUser();
    const router = useRouter();
    
    //define objects to store source and destination input attribute values to be passed as props 
    const sourceInput = {
      input: "source",
      placeHolder: "Pickup Location"
    }

    const destinationInput = {
      input: "destination",
      placeHolder: "Dropoff Location"
    }

    //function to calculate distance between source and destination 
    const calculateDistance = ()=>{
      //if user signed in and role is rider, proceed
      if(user && user.publicMetadata.role === "rider"){
        //get source and destination latitude and longitude and store in variables
        const sourceLatLng = new google.maps.LatLng(source.lat, source.lng);
        const destinationLatLng = new google.maps.LatLng(destination.lat, destination.lng);
    
        //calculate distance between source and destination through google maps method
        const dist = google.maps.geometry.spherical.computeDistanceBetween(
            sourceLatLng,
            destinationLatLng
        );
    
        //calculate distance in kms and store in state variable
        let distInKms = dist * 0.001;
        distInKms = parseFloat(distInKms.toFixed(2));
        setDistance(distInKms);
      }
      else{
        //if role is driver or user is not authenticated, redirect to sign in page
          router.push("/signin");
      }  
    }

    //display search section
    return (
        
        <div className="search-box">
            <h3 className="search-heading">
                Get a Ride
            </h3>
            <div className="search-form">
                <div className="search-input-container">
                  <div className="search-input">
                    <Image
                      src="/assets/source.png"
                      alt="source"
                      width={15}
                      height={15}
                      className="w-[15px] h-[15px]"
                    />
                    <GoogleAutoComplete inputType = {sourceInput}/>
                  </div> 
                  <div className="search-input">
                    <Image
                      src="/assets/destination.png"
                      alt="destination"
                      width={15}
                      height={15}
                      className='w-[15px] h-[15px]'
                    />
                    <GoogleAutoComplete inputType = {destinationInput}/>
                  </div>
                </div>
                <div className="search-button-container">
                  <button 
                  type="button"
                  className="search-button"
                  onClick = {calculateDistance}
                  >
                    Search
                  </button>
                </div>
            </div>
        </div>
    )
}

export default Search;
