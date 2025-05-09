//page from where users are redirected to their dashboard according to their role
"use client";
import React, {useState, useEffect} from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const RedirectToDashboardPage = () => {
    const router = useRouter();
    const {user} = useUser();   

    useEffect(()=>{
        if(user && user.id && user.publicMetadata.role){
                router.push(`/account/${user.publicMetadata.role}-account`);   
        }
        
    }, [user, router]);

  return (
    <div>
      <p>Redirecting to your account...</p>
    </div>
  );
}

export default RedirectToDashboardPage;
