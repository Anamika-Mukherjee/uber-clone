//component to display form to update user profile
"use client";
import { useErrorContext } from "@/context/ErrorContext";
import { useInfoContext } from "@/context/InfoContext";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ManageAccount = () => {
    const {user} = useUser();
    const router = useRouter()
    const [primaryEmailAddress, setPrimaryEmailAddress] = useState<string>("");
    const [fullName, setFullName] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [vehicleNumber, setVehicleNumber] = useState<string>("");
    const [vehicleDescription, setVehicleDescription] = useState<string>("");
    const {setError} = useErrorContext();
    const {setInfo} = useInfoContext();
    const [loading, setLoading] = useState<boolean>(false);


    useEffect(()=>{
      //set default values for input fields to display when component loads; display previously stored values   
      if(user && user.id && user.publicMetadata.role){
        if(user.primaryEmailAddress){
            setPrimaryEmailAddress(user.primaryEmailAddress.emailAddress)
        }
        if(user.publicMetadata.fullName){
            setFullName(String(user.publicMetadata.fullName));
        }
        if(user.publicMetadata.phoneNumber){
            setPhoneNumber(String(user.publicMetadata.phoneNumber));
        }
        if(user.publicMetadata.vehicleNumber){
            setVehicleNumber(String(user.publicMetadata.vehicleNumber));
        }
        if(user.publicMetadata.vehicleDescription){
            setVehicleDescription(String(user.publicMetadata.vehicleDescription));
        }
      } 
    }, [user]);

    //submit event handler function for profile form submit event
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(user && user.id){
            try {
                //rider form submission
                if(user.publicMetadata.role === "rider"){
                    setLoading(true);
                    //api request to submit form and update rider details
                    const response = await fetch("/api/updateUserInfo", {
                        method: "POST",
                        body: JSON.stringify({
                           userId: user.id,
                           fullName,
                           phoneNumber,
                           primaryEmailAddress 
                        }),
                        headers: {"Content-Type": "application/json"}
                    });
        
                    const data = await response.json();
                    console.log(data.message);
        
                    if(response.status !== 200){
                        setError(data.message);
                        return;
                    }
                    
                    setInfo(data.message);
                    //redirect to user dashboard page after successful update
                    router.push(`/account/rider-account`);
                    
                }
                //driver form submission
                else if(user.publicMetadata.role === "driver"){
                    setLoading(true);

                    //api request to submit form and update driver details
                    const response = await fetch("/api/updateUserInfo", {
                        method: "POST",
                        body: JSON.stringify({
                           userId: user.id,
                           fullName,
                           phoneNumber,
                           primaryEmailAddress,
                           vehicleNumber, 
                           vehicleDescription,
                        }),
                        headers: {"Content-Type": "application/json"}
                    });
        
                    const data = await response.json();
                    console.log(data.message);
        
                    if(response.status !== 200){
                        setError(data.message);
                        return;
                    }
                   
                    setInfo(data.message);
                    //redirect to user dashboard page after successful update
                    router.push(`/account/driver-account`);
                  
                }
            } 
            catch (err) {
                console.log(err);     
            }
            finally{
                setLoading(false);
            }
        }    
    };

    //display loading message if data not loaded   
    if(loading){
        return (
        <div className="w-screen h-screen flex flex-col justify-center items-center p-4">
            <p className="tracking-wider">Loading</p>
        </div>
        )
    }  


  if(user){
    //display form for rider
    return (user.publicMetadata.role === "rider")?(
        <div className="w-screen h-full flex flex-col justify-start items-center p-8">
            <form onSubmit={handleSubmit} className="w-[90%] h-auto flex flex-col justify-start items-center space-y-20">
                <div className="w-full h-auto flex flex-col justify-center items-center space-y-4">
                    <h1 className="text-2xl font-semibold tracking-wide">
                        Update Profile
                    </h1>
                </div>
                <div className="w-full h-auto flex flex-col justify-start items-start space-y-8">
                    <div className="w-full h-auto flex flex-col justify-center items-start space-y-2">
                        <label htmlFor="primaryEmailAddress" className="w-auto h-auto flex justify-start items-center">Email</label>
                        <input 
                                type="text"
                                name="primaryEmailAddress"  
                                id="primaryEmailAddress"
                                value={primaryEmailAddress}
                                placeholder="Please enter your primary email address..." 
                                autoComplete="off"
                                className="w-full lg:w-[500px] h-[40px] flex justify-start items-center p-2 border border-gray-600 rounded-md"
                                onChange={(e)=>setPrimaryEmailAddress(e.target.value)}
                        />
                    </div>
                    <div className="w-full h-auto flex flex-col justify-center items-start space-y-2">
                        <label htmlFor="fullName" className="w-auto h-auto flex justify-start items-center">Full Name</label>
                        <input 
                                type="text"
                                name="fullName"  
                                id="fullName"
                                value={fullName}
                                placeholder="Please enter your name..." 
                                autoComplete="off"
                                className="w-full lg:w-[500px] h-[40px] flex justify-start items-center p-2 border border-gray-600 rounded-md"
                                onChange={(e)=>setFullName(e.target.value)}
                        />
                    </div>
                    <div className="w-full h-auto flex flex-col justify-center items-start space-y-2">
                        <label htmlFor="phoneNumber" className="w-auto h-auto flex justify-start items-center">Contact Number</label>
                        <input 
                        type="text"
                        name="phoneNumber"
                        id="phoneNumber" 
                        value={phoneNumber}
                        placeholder="Please enter your contact number..." 
                        autoComplete="off"
                        className="w-full lg:w-[500px] h-[40px] flex justify-start items-center p-2 border border-gray-600 rounded-md"
                        onChange={(e)=>setPhoneNumber(e.target.value)}
                        />
                    </div>
                    
                    <div className="w-full lg:w-[200px] h-[45px] flex flex-col justify-center items-center p-4 bg-black text-white rounded-md hover:cursor-poiner hover:bg-gray-800">
                        <button 
                        type="submit"
                        className="w-full h-full flex justify-center items-center hover:cursor-pointer rounded-md"
                        >
                         Save Changes
                        </button>
                    </div>
                    
                </div>
           </form>
          
        </div>
      ):
      //display form for driver
      (
        <div className="w-screen h-full flex flex-col justify-start items-center p-8">
        <form onSubmit={handleSubmit} className="w-[90%] h-auto flex flex-col justify-start items-center space-y-20">
            <div className="w-full h-auto flex flex-col justify-center items-center space-y-4">
                <h1 className="text-2xl font-semibold tracking-wide">
                    Update Profile
                </h1>
            </div>
            <div className="w-full h-auto flex flex-col justify-start items-start space-y-8">
                <div className="w-full h-auto flex flex-col justify-center items-start space-y-2">
                    <label htmlFor="primaryEmailAddress" className="w-auto h-auto flex justify-start items-center">Full Name</label>
                    <input 
                            type="text"
                            name="primaryEmailAddress"  
                            id="primaryEmailAddress"
                            value={primaryEmailAddress}
                            placeholder="Please enter your primary email address..." 
                            autoComplete="off"
                            className="w-full lg:w-[500px] h-[40px] flex justify-start items-center p-2 border border-gray-600 rounded-md"
                            onChange={(e)=>setPrimaryEmailAddress(e.target.value)}
                    />
                </div>
                <div className="w-full h-auto flex flex-col justify-center items-start space-y-2">
                    <label htmlFor="fullName" className="w-auto h-auto flex justify-start items-center">Full Name</label>
                    <input 
                            type="text"
                            name="fullName"  
                            id="fullName"
                            value={fullName}
                            placeholder="Please enter your name..." 
                            autoComplete="off"
                            className="w-full lg:w-[500px] h-[40px] flex justify-start items-center p-2 border border-gray-600 rounded-md"
                            onChange={(e)=>setFullName(e.target.value)}
                    />
                </div>
                <div className="w-full h-auto flex flex-col justify-center items-start space-y-2">
                    <label htmlFor="phoneNumber" className="w-auto h-auto flex justify-start items-center">Contact Number</label>
                    <input 
                    type="text"
                    name="phoneNumber"
                    id="phoneNumber" 
                    value={phoneNumber}
                    placeholder="Please enter your contact number..." 
                    autoComplete="off"
                    className="w-full lg:w-[500px] h-[40px] flex justify-start items-center p-2 border border-gray-600 rounded-md"
                    onChange={(e)=>setPhoneNumber(e.target.value)}
                    />
                </div>
                <div className="w-full h-auto flex flex-col justify-center items-start space-y-2">
                    <label htmlFor="vehicleNumber" className="w-auto h-auto flex justify-start items-center">Vehicle Number</label>
                    <input 
                    type="text"
                    name="vehicleNumber"
                    id="vehicleNumber" 
                    value={vehicleNumber}
                    placeholder="Please enter your vehicle number..." 
                    autoComplete="off"
                    className="w-full lg:w-[500px] h-[40px] flex justify-start items-center p-2 border border-gray-600 rounded-md"
                    onChange={(e)=>setVehicleNumber(e.target.value)}
                    />
                </div>
                <div className="w-full h-auto flex flex-col justify-center items-start space-y-2">
                    <label htmlFor="vehicleDescription" className="w-auto h-auto flex justify-start items-center">Vehicle Description</label>
                    <input 
                    type="text"
                    name="vehicleDescription"
                    id="vehicleDescription" 
                    value={vehicleDescription}
                    placeholder="Please enter your vehicle's description..." 
                    autoComplete="off"
                    className="w-full lg:w-[500px] h-[40px] flex justify-start items-center p-2 border border-gray-600 rounded-md"
                    onChange={(e)=>setVehicleDescription(e.target.value)}
                    />
                </div>
                
                <div className="w-full lg:w-[200px] h-[45px] flex flex-col justify-center items-center p-4 bg-black text-white rounded-md hover:cursor-poiner hover:bg-gray-800">
                    <button 
                    type="submit"
                    className="w-full h-full flex justify-center items-center hover:cursor-pointer rounded-md"
                    >
                     Save Changes
                    </button>
                </div>
                
            </div>
       </form>
      
    </div>
      )
  }    
 
}

export default ManageAccount;
