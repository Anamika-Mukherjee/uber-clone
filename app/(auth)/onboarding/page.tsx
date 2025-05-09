//onboarding page where users are redirected after sign up
"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";
import { useSearchParams } from "next/navigation";

 const OnboardingPage = () => {
   const searchParams = useSearchParams();
   const role: string = searchParams.get("role") as string;

    return(
      <div className="onboarding-page">
        <OnboardingForm role={role}/>
      </div>
      
    );  
 }

export default OnboardingPage;



