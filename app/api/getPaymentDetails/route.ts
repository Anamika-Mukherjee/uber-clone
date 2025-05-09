//api to fetch payment details for a particular ride
import {NextResponse} from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { DocumentData } from "firebase-admin/firestore";

export async function POST(req: Request){
    try{
        //get payment order id from request body
        const {orderId, customerId} = await req.json();

        //get document snapshot of the payment details for the order id
        const paymentSnapshot = await db.collection("payments")
                                .where("customerId", "==", customerId)
                                .where("orderId", "==", orderId)
                                .limit(1)
                                .get();

        //return with error message if payment details not fetched
        if(!paymentSnapshot){
            return NextResponse.json({message: "Could not retrieve payment details"}, {status: 400});
        }
        
        //get payment detail data from document snapshot
        const paymentDetails: DocumentData = paymentSnapshot.docs[0].data() as DocumentData;

        //return payment details with success message if payment details fetched successfully
        return NextResponse.json({message: "Successfully retrieved payment details", paymentDetails}, {status: 200});  
    }
    catch(err){
        return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }   
}