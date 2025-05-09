//component that displays onboarding form based on role; takes necessary details from users 
"use client";
import React from "react";
import { useUser } from "@clerk/nextjs";
import RiderForm from "./RiderForm";
import DriverForm from "./DriverForm";

const OnboardingForm = ({role}:{role: string})=>{
        const {user} = useUser();
    
      if(user && user.id){
        return (role === "rider")?(
            <RiderForm role="rider"/>
        ):(
            <DriverForm role="driver"/>
        )
      }           
}

export default OnboardingForm;