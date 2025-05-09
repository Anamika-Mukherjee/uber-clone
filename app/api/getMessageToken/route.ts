//api to get fcm token for rider and driver to send real time messages
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function POST(req: Request){
    try{
      //store request body in a variable and get token type based on role from request body 
      const requestBody = await req.json();
      const {tokenType} = requestBody;

      //if token type is rider or driver, continue
      if(tokenType === "rider" || tokenType === "driver"){
        //process for rider token
        if(tokenType === "rider"){
          //get rider id from request body
          const {riderId} = requestBody;
  
          //fetch rider token document from tokens collection in database
          const riderDoc = await db.collection("tokens").doc(riderId).get();
  
          //return with error message if rider token document not available
          if(!riderDoc){
            return NextResponse.json({message: "Rider Document not available"}, {status: 404});
          }
          
          //extract fcm token from rider token document
          const riderToken: string = await riderDoc.get("fcmToken");
    
          //return rider token with success message if token fetched successfully
          return NextResponse.json({message: "Successfully fetched rider token", riderToken}, {status: 200});
        }
  
        //process for driver token
        else if(tokenType === "driver"){
          //get driver id from request body
          const {driverId} = requestBody;
          
          //fetch driver token document from tokens collection in database
          const driverDoc = await db.collection("tokens").doc(driverId).get();
  
          //return with error message if driver token document not available
          if(!driverDoc){
            return NextResponse.json({message: "Driver Document not available"}, {status: 404});
          }
  
          //extract fcm token from driver token document
          const driverToken: string = await driverDoc.get("fcmToken");
    
          //return driver token with success message if token fetched successfully
          return NextResponse.json({message: "Successfully fetched driver token", driverToken}, {status: 200});
        }
      }
      //return with error message if token type is not rider or driver
      else{
        return NextResponse.json({message: "Invalid token type"}, {status: 400});
      } 
    }
    catch(err){
      return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }
}