//cashfree webhook that triggers after payment is successful; store payment details in database
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { DocumentData } from "firebase-admin/firestore";

export async function POST(req: Request) {
    try{
        //get webhook payload from request body
        const payload = await req.json();
  
        //get payment status and order id from payload
        const paymentStatus = payload.data.payment.payment_status;
        const orderId = payload.data.order.order_id;

        //if payment successful, proceed
        if (paymentStatus === "SUCCESS") {
             //store payment details in database
             const paymentRef = await db.collection("payments").doc(orderId).set({
                orderId,
                customerId: payload.data.customer_details?.customer_id ?? null,
                customerEmail: payload.data.customer_details?.customer_email ?? null,
                customerName: payload.data.customer_details?.customer_name ?? null,
                time: Date.now(),
                amount: payload.data.payment?.payment_amount ?? null,
                currency: payload.data.payment?.payment_currency ?? null,
                paymentId: payload.data.payment?.cf_payment_id,
                paymentMethod: payload.data.payment?.payment_method ?? null,
                paymentStatus,
             }); 

             //return with error message if payment status not updated
             if(!paymentRef){
                return NextResponse.json({message: "Could not update payment information in database"}, {status: 400});
             }

             //get query snapshot for ride document associated with the given payment details
             const rideSnapshot = await db.collection("rides")
                                .where("paymentOrderId", "==", orderId)
                                .where("riderId", "==", payload.data.customer_details.customer_id)
                                .limit(1)
                                .get();

             //return with error message if ride document does not exist
             if(!rideSnapshot){
                return NextResponse.json({message: "Could not update payment status in database"}, {status: 400});
             }

             //get ride id from ride document
             const rideRef: DocumentData = rideSnapshot.docs[0].data() as DocumentData;
             const {rideId} = rideRef;

             //update ride status to "payment successful" in ride document for the given ride id
             const updateStatus = await db.collection("rides").doc(rideId).set({
                status: "payment successful",
                data: {
                 status: "payment successful"
                }
            }, {merge: true});

            //return with error message if status not updated
            if(!updateStatus){
                return NextResponse.json({message: "Could not update payment status in database"}, {status: 400});
            }
             
            //return with success message if payment status updated
            return NextResponse.json({message: "Successfully updated payment details"}, {status: 200});             
        }
        //return with message if payment failed
        else{
            return NextResponse.json({message: "Payment was unsuccessful"}, {status: 200});
        }
      
    }
    catch(err){
        return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }
}