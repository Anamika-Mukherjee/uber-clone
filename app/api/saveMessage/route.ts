//api to save incoming messages to database 
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";;

export async function POST(req: Request){
    try{
       //get message data and message id from request body
       const {data, messageId} = await req.json();

       //get message sender id and message type from message data
       const {senderId, receiverId, type} = data;

       console.log(data);

       //declare variables to store data in database
       let senderRole : string = "";
       let status: string = "";

       //assign values to sender role and status for different message types
       if(type === "RIDE_REQUEST"){
          senderRole = "rider";
          status = "requested";
       }

       else if(type === "RIDE_ACCEPTION"){
          senderRole = "driver";
          status = "accepted";
       }

       else if(type === "RIDE_CANCELLATION"){
          senderRole = "rider";
          status = "cancelled";
       }
       
       //save message data to "messages" collection in database
       const messageDoc = await db.collection("messages").doc(messageId).set({
         messageId,
         senderId,
         receiverId,
         data,
         messageType: type,
         senderRole,
         status,
       });

       //return with error if message data not stored in database
       if(!messageDoc){
        return NextResponse.json({message: "Could not store message in database"}, {status: 400});
       }

       //return with success message if data stored successfully
       return NextResponse.json({message: "Successfully stored message in database"}, {status: 200});
       
    }
    catch(err){
      return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }
}