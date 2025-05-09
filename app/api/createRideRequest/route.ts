//api to store ride request details in database
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue, DocumentData } from "firebase-admin/firestore";

export async function POST(req: Request){
    try{
       //get ride details from request body
       const {user, carOption, source, destination, estimatedFare} = await req.json();

       //fetch rider document from "users" table for the given rider id
       const rider = await db.collection("users").doc(user.id).get();

       //return with error message if rider does not exist
       if(!rider.exists){
        return NextResponse.json({message: "Could not fetch rider details"}, {status: 400})
       }

       //get rider data from snapshot
       const riderDoc: DocumentData = rider.data() as DocumentData;

       //get rider email, name and phone number from rider document
       const {emailAddress, fullName, phoneNumber} = riderDoc;

       //get car name from car option sent with request
       const {name} = carOption;

       //generate unique ride id
       const rideId = `ride_${user.id}_${Date.now()}`;

       //store ride details in "rides" collection in firestore database
       const rideRef = await db.collection("rides").doc(rideId).set({
         rideId,
         riderId: user.id,
         riderEmail: emailAddress,
         riderName: fullName,
         riderContactNumber: phoneNumber,
         requestTime: Date.now(),
         source: {
            address: source.label,
            latitude: source.lat,
            longitude: source.lng,
         },
         destination: {
            address: destination.label,
            latitude: destination.lat,
            longitude: destination.lng,
         },
         status: "requested", 
         rideOption: name,
         estimatedFare,
         totalFare: 0,
         startTime: null,
         endTime: null,
         driverId: null,
       });

       //return with error message if ride details not stored in database
       if(!rideRef){
        return NextResponse.json({message: "Error storing ride data"}, {status: 400});
       }

      //update "users" collection to store ride details
      await db.collection("users").doc(user.id).update({
         rides: FieldValue.arrayUnion({ 
                id: rideId,
                requestTime: Date.now(),
            }),
      })
       
      //fetch recently stored ride details from "rides" collection
      const rideDataRef = db.collection("rides").doc(rideId);
      const rideSnapshot = await rideDataRef.get();

      //return with error message if ride details not fetched successfully
      if(!rideSnapshot){
        return NextResponse.json({message: "Could not get ride details"}, {status: 400});
      }

      //get ride details data from snapshot
      const rideData: DocumentData = rideSnapshot.data() as DocumentData;

      //return ride details with success message if fetched successfully
      return NextResponse.json({message: "Ride data stored in database successfully", rideData}, {status: 200});

    }
    catch(err){
      return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }
}