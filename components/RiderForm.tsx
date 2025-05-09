//component that displays onboarding form for rider for getting rider details
"use client";
import React, {useState} from "react";
import { useUser } from "@clerk/nextjs";
import { z } from "zod";
import { useErrorContext } from "@/context/ErrorContext";
import { useInfoContext } from "@/context/InfoContext";

//define schema for rider form with inputs full name and phone number
const riderSchema =  z.object({
    fullName: z.string()
              .min(2, "Full name must be atleast 2 characters")
              .max(50, "Full name cannot be more than 50 characters"),
    phoneNumber: z.string()
                 .regex(/^\d{10}$/, "Contact number must be exactly 10 digits")
                          
});

//define schema type for rider form
type RiderSchema = z.infer<typeof riderSchema>;

const RiderForm = ({role}: {role: string}) => {

      const {user} = useUser();
      const [formData, setFormData] = useState({
          fullName: "",
          phoneNumber: "",
      });
      const [loading, setLoading] = useState<boolean>(false);
      const {setError} = useErrorContext();
      const {setInfo} = useInfoContext();
      const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

      //function to store rider details in database
      const storeRiderDetails = async (value: RiderSchema)=>{
        if(user && user.id && role){
            const formValues = new FormData();
            const {fullName, phoneNumber} = value as RiderSchema;
             
            //append input values to form data to be sent to server
            formValues.append("role", role);
            formValues.append("userId", user.id);
            formValues.append("fullName", fullName);
            formValues.append("phoneNumber", phoneNumber);
    
           try{
            setLoading(true);
            //api request to server to store rider details in database
            const response = await fetch("/api/setUserDetails", {
              method: "POST",
              body: formValues,           
             });
             
             const data = await response.json();
             console.log(data.message);

             if(response.status !== 200){
              setError(data.message);
              //if rider details not stored in firestore database, api to delete rider from clerk database
              const res = await fetch("/api/deleteUser", {
                method: "POST",
                body: JSON.stringify({
                  userId: user.id,
                }),
                headers: {"Content-Type": "application/json"}
              });

              const deleteData = await res.json();

              if(res.status !== 200){
                setError(deleteData.message);
                return;
              }
              //display message after rider deleted successfully
              console.log("Sign up failed");
              setInfo("Sign up failed");
             }
             else{
               //return api response if user details stored in database successfully
               return data;
             }
           }
           catch(err){
               console.log(err);
           } 
           finally{
            setLoading(false);
           } 
        }
      }

      //event handler for input change event
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        //store input values in object
        setFormData(prev => ({ ...prev, [name]: value }));
      };

      //submit event handler for form submit event
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //validate form data using safeParse() provided by zod
        const result = riderSchema.safeParse(formData);
    
        if (!result.success) {
          //if validation fails, store errors in object
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          //store validation errors in state variable
          setValidationErrors(fieldErrors);
        } 
        else {
          //if validation successful, store empty object in error state variable
          setValidationErrors({});
          //call function to store rider details in database through api with the validated input values
          const response = await storeRiderDetails(result.data);
          //if data stored successfully, redirect to rider dashboard page
          if(response){
            window.location.href = "/account/rider-account";
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
    
  //display rider onboarding form    
  return (
       <form onSubmit={handleSubmit} className="rider-form">
            <div className="w-full h-auto flex flex-col justify-center items-center space-y-4">
                <h1 className="text-2xl font-semibold tracking-wide">
                    Rider Onboarding Form
                </h1>
                <h3 className="text-base">Please provide the following details before proceeding</h3>
            </div>
            <div className="rider-onboarding-form-container">
                <div className="form-item">
                    <label htmlFor="fullName" className="form-label">Full Name</label>
                    <input 
                            type="text"
                            name="fullName"  
                            id="fullName"
                            value={formData.fullName}
                            placeholder="Please enter your name..." 
                            autoComplete="off"
                            className="form-input"
                            onChange={handleChange}
                    />
                    <p className="text-red-600 text-sm">{validationErrors.fullName}</p>
                </div>
                <div className="form-item">
                    <label htmlFor="phoneNumber" className="form-label">Contact Number</label>
                    <input 
                    type="text"
                    name="phoneNumber"
                    id="phoneNumber" 
                    value={formData.phoneNumber}
                    placeholder="Please enter your contact number..." 
                    autoComplete="off"
                    className="form-input"
                    onChange={handleChange}
                    />
                    <p className="text-red-600 text-sm">{validationErrors.phoneNumber}</p>
                </div>
                <div className="submit-button-container">
                    <button 
                    type="submit"
                    className="submit-button"
                    >
                     Submit
                    </button>
                </div>
            </div>
       </form>
  )
}

export default RiderForm;
