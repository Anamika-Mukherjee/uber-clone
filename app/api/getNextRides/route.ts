//api to fetch upcoming rides for rider and driver
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { DocumentData } from "firebase-admin/firestore";

export async function POST(req: Request){
    try{
        //store request body in a variable and get user role from request body
        const requestBody = await req.json();
        const {role} = requestBody;

        //process for rider 
        if(role === "rider"){
            //get rider id from request body
            const {riderId} = requestBody;

            //get ride details for the given rider id where status is "accepted" (only fetch those rides which are accepted by some driver)
            const rideSnapshot = await db.collection("rides")
            .where("riderId", "==", riderId)
            .where("status", "==", "accepted")
            .get();

            //return with message if no upcoming rides available for the given rider
            if(!rideSnapshot){
                return NextResponse.json({message: "Could not fetch upcoming rides for the rider"}, {status: 200})
            }

            //declare array to store upcoming ride details
            const upcomingRides : DocumentData[] = [];

            //iterate over query snapshot, get data for each ride and push it into the declared array 
            rideSnapshot.forEach((ride)=>{
                const nextRide: DocumentData = ride.data() as DocumentData;
                upcomingRides.push(nextRide);
            });

            //return with message if no upcoming rides available for the given rider
            if(!upcomingRides.length){
                return NextResponse.json({message: "You don't have any upcoming rides"}, {status: 200});
            }

            //return upcoming rides with success message if rides fetched successfully
            return NextResponse.json({message: "Successfully retrieved upcoming rides for rider", upcomingRides}, {status: 200});
        }
        //process for driver 
        else if(role === "driver"){
            //get driver id from request body
            const {driverId} = requestBody;

            //get ride details for the given driver id where status is "accepted" (only fetch those rides which are accepted by the driver)
            const rideSnapshot = await db.collection("rides")
            .where("driverId", "==", driverId)
            .where("status", "==", "accepted")
            .get();

            //return with message if no upcoming rides available for the given driver
            if(!rideSnapshot){
                return NextResponse.json({message: "Could not fetch upcoming rides for the driver"}, {status: 200})
            }
    
            //declare array to store upcoming ride details
            const upcomingRides : DocumentData[] = [];

            //iterate over query snapshot, get data for each ride and push it into the declared array 
            rideSnapshot.forEach((ride)=>{
                const nextRide: DocumentData = ride.data() as DocumentData;
                upcomingRides.push(nextRide);
            });
    
            //return with message if no upcoming rides available for the given driver
            if(!upcomingRides.length){
                return NextResponse.json({message: "You don't have any upcoming rides"}, {status: 200});
            }

            //return upcoming rides with success message if rides fetched successfully
            return NextResponse.json({message: "Successfully retrieved upcoming rides for driver", upcomingRides}, {status: 200});
        }
    }
    catch(err){
        return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }
}