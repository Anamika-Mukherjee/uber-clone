//api to fetch driver details
import { NextResponse } from "next/server";
import {db} from "@/lib/firebaseAdmin";
import { DocumentData } from "firebase-admin/firestore";

export async function POST(req: Request){
    try{
      //get driver id from request body
       const {driverId} = await req.json();

       //retrieve driver details from database
       const driverDocument = await db.collection("users").doc(driverId).get();

       //return with error message if driver does not exist in database
       if(!driverDocument){
        return NextResponse.json({message: "Driver document does not exist"}, {status: 400});
       }
       
       //retrieve driver data from document snapshot if driver details available
       const driverDetails = driverDocument.data() as DocumentData;

       //return driver details with success message if details retrieved successfully
       return NextResponse.json({message: "Successfully retrieved driver details", driverDetails}, {status: 200});
    }
    catch(err){
      return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }
}