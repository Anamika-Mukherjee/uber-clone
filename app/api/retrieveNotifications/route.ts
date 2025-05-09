//api to retrieve notifications for a given user
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { DocumentData } from "firebase-admin/firestore";

export async function POST(req: Request){
    try{
       //extract user id and role from request body 
       const {userId, role} = await req.json();

       //declare an array to store messages
       const messages: DocumentData[] = [];
       
       //process for driver role
       if(role === "driver"){
            //retrieve all notifications for ride requests having status as "requested" or "cancelled" (only those requests that haven't been accepted by any driver and ride cancel messages)
            const notificationsSnapshot = await db.collection("messages")
            .where("data.receiverId", "==", userId)
            .where("status", "in", ["requested", "cancelled"])
            .where("data.type", "in", ["RIDE_REQUEST", "RIDE_CANCELLATION"])
            .get();

            //if no notifications available, return with message
            if(!notificationsSnapshot){
                return NextResponse.json({message: "No Notifications"}, {status: 200});
            }
        
            //retrieve each notification data from notification snapshot array and push them in "messages" array
            notificationsSnapshot.forEach((notificationSnapshot)=>{
                const notification = notificationSnapshot.data();
                messages.push(notification);
            })
       }

       //process for rider role
       else if(role === "rider"){
        //retrieve all notifications for ride requests having status as "accepted" (only those requests that have been accepted by some driver)
        const notificationsSnapshot = await db.collection("messages")
            .where("data.receiverId", "==", userId)
            .where("status", "==", "accepted")
            .where("data.type", "==", "RIDE_ACCEPTION")
            .get();

            //if no notifications available, return with message
            if(!notificationsSnapshot){
                return NextResponse.json({message: "No Notifications"}, {status: 200});
            }
        
            //retrieve each notification data from notification snapshot array and push them in "messages" array
            notificationsSnapshot.forEach((notificationSnapshot)=>{
                const notification = notificationSnapshot.data();
                messages.push(notification);
            })

       }
       
       //return with all notifications and success message if notifications retrieved successfully
       return NextResponse.json({message: "Successfully retrieved notification", messages}, {status: 200});
       
    }
    catch(err){
        return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }
}