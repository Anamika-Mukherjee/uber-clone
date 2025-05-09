//component for autocomplete source and destination input values in search section using google places autocomplete api
"use client"
import { useDestinationContext } from "@/context/DestinationContext";
import { useSourceContext } from "@/context/SourceContext";
import React, { useEffect, useState } from "react";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import { setKey, fromLatLng} from "react-geocode";
import Image from "next/image";
import { useErrorContext } from "@/context/ErrorContext";
import { useInfoContext } from "@/context/InfoContext";

interface inputTypeProps{
  input: string,
  placeHolder: string,
}

const GoogleAutoComplete = ({inputType }: {inputType: inputTypeProps}) => {
    const [address, setAddress] = useState<string>(""); 
    const [isClear, setIsClear] = useState<boolean>(false);
    const [isClearBtnClicked, setIsClearBtnClicked] = useState<boolean>(false);
    const {setSource} = useSourceContext();
    const {setDestination} = useDestinationContext();
    const {setError} = useErrorContext();
    const {setInfo} = useInfoContext();

    //set google map api key
    setKey(process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!);

    //set default values for source, destination and address values
    useEffect(()=>{
      setSource({lat: 0, lng: 0, label: ""});
      setDestination({lat: 0, lng: 0, label: ""});
      setAddress("");
    }, []);

    //implement clear button action
    useEffect(()=>{

      //clear input value if clear button clicked
      if(isClearBtnClicked){
        setIsClear(true);
      }
      else{
        //set initial values to source, destination and address after clearing input fields when clear button is clicked
        setIsClear(false);
        setAddress("");
        if(inputType.input === "source"){
          setSource({lat: 0, lng: 0, label: ""});
        }
        else if(inputType.input === "destination"){
          setDestination({lat: 0, lng: 0, label: ""});
        }
      }
    }, [isClearBtnClicked])


    useEffect(()=>{
      //allow users to enter input if after clearing input field when clear button is clicked
      if(isClear){
        setIsClearBtnClicked(false);
      }
    }, [isClear]);

    //event handler for clear button 
    const handleClearClick = ()=>{
      setIsClearBtnClicked(true);
    }

    //set location address from latitude and longitude values
    const currentLocationAddress = (lat: number, lng: number)=>{
      fromLatLng(lat, lng)
        .then(({ results }) => {
          const locationAddress = results[0].formatted_address;
          setAddress(locationAddress);
          if(inputType.input === "source"){
            setSource({
              lat,
              lng,
              label: locationAddress,
            })
          } 
          else{
            setDestination({
              lat,
              lng,
              label: locationAddress,
            })
          }
        })
        .catch((err)=>{
          console.log(err);
          setError(err.message);
        });
    }

    //event handler for navigate (location) button click
    const handleLocationClick = ()=>{
      if("geolocation" in navigator){
        //get current location latitude and longitude from current position 
        navigator.geolocation.getCurrentPosition((position)=>{
          const lat = position.coords.latitude;
          const lng = position.coords.longitude; 
          currentLocationAddress(lat, lng);         
        },
        (error)=>{
          console.log(error.message);
          setError(error.message);
        })      
      }
      else{
        console.log("Cannot access device location");
        setInfo("Cannot access device location");
      }      
    }

    //event handler for input change event for source and destination input fields
    const handleChange = (placeName: string) => {
      //store address value entered in input into state variable
      setAddress(placeName);
    };

    //event handler for selection of autocomplete suggestions
    const handleSelect = (placeName: string) => {
        geocodeByAddress(placeName)
        .then((results) => getLatLng(results[0])  
        )
        .then((latLng) => {
          setAddress(placeName);
          if(inputType.input === "source"){
            setSource({
              lat: latLng.lat,
              lng: latLng.lng,
              label: placeName,
            })
          }
          else{
            setDestination({
              lat: latLng.lat,
              lng: latLng.lng,
              label: placeName
            })
          } 
        })
        .catch((error) => console.error('Error', error));    
    };   
       
    //function to handle error in autocomplete api
    const handleError = (status: string, clearSuggestions: ()=>void)=>{
      if(status === "ZERO_RESULTS"){
        console.log("Location not found");
        setError("Location not found");
      }
      else{
        console.log("Google Map Error with status:", status);
        setError(`Google Map error with status: ${status}`)
        clearSuggestions();
      }
    }
   
    return (
      <div className="w-full h-full flex justify-start items-center">
      
        <PlacesAutocomplete
          value={isClear?"":address}
          debounce={1000}
          onChange={handleChange}
          onSelect={handleSelect}
          onError = {handleError}
          shouldFetchSuggestions={address.length>3}
        
        >
          {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
            <div className="w-full h-auto flex flex-col justify-center items-start">
              <input
                {...getInputProps({
                  placeholder: inputType.placeHolder,
                  className: 'location-search-input outline-none h-[30px] w-full select-none',
                })}
                
              />
              <div className={suggestions.length?(inputType.input === "source"?"source-autocomplete":"destination-autocomplete"):"hidden"}>
              <div className={suggestions.length?"autocomplete-dropdown":"hidden"}>
                {loading && <div>Loading...</div>}
                {suggestions.map((suggestion) =>  (
                    <div
                      {...getSuggestionItemProps(suggestion, {
                        className : suggestion.active?"suggestion-item-active":"suggestion-item",
                      })}
                      key={suggestion.placeId}
                    >
                      <span>{suggestion.description}</span>
                    </div>
                  )
                )}
              </div>
              </div>
            </div>
          )}
        </PlacesAutocomplete>
        <div className={address?"clear-button":"hidden"}>
          <button
            type="button"
            className="hover:cursor-pointer"
            onClick={handleClearClick}>
              &times;
          </button>
        </div>
        {(inputType.input === "source" && !address) && (
          <button
          type="button"
          onClick={handleLocationClick}
          className="w-[30px] h-[30px] flex justify-center items-center hover:cursor-pointer"
          >
            <Image 
            src="/assets/navigate.png"
            alt="navigate"
            width={25}
            height={25}/>
          </button>
        )}
      </div>
    );
};

export default GoogleAutoComplete;
