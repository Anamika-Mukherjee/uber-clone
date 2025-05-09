//api to start ride from driver dashboard
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { DocumentData } from "firebase-admin/firestore";

export async function POST(req: Request){
    try{
        //get otp and ride id from request body
        const {otp, rideId} = await req.json();
        
        //get ride document from "rides" collection in database through ride id
        const rideSnapshot = await db.collection("rides").doc(rideId).get();
            
        //convert returned snapshot into document
        const rideDoc: DocumentData = rideSnapshot.data() as DocumentData;
        
        //if otp matches with the otp sent to rider, proceed
        if(String(rideDoc.rideStartOtp) === otp){
            //set start time to current time
            const startTime = Date.now();

            //update ride status in database to "ride started"
            const rideRef = db.collection("rides").doc(rideId);
            const rideStarted = await rideRef.set({
                status: "ride started",
                startTime,
            },
            {merge: true} 
            );

            //return with error message if ride status not updated
            if(!rideStarted){
                return NextResponse.json({message: "Could not update ride start status"}, {status: 400});
            }

            //disable otp by setting it to null in database
            const disableOtp = await db.collection("rides").doc(rideId).set({
                rideStartOtp: null
            }, {merge: true});

            //return with error message if otp not disabled
            if(!disableOtp){
                return NextResponse.json({message: "Otp not disabled"}, {status: 400});
            }

            //get the ride acception message sent by driver for the given ride id
            const messagesRef = await db.collection("messages")
            .where("data.rideId", "==", rideId)
            .where("data.senderId", "==", rideDoc.driverId)
            .where("status", "==", "accepted")
            .get();

            const messageDoc = messagesRef.docs[0].data();

            //update status as "ride started" in place of "accepted" for the acception message
            const messageRef = await db.collection("messages").doc(messageDoc.messageId).set({
                status: "ride started",
                data: {
                  status: "ride started"
                }
                }, {merge: true});

            //return with error message if ride status not updated    
            if(!messageRef){
                return NextResponse.json({message: "Could not update ride acception status in message document"}, {status: 400});
            }

            //return with success message if ride start status updated 
            return NextResponse.json({message: "Ride start status updated successfully"}, {status: 200});

        }
        //return with message if otp does not match the otp sent to rider
        else{
            return NextResponse.json({message: "Incorrect OTP"}, {status: 200});
        }    
    }
    catch(err){
        return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }
}