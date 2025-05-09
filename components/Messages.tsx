//component to show notification messages in rider and driver dashboard
"use client";
import { useUser } from "@clerk/nextjs";
import { DocumentData } from "firebase-admin/firestore";
import React, {useEffect, useState} from "react";
import MessageCard from "./MessageCard";
import { useErrorContext } from "@/context/ErrorContext";

const Messages = () => {
    const {user} = useUser();
    const [loading, setLoading] = useState<boolean>(false);
    const {setError} = useErrorContext();
    const [notifications, setNotifications] = useState<DocumentData[]>();

    useEffect(()=>{
        if(user && user.id && user.publicMetadata.role){
            const fetchNotifications = async ()=>{
             try{
                setLoading(true);
                //api request to retrieve notifications from server
                const response = await fetch("/api/retrieveNotifications", {
                    method: "POST",
                    body: JSON.stringify({
                        userId: user.id,
                        role: user.publicMetadata.role,
                    }),
                    headers: {"Content-Type": "application/json"}
                });

                const data = await response.json();
                console.log(data.message);

                if(response.status !== 200){
                    setError(data.message);
                    return;
                }
                
                //sort retrieved notifications in reverse chronology and store in array state variable
                const sortedNotifications: DocumentData[] = sortNotifications(data.messages) as DocumentData[];
                setNotifications(sortedNotifications);
             }
             catch(err){
               console.log(err);
             }
             finally{
                setLoading(false);
             }
            };
            fetchNotifications();
        }  
    }, [user]);

    //function to sort notifications in reverse chronology
    const sortNotifications = (messages: DocumentData[])=>{
        return [...messages].sort((msg1, msg2)=>{
          const time1 = Number(msg1.data.requestTime);
          const time2 = Number(msg2.data.requestTime);
          return time2 - time1;
        });  
    }

    //display loading message if data not loaded   
    if(loading){
        return (
        <div className="w-screen h-screen flex flex-col justify-center items-center p-4">
            <p className="tracking-wider">Loading</p>
        </div>
        )
      } 

  //display all notifications  
  return (
    <div className="w-screen h-full flex flex-col justify-start items-center space-y-10">
        <p>All Notifications</p>
        <div className="w-full h-auto flex flex-col justify-start items-start space-y-4">
        {notifications && notifications.map((notification)=>(
            
            <div 
             key={notification.messageId}
             className="w-full h-auto flex justify-start items-center">                   
                <MessageCard notification = {notification}/>   
            </div>
            )
            )}
        
        </div>
    </div>
  )
}

export default Messages;
