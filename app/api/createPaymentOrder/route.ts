//api to create payment order
import {NextResponse} from "next/server";
import { db } from "@/lib/firebaseAdmin";

//define type for create payment order api response
interface CreateOrderResponse{
    cf_order_id: string,
    created_at: string,
    customer_details: {
      customer_id: string,
      customer_name: string,
      customer_email: string,
      customer_phone: string,
      customer_uid: string,
    },
    entity: string,
    order_amount: number,
    payment_session_id: string,
    order_currency: string,
    order_expiry_time: string,
    order_id: string,
    order_meta: {
      return_url: string,
      payment_methods: string,
      notify_url: string,
    },
    order_note: string,
    order_splits: object[],
    order_status: string,
    order_tags: {},
    terminal_data: {},
    cart_details: {}
  }

export async function POST(req: Request){

    try{
        //get ride details and rider details with payment amount from request body
        const {rideId, orderAmount, customerId, customerName, customerEmail, customerPhone} = await req.json();
 
        //define headers
        const headers = {
            "x-api-version": "2022-09-01",
            "x-client-id": process.env.CASHFREE_APP_ID!,
            "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
            "Content-Type": "application/json"
        }
       
        //frame request body to be sent with api
        const orderData = {
            order_id: `order_${Date.now()}`,
            order_currency: "INR",
            order_amount: Number(orderAmount),
            customer_details: {
                customer_id: String(customerId),
                customer_name: String(customerName),
                customer_email: String(customerEmail),
                customer_phone: String(customerPhone),
            },
            order_meta: {
                return_url: `${process.env.BASE_URL}/payment-success?order_id={order_id}`,
            }
        }
       
        //cashfree api to create payment order
        const response = await fetch(`${process.env.CASHFREE_TEST_URL}/pg/orders`, {
            method: "POST",
            headers,
            body: JSON.stringify(orderData),
        });
        
        const data: CreateOrderResponse = await response.json();
        
        //return with error message if order not created
        if(response.status !== 200){
            return NextResponse.json({message: "Could not create order"}, {status: response.status})
        }
       
        //store payment session id from response in a variable
        const paymentSessionId = data.payment_session_id;

        //store order id in "rides" collection in database
        const rideRef = await db.collection("rides").doc(rideId).set({
           paymentOrderId: data.order_id,
        }, {merge: true});

        //return with error message if order id not stored in database
        if(!rideRef){
            return NextResponse.json({message: "Could not update payment details in database"}, {status: 400});
        }
       
        //return order response with success message if order created successfully
        return NextResponse.json({message: "Successfully created payment order", paymentSessionId}, {status: 200});  
    }
    catch(err){
        return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
    }   
}