//component to display success and other miscellaneous messages
"use client";
import React, { useState } from "react";

const InfoMessage = ({infoMessage}: {infoMessage: string}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  
    //close message if close button clicked
    const handleClose = ()=>{
       setIsOpen(false);
    }
  
    return isOpen && (
      <div className="info-container">
      <div className="info-message-container">
        <p className="text-sm flex justify-start items-center flex-wrap text-green-800">{infoMessage}</p>
      </div>
      <div className="info-close">
        <button 
         type="button" 
         onClick = {handleClose}
         className="w-full h-[20px] flex justify-center items-center hover:bg-gray-300 rounded-[30px] hover:cursor-pointer">
          <p className="text-base">&times;</p>
        </button>
         
      </div>
      </div>
    )
}

export default InfoMessage
