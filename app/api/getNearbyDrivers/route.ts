//api to fetch driver details for all nearby drivers for a particular rider location based on a maximum distance
import { NextResponse } from "next/server";
import { DocumentData } from "firebase-admin/firestore";
import { db } from "@/lib/firebaseAdmin";

//haversine function to calculate distance between two latitude-longitude pairs 
const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {

  //radius of earth in kilometers
  const R = 6371; 

  //difference in latitude and longitude
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  //calculate distance
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  //distance in kms
  const distance = R * c; 

  //return distance
  return distance; 
};

export async function POST(req: Request){
    try{
        //get rider latitude-longitude and maximum distance from request body to fetch drivers
        const {riderLat, riderLng, maxDistance} = await req.json();

        //return with error message if rider latitude and longitude are not number types
        if (typeof riderLat !== "number" || typeof riderLng !== "number") {
          return NextResponse.json(
            { message: "Invalid latitude or longitude" },
            { status: 400 }
          );
        }

        //declare array to push nearby driver documents
        const nearbyDrivers: DocumentData[] = [];

        //get all driver documents snapshots from database
        const usersRef = db.collection("users");
        const querySnapshot = await usersRef.where("role", "==", "driver").get();
    
        //return with error if no driver document available
        if(!querySnapshot){
            return NextResponse.json({message: "Error fetching driver data", status: 400});
        }
      
        //iterate over driver document snapshot
        querySnapshot.forEach(driverSnapshot => {
            //get individual driver data from snapshot and store in a variable 
            const driver: DocumentData = driverSnapshot.data();

            if (typeof driver.driverLocation.lat === "number" && typeof driver.driverLocation.lng === "number") {
                //calculate driver distance from rider using haversine function
                const driverDistance = haversine(riderLat, riderLng, driver.driverLocation.lat, driver.driverLocation.lng);
                
                //if driver distance is less than maximum distance to fetch drivers, push driver details in array
                if (driverDistance <= maxDistance) {
                    nearbyDrivers.push(driver);
                }
            }
        });

        //return with message if no nearby drivers available within the given range
        if(!nearbyDrivers){
          return NextResponse.json({message: "No drivers available nearby"}, {status: 200});
        }

        //return driver details with success message if nearby drivers fetched successfully
        return NextResponse.json({message: "Successfully fetched nearby driver details", nearbyDrivers}, {status: 200});
    }
    catch(err){
        console.log(err);
        return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }
}