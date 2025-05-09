//api to end ride from driver dashboard
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function POST(req: Request){
    try{
        //get ride id from request body
        const {rideId} = await req.json();

        //update ride status to "ride ended" in database
        const rideDoc = await db.collection("rides").doc(rideId).set({
           status: "ride ended",
           data: {
            status: "ride ended",
           }
        }, {merge: true});

        //return with error message if ride status not updated 
        if(!rideDoc){
            return NextResponse.json({message: "Could not update ride end status"}, {status: 400});
        }

        //return with success message if ride status updated successfully
        return NextResponse.json({message: "Successfully updated ride end status"}, {status: 200});
    }
    catch(err){
        return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }
}