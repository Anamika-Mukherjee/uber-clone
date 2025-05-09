//card component to display notification
"use client";
import { DocumentData } from "firebase-admin/firestore"
import React, { useState } from "react";
import MessageDialog from "./MessageDialog";
import { convertToDateTime } from "@/lib/utils";

const MessageCard = ({notification}: {notification: DocumentData}) => {
    const [openDialog, setOpenDialog] = useState<boolean>(false);

  return (
    <div className="message-card-dialog-container">
    <div className="message-card-container" onClick={()=>setOpenDialog(true)}>
        <div className="w-full h-auto flex justify-start items-center border-b-2 border-dotted border-green-700 p-2 ">
            <p>{notification.data.title}</p>
        </div>
        <div className="w-full h-auto flex flex-col justify-start items-center px-2 py-4">
            <p className="w-full h-[30px] truncate">{notification.data.body}</p>
            <p className="w-full h-auto">{notification.data.requestTime && convertToDateTime(Number(notification.data.requestTime))}</p>
        </div>
        
    </div>
    {openDialog && (
            <MessageDialog notification = {notification} openDialog = {openDialog} setOpenDialog={setOpenDialog}/>
    )}
    </div>
  )
}

export default MessageCard;
