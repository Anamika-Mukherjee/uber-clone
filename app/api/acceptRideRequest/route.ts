//api to send notification to rider to accept ride request from driver dashboard
import admin from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

//define type interface for message payload
interface AcceptMessage{
    token: string;
    data: {
        title: string;
        body: string;
        type: string;
        rideId: string;
        receiverId: string;
        senderId: string;
        driverName: string;
        driverPhone: string;
        vehicleNumber: string;
        driverLat: string;
        driverLng: string;
        estimatedFare: string;
        requestStatus: string;
        rideStartOtp: string;
    }
};

export async function POST(req: Request){
    try{

      //get rider's firestore cloud messaging (fcm) token and data for message from request body 
       const { token, data} = await req.json();

       //destructure message data
       const {type, title, body, rideId, receiverId, senderId, driverName, driverPhone, vehicleNumber, driverLat, driverLng, estimatedFare, requestStatus} = data;    

       //generate otp to be shared when ride starts
       const rideStartOtp = Math.floor(100000 + Math.random() * 900000);

       //frame message
       const message: AcceptMessage = {
           token,
           data: {
            title: String(title),
            body: String(body),
            type: String(type),
            rideId: String(rideId),
            receiverId: String(receiverId),
            senderId: String(senderId),
            driverName: String(driverName),
            driverPhone: String(driverPhone),
            vehicleNumber: String(vehicleNumber),
            driverLat: String(driverLat),
            driverLng: String(driverLng),
            estimatedFare: String(estimatedFare),
            requestStatus: String(requestStatus),
            rideStartOtp: String(rideStartOtp)
           }
       };

       //send message to rider
       const response = await admin.messaging().send(message);
       
       //return with error message if message not sent successfully
       if(!response){
       return NextResponse.json({message: "Error in sending message"}, {status: 400});
       }
        
       //store driver details in "rides" collection in firestore for this ride 
       const rideRef = await db.collection("rides").doc(rideId).set({
          driverId: senderId,
          driverName,
          driverPhone,
          vehicleNumber,
          status: "accepted",
          rideStartOtp,
       }, 
        {merge: true}
       );

       //return with error message if driver details not stored in firestore
       if(!rideRef){
         return NextResponse.json({message: "Could not update ride acception status and data in ride documents"}, {status: 400});
       }
      
       //update request status to the messages sent to all nearby drivers to "accepted", so that other drivers don't see the message after a driver accepts
       const messagesRef = await db.collection("messages")
                           .where("data.rideId", "==", rideId)
                           .where("status", "==", "requested")
                           .get();
                           
       messagesRef.forEach(async (message)=>{
          const messageDoc = message.data();
          const messageRef = await db.collection("messages").doc(messageDoc.messageId).set({
             status: "accepted",
             data: {
                driverId: senderId,
                status: "accepted"
             }
          }, {merge: true});

          if(!messageRef){
            return NextResponse.json({message: "Could not update ride acception status in message document"}, {status: 400});
          }
       });
       
       //return success message if request status updated in messages
       return NextResponse.json({message: "Successfully sent ride acception message"}, {status: 200}); 
    }
    catch(err){
      console.log(err);
      return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }
}
