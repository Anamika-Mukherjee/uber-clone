//auth page (sign in and sign up)
"use client";
import React, {useState, useEffect} from "react";
import Image from "next/image";
import {SignIn, SignUp} from "@clerk/nextjs";
import { useParams } from 'next/navigation';


const AuthPage = () => {   
    const [role, setRole] = useState<string>("");

    //set default value for authType if not included in params
    const {authType = "signin"} = useParams();


    useEffect(()=>{
        //set user role according to param type
        if(authType === "rider-signup"){
            setRole("rider");
        }
        else if(authType === "driver-signup"){
          setRole("driver");
        }
    }, []);    
    
    return (
      <div className="bg-gray-200 w-screen h-screen flex justify-end items-center p-12">
        <div className="w-2/3 h-full hidden lg:flex flex-col justify-center items-center">
          <div className=" z-10 absolute top-[150px] left-[100px] flex flex-col justify-center items-center">
          <p className="font-[Jura] text-[60px] text-(--brand)">RideEazy</p>
          <p className="font-[Jura]">Now taking a ride is easy... anywhere, anytime</p>
          </div>
           <Image 
            src = "/assets/cab-illustration.svg"
            alt = "cab illustration"
            width={700}
            height={500}
            className="z-0 rounded-lg"
            />
        </div>
        {/* redirect user to sign in or sign up pages based on their role */}
        {authType === "rider-signup" && (
            <SignUp signInUrl = {`/rider-signin`} forceRedirectUrl={"/onboarding?role=rider"}/>
        )}
        {authType === "driver-signup" && (
            <SignUp signInUrl = {`/driver-signin`} forceRedirectUrl={"/onboarding?role=driver"}/>
        )}
        {(authType === "signin") && (
            <SignIn signUpUrl = {`/rider-signup`} forceRedirectUrl={"/redirect-to-dashboard"}/>
        )}
        
      </div>
    )
}

export default AuthPage;
