//api to fetch current ride details for rider and driver
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { DocumentData } from "firebase-admin/firestore";

export async function POST(req: Request){
    try{
       //get user id and user role from request body 
       const {userId, role} = await req.json();

       //process for rider
       if(role === "rider"){
            //get ride details for current ride (only those rides which have started or ended but payment not made)
            const rideSnapshot = await db.collection("rides")
                                .where("riderId", "==", userId)
                                .where("status", "in", ["ride started", "ride ended"])
                                .limit(1)
                                .get();

            //return with message if no current ride available for the rider                    
            if(!rideSnapshot){
                return NextResponse.json({message: "Rider not having any ongoing ride"}, {status: 200});
            }

            //declare array to store ride details
            let presentRide: DocumentData = [];

            //iterate over query snapshot, get ride details and push into array
            rideSnapshot.forEach((ride)=>{
                const ongoingRide: DocumentData = ride.data() as DocumentData;
                presentRide.push(ongoingRide);
            });

            //store first ride data in a variable
            const currentRide = presentRide[0];

            //return current ride data with success message
            return NextResponse.json({message: "Successfully fetched current ride details for the rider", currentRide}, {status: 200});
       }
       //process for driver
       else if(role === "driver"){
            //get ride details for current ride (only those rides which have started or ended but payment not made)
            const rideSnapshot = await db.collection("rides")
            .where("driverId", "==", userId)
            .where("status", "==", "ride started")
            .limit(1)
            .get();

            //return with message if no current ride available for the driver
            if(!rideSnapshot){
                return NextResponse.json({message: "Driver not having any ongoing ride"}, {status: 200});
            }

            //declare array to store ride details
            let presentRide: DocumentData = [];

            //iterate over query snapshot, get ride details and push into array
            rideSnapshot.forEach((ride)=>{
                const ongoingRide: DocumentData = ride.data() as DocumentData;
                presentRide.push(ongoingRide);
            });

            //store first ride data in a variable
            const currentRide = presentRide[0];

            //return current ride data with success message
            return NextResponse.json({message: "Successfully fetched current ride details for the rider", currentRide}, {status: 200});
       }
    }
    catch(err){
        return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }
}