//api to fetch driver fcm token for all nearby drivers from rider dashboard to send ride request notification
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { DocumentData } from "firebase-admin/firestore";

//define type for object to store driver id and driver token
interface DriverIdToken{
  driverId: string;
  token: string;
}

export async function POST(req: Request){
    try{
      //get driver ids of all nearby drivers from request body
      const {driverIds} = await req.json();

      //store driver ids in an array
      const driverUserIds: string[] = driverIds as string[]; 

      //declare array of objects to store driver ids and tokens of all nearby drivers
      const driverIdTokens: DriverIdToken[] = [];

      //map through driver ids array and get tokens for each driver id from database
      const driverDetails = driverUserIds.map(async (driverId: string)=>{
        const docRef = await db.collection("tokens").doc(driverId).get();
        
        //display message if token document does not exist
        if(!docRef.exists){
            console.log("Document does not exist");
        }

        //if token document exists for driver id, proceed
        else{
            //get document data from snapshot and push driver id and token into the declared array of objects
            const driverDoc: DocumentData = docRef.data() as DocumentData;
            const {userId, fcmToken} = driverDoc;
            driverIdTokens.push({driverId: userId, token: fcmToken});
        }  
      });
      
      //wait until all driver tokens are fetched
      await Promise.all(driverDetails);

      //return with error message if tokens not fetched 
      if(!driverIdTokens.length){
        return NextResponse.json({message: "No driver tokens available"}, {status: 400});
      }

      //return driver tokens with success message if tokens fetched successfully
      return NextResponse.json({message: "Successfully fetched driver tokens", driverIdTokens}, {status: 200});

    }
    catch(err){
      return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }
}