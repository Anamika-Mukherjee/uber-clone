//component to display error messages
"use client";
import React, { useState } from "react";

const ErrorMessage = ({errorMessage}: {errorMessage: string}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  //close error message when clicked on close button
  const handleClose = ()=>{
     setIsOpen(false);
  }

  return isOpen && (
    <div className="error-container">
    <div className="error-message-container">
      <p className="text-sm flex justify-start items-center flex-wrap text-red-500">Error: {errorMessage}</p>
    </div>
    <div className="error-close">
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

export default ErrorMessage;
