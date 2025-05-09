//header component
"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
    SignedIn,
    SignedOut,
    UserButton,
    useUser,
} from "@clerk/nextjs";
import { useParams } from "next/navigation";

function Header() {
  const {authType} = useParams();
  const {user} = useUser();

  return (
    <div className="w-screen flex justify-between items-center p-4 h-[50px] bg-gray-200">
      {/* logo */}
        <Link 
        href={user?`/account/${user.publicMetadata.role}-account`:`/`}
        className="w-[50px] lg:w-[200px] h-full flex justify-start items-center gap-2 ">
            <Image 
             src="/assets/logo.png"
             alt="logo"
             width={50}
             height={50}
             />
             <p className="hidden lg:flex font-[Jura] font-[700] text-(--brand) hover:text-(--brand-dark) text-xl">
                RideEazy
             </p>  
        </Link>
        {/* links to ride and drive pages */}
        {!user && (
        <div className="w-1/5 lg:w-1/3 h-full flex justify-center items-center lg:gap-10 font-medium">
            <Link 
           href = "/ride"
           className="hover:cursor-pointer hover:bg-(--brand) hover:text-white hover:font-normal px-4 py-1 rounded-md">
              Ride
           </Link>
           <Link 
           href = "/drive"
           className="hover:cursor-pointer hover:bg-(--brand) hover:text-white hover:font-normal px-4 py-1 rounded-md">
              Drive
           </Link>
        </div>
        )}
        {/* display sign in and sign up for unauthenticated users and user button for authenticated users */}
        <div className="w-1/3 lg:w-[300px] h-full flex justify-end items-center p-4 gap-4">
            <SignedOut>
                <div className="w-[20px] lg:w-[60px] h-[20px] flex justify-center items-center hover:cursor-pointer">
              
                    <Link 
                    href={authType?`/${authType}`:"signin"}
                    className="hidden lg:flex hover:cursor-pointer font-medium hover:font-semibold hover:text-(--brand)"
                    >
                      Sign In
                    </Link>
                    <Link 
                    href={authType?`/${authType}`:"signin"}
                    className="lg:hidden flex hover:cursor-pointer font-medium hover:font-semibold hover:text-(--brand)"
                    >
                      <Image 
                       src="/assets/log-in.svg"
                       alt="sign-in"
                       width={20}
                       height={20}
                       />
                    </Link>
              
                </div>
                <div className="w-[50px] h-[40px] lg:w-[100px] lg:h-[40px] lg:bg-(--brand) flex justify-center items-center lg:rounded-[30px] text-black lg:text-white hover:cursor-pointer lg:hover:bg-(--brand-dark)">
             
                    <Link 
                    href = {authType?`/${authType}`:"rider-signup"}
                    className="flex justify-center items-center text-xs lg:text-base hover:cursor-pointer"
                    >
                      Sign Up
                    </Link>
                  
                </div>
            </SignedOut>
            <SignedIn>
                <div className="w-[150px] h-full flex justify-end items-center space-x-4">
                 <Link
                  href={`/account/${user?.publicMetadata.role}-account/rideHistory`}
                  className="w-[30px] h-[30px] flex justify-center items-center hover:cursor-pointer hover:bg-slate-400 hover:rounded-[30px]">
                  <Image 
                   src="/assets/history.svg"
                   alt="bell"
                   width={20}
                   height={20}
                   />
                 </Link>
                 <Link
                  href={`/account/${user?.publicMetadata.role}-account/notifications`}
                  className="w-[30px] h-[30px] flex justify-center items-center hover:cursor-pointer hover:bg-slate-400 hover:rounded-[30px]">
                  <Image 
                   src="/assets/bell.svg"
                   alt="bell"
                   width={20}
                   height={20}
                   />
                 </Link>
                <UserButton userProfileMode="navigation" userProfileUrl={`/account/${user?.publicMetadata.role}-account/user-profile`}/>
                </div>
            </SignedIn>
        </div>
    </div>
  )
}

export default Header;
