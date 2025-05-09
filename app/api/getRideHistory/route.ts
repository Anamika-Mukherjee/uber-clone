//api to fetch ride history for a rider or driver
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { DocumentData } from "firebase-admin/firestore";

export async function POST(req: Request){
    try{
        //get user id and user role from request body
        const {userId, role} =await req.json();
        
        //process for rider
        if(role === "rider"){
            //get all rides for the rider that have a status of "payment successful", i.e all completed rides
            const rideRef = await db.collection("rides")
                            .where("riderId", "==", userId)
                            .where("status", "==", "payment successful")
                            .get();
            
            //declare an array to store all completed rides                
            const rideHistory : DocumentData[] = [];
            
            //iterate over all the rides, get ride data and push into the declared array
            rideRef.forEach((ride)=>{
                const rideDetails: DocumentData = ride.data() as DocumentData;
                rideHistory.push(rideDetails);
            });

            //return with message if no past rides available
            if(!rideHistory || (rideHistory && !rideHistory.length)){
                return NextResponse.json({message: "You don't have any previous rides"}, {status: 200});
            }

            //return all past rides and success message if past rides available
            return NextResponse.json({message: "Successfully retrieved ride history", rideHistory}, {status: 200});
       }
       //process for rider
       else if(role === "driver"){
            
            //get all rides for the driver that have a status of "payment successful", i.e all completed rides
            const rideRef = await db.collection("rides")
                            .where("driverId", "==", userId)
                            .where("status", "==", "payment successful")
                            .get();
        
            //declare an array to store all completed rides   
            const rideHistory : DocumentData[] = [];
            
            //iterate over all the rides, get ride data and push into the declared array
            rideRef.forEach((ride)=>{
                const rideDetails: DocumentData = ride.data() as DocumentData;
                rideHistory.push(rideDetails);
            });

            //return with message if no past rides available
            if(!rideHistory || (rideHistory && !rideHistory.length)){
                return NextResponse.json({message: "You don't have any previous rides"}, {status: 200});
            }

            //return all past rides and success message if past rides available
            return NextResponse.json({message: "Successfully retrieved ride history", rideHistory}, {status: 200});
       }
       //return with error message if role value is other than rider or driver
       else{
            return NextResponse.json({message: "Invalid role value"}, {status: 400});
       }
    }
    catch(err){
        return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }
}