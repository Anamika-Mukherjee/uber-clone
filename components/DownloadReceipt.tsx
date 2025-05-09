//component to download payment receipt from rider dashboard
"use client";
import React from "react";
import {jsPDF} from "jspdf";
import { convertToDateTime } from "@/lib/utils";

const DownloadReceipt = ({paymentDetails}: {paymentDetails: PaymentDetails}) => {

    //event handler for download button
    const handleDownload = ()=>{
        //initialize new instance of jsPDF 
        const doc = new jsPDF();
        
        //set data and formatting to be converted into pdf
        doc.setFontSize(18);
        doc.text("Payment Invoice", 20, 20);
        doc.setFontSize(12);
        doc.text(`Order ID: ${paymentDetails.orderId}`, 20, 40);
        doc.text(`Payment ID: ${paymentDetails.paymentId}`, 20, 50);
        doc.text(`Customer: ${paymentDetails.customerName}`, 20, 60);
        doc.text(`Email: ${paymentDetails.customerEmail}`, 20, 70);
        doc.text(`Amount: ${paymentDetails.currency} ${paymentDetails.amount}`, 20, 80);
        doc.text(`Payment Method: ${Object.keys(paymentDetails.paymentMethod)[0]}`, 20, 90);
        doc.text(`Date: ${convertToDateTime(paymentDetails.time)}`, 20, 100);
        doc.text(`Payment Status: ${paymentDetails.paymentStatus.toLowerCase()}`, 20, 110);

        //save data as pdf
        doc.save(`invoice_${paymentDetails.orderId}.pdf`);
    }; 

    //display download button
    return (
            <div className="w-[170px] h-[50px] flex justify-center items-center text-sm px-2 tracking-wider bg-black text-white rounded-md hover:cursor-pointer hover:bg-gray-800">
                <button 
                type="button"
                className="w-full h-full flex justify-center items-center rounded-md hover:cursor-pointer"
                onClick={handleDownload}
                >
                Download Receipt
                </button>
            </div>
    )
}

export default DownloadReceipt;
