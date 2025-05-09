//api to store fcm token in database
import { NextResponse } from 'next/server';
import {db} from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    //get user id, fcm token and user role from request body
    const { userId, fcmToken, role } = await req.json();

    //store fcm token in "users" collection in firestore for the user id
    const userRef = db.collection( "users").doc(userId);
    const updatedUserToken = await userRef.set({
        fcmToken,
    }, 
    {merge: true}
    );
    
    //if token not stored in database, return with error message
    if(!updatedUserToken){
      return NextResponse.json({message: "Could not store token in database"}, {status: 400});
    }

    //store fcm token in "tokens" collection in firestore for the user id
    const tokenRef = db.collection("tokens").doc(userId);
    const storedToken = await tokenRef.set({
     userId, 
     fcmToken, 
     role 
    },
    { merge: true }
    );   
  
    //if token not stored in database, return with error message
    if(!storedToken){
      return NextResponse.json({message: "Could not store token in database"}, {status: 400});
    }
    
    //return with success message if token stored successfully
    return NextResponse.json({ message: "FCM token stored successfully" }, { status: 200 });
  } 
  catch (err) {
    console.log(err);
    return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
  }
}