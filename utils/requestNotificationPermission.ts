//function to request notification permission
import { getToken, isSupported, Messaging } from "firebase/messaging";
import {messaging} from "@/utils/firebaseClientConfig";

export const requestPermission = async (userId: string, role: string) => {
    try{
        //check if browser supports firebase cloud messaging
        const supported = await isSupported();
        //return warning message if browser does not support fcm
        if (!supported) {
            console.warn("This browser does not support FCM.");
            return;
        }

        console.log("Requesting permission...");
        //request permission for fcm
        const permission = await Notification.requestPermission();

        //proceed if permission granted
        if(permission === "granted"){
            console.log("Notification permission granted");

            //fetch fcm token if permission granted
            const token = await getToken(messaging as Messaging, {vapidKey: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_VAPID_KEY});
            if(token){ 
                //api request to store token in database
                const response = await fetch("/api/updateToken", {
                    method: "POST", 
                    body: JSON.stringify({
                      userId,  
                      fcmToken: token,
                      role,
                    }),
                    headers: {"Content-Type": "application/json"}
                });
                 
                //throw error if token not stored successfully
                if(response.status !== 200){
                  throw new Error("Error updating messaging token");
                }    
                //return token with success message if token stored successfully            
                return {message: "Successfully retrieved and stored messaging token", token, status: 200};
            }
            else{
                console.log("No messaging token available");
                //return with error message if token not fetched successfully
                return {message: "No messaging token available", status: 400};
            }
        }
        else{
            console.error("Token permission not granted");
            //return with error message if token permission not granted
            return {message: "Token permission not granted", status: 400};
        }
         
    }
    catch(err){
        console.log(err);
        return {message: "Something went wrong", status: 500};
    }     
}
    
