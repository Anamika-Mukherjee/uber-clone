////ride page for riders
"use client";
import React, {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useUser} from "@clerk/nextjs";

export default function Page() {
  const {user} = useUser();
  const router = useRouter();

  useEffect(()=>{
    if(user && user.id){
      router.push("/account/rider-account")
    }
    else{
      router.push("/signin");
    }

  }, [user]);

  return (
    <>
      <div className="w-screen h-[500px] flex flex-col justify-center items-center bg-gray-200">
         Loading...
      </div>
    </>  
  );
}
