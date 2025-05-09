//api to store user details in database
import { NextResponse } from "next/server";
import {Clerk} from "@clerk/clerk-sdk-node";
import { db } from "@/lib/firebaseAdmin";

//initialize clerk
const clerk = Clerk({
    secretKey: process.env.CLERK_SECRET_KEY,  
    apiUrl: process.env.CLERK_BACKEND_API_URL,  
  });


export async function POST(req: Request){
    try{
            //extract form data from request body and store each detail in separate variables
            const formData = await req.formData();
            const role: string = formData.get("role") as string;
            const userId: string = formData.get("userId") as string;
            const fullName: string = formData.get("fullName") as string;
            const phoneNumber: string = formData.get("phoneNumber") as string;

            //get user information from clerk database 
            const user = await clerk.users.getUser(userId);

            //get user information from firestore to check if user already exists
            const userSnapshot = await db.collection("users").doc(userId).get();

            //if user exists, return with message
            if(userSnapshot.exists){
                return NextResponse.json({message: "User already exists"}, {status: 200});
            }
    
            //if new user and clerk user exists, proceed with further processes
            if(user && user.id && role){
                //destructure user details from object returned by clerk
                const {id, createdAt, updatedAt, imageUrl, hasImage, primaryEmailAddressId, emailAddresses} = user;
                
                //store primary email address id in a variable
                const primaryEmailAddress = emailAddresses.find(e => e.id === primaryEmailAddressId)?.emailAddress;

                //return with error message if primary email address not available
                if(!primaryEmailAddress){
                    return NextResponse.json({message: "Primary email address not found"}, {status: 400});
                }
                
                //process for rider role
                if(role === "rider"){

                    //add rider details to firestore database
                    await db.collection("users").doc(id).set({
                        id, emailAddress: primaryEmailAddress, createdAt,  updatedAt, imageUrl, hasImage, fullName, phoneNumber, role
                    });

                    //add rider details to clerk
                    const updatedUser = await clerk.users.updateUser(userId, {
                        publicMetadata: { fullName, phoneNumber, primaryEmailAddress, role },
                    });

                    //return with error message if rider details not updated in clerk
                    if(!updatedUser){
                        return NextResponse.json("Could not update role", {status: 400}); 
                    }              
                }

                //process for driver role
                else if(role === "driver"){
                    
                    //get driver details from form data
                    const vehicleNumber = formData.get("vehicleNumber");
                    const vehicleDescription = formData.get("vehicleDescription");

    
                    //add driver details to firestore database
                    await db.collection("users").doc(id).set({
                        id, emailAddress: primaryEmailAddress, createdAt,  updatedAt, imageUrl, hasImage, fullName, phoneNumber, vehicleNumber, vehicleDescription, role,
                    });

                    //add driver details to clerk
                    const updatedUser = await clerk.users.updateUser(userId, {
                        publicMetadata: { fullName, phoneNumber, primaryEmailAddress, role, vehicleNumber, vehicleDescription},
                    });

                    //return with error message if driver details not updated in clerk
                    if(!updatedUser){
                        return NextResponse.json("Could not update role", {status: 400}); 
                    }
                } 
                
                //return with success message if user details stored successfully
                return NextResponse.json("New user created successfully", {status: 200});       
            } 
            //return with message if clerk user does not exist 
            else{
                return NextResponse.json("User does not exist!", {status: 200});
            }   
        }
        catch(err){
            console.log(err);
            return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
        }
}