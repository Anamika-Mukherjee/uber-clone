//api to get rider details
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { DocumentData } from "firebase-admin/firestore";

export async function POST(req: Request){
    try{
        //get rider id from request body
        const {riderId} = await req.json();
        
        //fetch rider details from database through rider id
        const riderDocSnapshot = await db.collection("users").doc(riderId).get();

        //return with error message if rider details not fetched
        if(!riderDocSnapshot.exists){
          return NextResponse.json({message: "Could not fetch rider details"}, {status: 400});
        }

        //get rider document from snapshot
        const riderDetails: DocumentData = riderDocSnapshot.data() as DocumentData;
        
        //return rider details with success message if rider details fetched successfully
        return NextResponse.json({message: "Successfully fetched rider details", riderDetails}, {status: 200});
    }
    catch(err){
      return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }
}