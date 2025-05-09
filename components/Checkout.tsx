//component for payment checkout
"use client";
import React, { useEffect } from "react";
import { load } from "@cashfreepayments/cashfree-js";

const Checkout = ({paymentSessionId}: {paymentSessionId: string}) => {

    
    useEffect(()=>{
       //api to cashfree for payment
       const startPayment = async ()=>{
        //load cashfree in test mode
         const cashfree = await load({
            mode: "sandbox" 
         });

         if(!cashfree){
            console.log("Cashfree failed to load");
            return;
         }

         //set checkout redirect target as new tab
         const newWindow = window.open("", "_self");

         if (!newWindow){
          return console.log("Popup blocked!");
         }
          
         //cashfree checkout api
         cashfree.checkout({
            paymentSessionId,
            redirectTarget: newWindow,
            returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?order_id={order_id}`
         });         
       }
       startPayment();

    }, [paymentSessionId]);

  return (
    <div className="w-screen h-full flex flex-col justify-center items-center">
       Redirecting to checkout...
    </div>
  )
}

export default Checkout;
