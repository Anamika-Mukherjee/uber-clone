//api to cancel ride from rider dashboard
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import admin from "@/lib/firebaseAdmin";

//define type for message payload 
interface CancelMessage{
    token: string,
    data: {
        title: string,
        body: string,
        type: string,
        rideId: string,
        senderId: string,
        receiverId: string,
        riderName: string,
        status: string,
}
}
export async function POST(req: Request){
    try{
        //get ride id, driver fcm token and message data from request body
        const {rideId, token, data} = await req.json();

        //get message title and body from message data
        const {title, body, type, senderId, receiverId, riderName, status} = data;
       
        //frame ride cancellation message
        const message : CancelMessage = {
        token,
        data: {
            title: String(title),
            body: String(body),
            type: String(type), 
            rideId: String(rideId),
            senderId: String(senderId), 
            receiverId: String(receiverId), 
            riderName: String(riderName), 
            status: String(status),
        }
        };

        //send ride cancellation message to driver
        const response = admin.messaging().send(message);

        //return with error message if cancellation message not sent 
        if(!response){
            return NextResponse.json({message: "Error in sending cancellation message"}, {status: 400});
        }
        
        //update ride status as cancelled in "rides" collection in database
        const rideDoc = await db.collection("rides").doc(rideId).set({
                        status: "ride cancelled",
                        data:{
                         status: "ride cancelled"
                        }
                    }, {merge: true});

        //return with error message if ride status not updated in database
        if(!rideDoc){
            return NextResponse.json({message: "Could not update ride cancellation details"}, {status: 400});
        }
        
        //return with success message if ride cancelled and status updated successfully
        return NextResponse.json({message: "Successfully cancelled ride"}, {status: 200});
      
    }
    catch(err){
        return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }
}