//api to send ride request notification to all nearby drivers from rider dashboard
import admin from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

//type for notification payload
interface NotificationPayloadInterface{
    token: string;
    data: {
      title:string;
      body: string;
      type: string;
      rideId: string;
      receiverId: string;
      senderId: string;
      riderName: string;
      requestTime: string;
      pickupLat: string;
      pickupLng: string;
      dropoffLat: string;
      dropoffLng: string;
      fare: string;
      status: string;
    };
}

export async function POST(req: Request){
   try{
     //get driver's fcm token and notification data from request body
     const {token, data} = await req.json();
     
     //destructure all data to be sent with notification from notification data object
     const {type, title, body, rideId, receiverId, senderId, riderName, requestTime, pickupLat, pickupLng, dropoffLat, dropoffLng, fare, status} = data;

     //frame notification message
     const message: NotificationPayloadInterface = {
        token,
        data: {
            title:String(title),
            body: String(body),
            type: String(type),
            rideId: String(rideId),
            receiverId: String(receiverId),
            senderId: String(senderId),
            riderName: String(riderName),
            requestTime: String(requestTime),
            pickupLat: String(pickupLat),
            pickupLng: String(pickupLng),
            dropoffLat: String(dropoffLat),
            dropoffLng: String(dropoffLng),
            fare: String(fare),
            status: String(status),
        },   
     }

     //send message to driver
     const response = await admin.messaging().send(message);

     //return with error message if message not sent successfully
     if(!response){
        return NextResponse.json({message: "Error sending ride request"}, {status: 400});
     }

     //return with success message if message sent successfully
     return NextResponse.json({message: "Successfully sent ride request"}, {status: 200});
   }
   catch(err){
      console.log(err);
      return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
   }
}