//api to delete user from clerk database
import { NextResponse } from "next/server";
import { Clerk } from "@clerk/clerk-sdk-node";

//initialize clerk
const clerk = Clerk({
    secretKey: process.env.CLERK_SECRET_KEY,  
    apiUrl: process.env.CLERK_BACKEND_API_URL,  
});

export async function POST(req: Request){
    try{
       //get user id from request body 
       const {userId} = await req.json();

       //get user details from clerk through userid
       const user = await clerk.users.getUser(userId);

       //if user details not available, return with message
       if(!user){
        return NextResponse.json({message: "User does not exist"}, {status: 200})
       }

       //delete user from clerk if user details available
       const deletedUser = await clerk.users.deleteUser(userId);

       //if user not deleted, return with error message
       if(!deletedUser){
        return NextResponse.json({message: "Could not delete user"}, {status: 400});
       }

       //return with success message if user deleted successfully
       return NextResponse.json({message: "User deleted successfully"}, {status: 200});
    }
    catch(err){
        console.log(err);
        return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }
}