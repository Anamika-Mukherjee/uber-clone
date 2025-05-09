//api to update user details from user dashboard
import { NextResponse } from 'next/server';
import { Clerk } from '@clerk/clerk-sdk-node';
import { db } from '@/lib/firebaseAdmin';

//initialize clerk
const clerk = Clerk({
    secretKey: process.env.CLERK_SECRET_KEY,  
    apiUrl: process.env.CLERK_BACKEND_API_URL, 
});

export async function POST(req: Request) {
  try {

    //get request body and store in a variable
    const requestBody = await req.json();

    //extract user details from request body
    const {userId, fullName, primaryEmailAddress, phoneNumber} = requestBody;

    //get user details from clerk through user id
    const user = await clerk.users.getUser(userId);

    //if user details not fetched, return with error message
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    //process for rider role
    if(user && user.publicMetadata.role === "rider"){

        //update rider details in clerk database
        const updatedUser = await clerk.users.updateUser(userId, {
            publicMetadata: { 
            ...user.publicMetadata,
            fullName, phoneNumber, primaryEmailAddress
        },
        });

        //if rider details not updated, return with error message
        if(!updatedUser){
            return NextResponse.json({message: "Could not update user details"}, {status: 400});
        }

        //update rider details in firestore database
        const userRef = db.collection("users").doc(userId);
        const userUpdated = await userRef.set({
            fullName,
            phoneNumber,
            emailAddress: primaryEmailAddress,
        }, {merge: true});

        //if rider details not updated in firestore, return with error message
        if(!userUpdated){
            return NextResponse.json({message: "Could not update user details"}, {status: 400});
        }

    }
    //process for driver role
    else if(user && user.publicMetadata.role === "driver"){

        //get driver details from request body
        const {vehicleNumber, vehicleDescription} = requestBody;

        //update driver details in clerk database
        const updatedUser = await clerk.users.updateUser(userId, {
            publicMetadata: { 
            ...user.publicMetadata,
            fullName, phoneNumber, primaryEmailAddress, vehicleNumber, vehicleDescription
        },
        });

        //if driver details not updated, return with error message
        if(!updatedUser){
            return NextResponse.json({message: "Could not update user details"}, {status: 400});
        }

        //update driver details in firestore database
        const userRef = db.collection("users").doc(userId);
        const userUpdated = await userRef.set({
            fullName,
            phoneNumber,
            emailAddress: primaryEmailAddress,
            vehicleNumber,
            vehicleDescription
        }, 
        {merge: true}
         );

        //if drivr details not updated in firestore, return with error message
        if(!userUpdated){
            return NextResponse.json({message: "Could not update user details"}, {status: 400});
        }
    }
    
    //return success message if user details updated successfully
    return NextResponse.json({ message: "User details updated successfully"}, {status: 200});
  } 
  catch (err) {
    console.log(err);
    return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
  }
}