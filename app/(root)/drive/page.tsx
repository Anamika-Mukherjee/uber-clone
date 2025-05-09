//drive page for drivers
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const DrivePage = () => {
    const router = useRouter();

    return (
      <div className="driver-page-container">
        <div className="driver-navbar">
          <div className="w-[100px] h-full flex justify-center items-center">
            <p className="font-semibold text-xl tracking-wider text-gray-600">Drive</p>
          </div>   
        </div>
        <div className="driver-main-container">
          <div className="driver-illustration-container">
            <Image 
            src="/assets/driving.png"
            alt="driving"
            width={900}
            height={200}
            />
          </div>
          <div className="driver-message-container">
            <p className="text-4xl lg:text-5xl font-semibold leading-15 text-white w-full lg:w-3/5 h-auto flex justify-center items-center flex-wrap">
            Drive at your ease... with RideEazy
            </p>
            <p className="text-lg text-white w-full lg:w-3/5 h-auto flex justify-start items-center">Earn on your own schedule</p>
            <div className="driver-authentication">
              <div className="w-[150px] h-[50px] bg-white text-black flex justify-center items-center rounded-md hover:cursor-pointer hover:bg-gray-200">
                  <button
                  type="button"
                  className="w-full h-full text-lg tracking-wider font-medium hover:cursor-pointer"
                  onClick={()=>router.push("/driver-signup")}
                  >
                    Get Started
                  </button>
              </div>
              <div className="w-auto h-auto flex justify-center items-center">
                  <Link 
                  href="/signin"
                  className="text-white hover:text-blue-300"
                  >
                  <p>Already have an account? Sign in
                  </p>
                  </Link>
              </div>
            </div>
          </div>
        </div>
        <Link href="/driver-signup">
        <button
          type="button"
          >
          Sign up as driver
          </button>
        </Link>   
      </div>
    )
}

export default DrivePage;
