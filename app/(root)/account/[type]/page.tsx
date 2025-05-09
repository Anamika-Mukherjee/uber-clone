//user dashboard page to display dashboard according to user role
"use client";
import React from "react";
import { useParams } from "next/navigation";
import RiderAccount from "@/components/RiderAccount";
import DriverAccount from "@/components/DriverAccount";

const DashboardPage = () => {
    const {type} = useParams();

    return (
        <>
            {type === "rider-account" && 
                (
                    <RiderAccount />
                
            )}
            {type === "driver-account" && 
                (
                    <DriverAccount />
                
            )}
        </>     
    )    
}

export default DashboardPage;
