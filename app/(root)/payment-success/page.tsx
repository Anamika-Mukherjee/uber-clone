//payment success page where users will be redirected after payment completion
"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import DownloadReceipt from "@/components/DownloadReceipt";
import ViewReceipt from "@/components/ViewReceipt";
import { useErrorContext } from "@/context/ErrorContext";
import { convertToDateTime } from "@/lib/utils";

const PaymentSuccessPage = () => {
   const {user} = useUser();
   const searchParams = useSearchParams();
   const orderId = searchParams.get("order_id");
   const {setError} = useErrorContext();
   const [loading, setLoading] = useState<boolean>(false);
   const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>();

   useEffect(()=>{
      if(user && user.id && orderId){
         try{
         const fetchPaymentDetails = async ()=>{
            setLoading(true);
            //api to get payment details from database
            const response = await fetch("/api/getPaymentDetails", {
               method: "POST",
               body: JSON.stringify({
                  customerId: user.id,
                  orderId,
               }),
               headers: {"Content-Type": "application/json"}
            });

            const data = await response.json();
            console.log(data.message);

            if(response.status !== 200){
               setError(data.message);
               return;
            }
            
            //store payment details in state variable
            setPaymentDetails(data.paymentDetails);
         };
         fetchPaymentDetails();
         }
         catch(err){
            console.log(err)
         }
         finally{
         setLoading(false);
         }
      }
   }, [user, orderId]);  
   
   //display loading if data not loaded
   if(loading){
      return(
            <div className="payment-success-page">
               <p className="tracking-wide">
                  Loading...
               </p>
            </div>
      )
   }

   //display payment success page
   return paymentDetails && (
      <div className="payment-success-page">
            {paymentDetails && (
               <div className="payment-details">
                  <p className="text-lg font-semibold">Payment Successful</p>
                  <div className="payment-data">
                     <p className="text-gray-700">
                        Order Id:
                        <span className="text-black ml-4">
                        {paymentDetails.orderId}
                        </span>
                     </p>
                     <p className="text-gray-700">
                        Customer Name:
                        <span className="text-black ml-4">
                        {paymentDetails.customerName}
                        </span>
                     </p>
                     <p className="text-gray-700">
                        Customer Email:
                        <span className="text-black ml-4">
                        {paymentDetails.customerEmail}
                        </span>
                     </p>
                     <p className="text-gray-700">
                        Amount Paid:
                        <span className="text-black ml-4">
                        &#8377;{paymentDetails.amount}
                        </span>
                     </p>
                     <p className="text-gray-700">
                        Payment Status:
                        <span className="text-black ml-4">
                        {paymentDetails.paymentStatus}
                        </span>
                     </p>
                     <p className="text-gray-700">
                        Payment Id:
                        <span className="text-black ml-4">
                        {paymentDetails.paymentId}
                        </span>
                     </p>
                     <p className="text-gray-700">
                        Payment Method: 
                        <span className="text-black ml-4">
                        {paymentDetails.paymentMethod && 
                        Object.keys(paymentDetails.paymentMethod)[0]    
                        }
                        </span>
                     </p>
                     <p className="text-gray-700">
                        Payment Time: 
                        <span className="text-black ml-4">
                        {convertToDateTime(paymentDetails.time)}
                        </span>
                     </p>
                  </div>
                  <div className="w-full h-auto flex justify-center items-center space-x-10">
                     <DownloadReceipt paymentDetails = {paymentDetails} />
                     <ViewReceipt paymentDetails={paymentDetails} />
                  </div>
               </div>
            )}
      </div>
   )
}

export default PaymentSuccessPage;
