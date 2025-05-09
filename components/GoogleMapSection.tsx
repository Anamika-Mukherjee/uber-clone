//component that displays google map in rider and driver dashboard
"use client";
import React, {useState, useCallback, useEffect} from "react"
import { DirectionsRenderer, GoogleMap, MarkerF, OverlayView, OverlayViewF } from "@react-google-maps/api"
import { useSourceContext } from "@/context/SourceContext";
import { useDestinationContext } from "@/context/DestinationContext";
import { useRideLocationContext } from "@/context/RideLocationContext";
import { useUser } from "@clerk/nextjs";
import { useErrorContext } from "@/context/ErrorContext";

//google map id
const google_map_id = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID!;

function GoogleMapSection({role}: {role:string}) {

  const containerStyle = {
    width: "100%",
    height: "100%",
    border: "1px solid #9ca3af",
    borderRadius: "15px",
    boxShadow: "var(--map-shadow-overall)"
  }

  const {source} = useSourceContext();
  const {destination} = useDestinationContext();
  const {rideLocation} = useRideLocationContext();
  const [markerPosition, setMarkerPosition] = useState<{lat: number, lng: number}[]>([{lat: 0, lng: 0}])
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [dirRoutePoints, setDirRoutePoints] = useState<google.maps.DirectionsResult | null>(null);
  const {user} = useUser();
  const {setError} = useErrorContext();

  //initialize default value for location where map will be centered on load
  const [center = {
    lat: 28.7041,
    lng: 77.2,
  }, setCenter] = useState<{lat: number, lng: number}>();

  //function to set directions between source and destination
  const directionRoute = ()=>{
    //create new object google maps directions service
    const DirectionsService = new google.maps.DirectionsService();

    //set origin and destination latitude-longitude and travel mode in directions service
    DirectionsService.route({
      origin: {
        lat: source.lat,
        lng: source.lng,
      }, 
      destination: {
        lat: destination.lat,
        lng: destination.lng
      },
      travelMode: google.maps.TravelMode.DRIVING
    }, (result, status)=>{
      if(status === google.maps.DirectionsStatus.OK){
          setDirRoutePoints(result);
      }
      else{
        console.log("Error setting directions");
        setError("Error setting directions");
      }
    })
  }

  
  useEffect(()=>{
    //move map center to source location when source is set 
    if(source.lat && source.lng && map){
      map.panTo({
        lat: source.lat,
        lng: source.lng
      })
      setCenter(source);
    }
    //set directions between source and destination if both are present using directionRoute() custom function
    if(source.lat && source.lng && destination.lat && destination.lng){
      directionRoute();
    }
  }, [source]);

  useEffect(()=>{
    //move map center to destination location when destination is set 
    if(destination.lat && destination.lng && map){
      map.panTo({
        lat: destination.lat,
        lng: destination.lng, 
        
      })
      setCenter(destination);
    }
    //set directions between source and destination if both are present using directionRoute() custom function
    if(source.lat && source.lng && destination.lat && destination.lng){
      directionRoute();
    }
 }, [destination]);

  useEffect(() => {
    //set marker position to the location of available rides
    if(user && user.id && rideLocation && rideLocation.length){
      let marker: {lat:number, lng: number}[]=[];
      //store all the available rides locations into array to display markers for all these locations
      rideLocation.map((ride)=>{  
        marker.push({lat: ride.lat, lng: ride.lng});  
      })
      setMarkerPosition(marker);
    }
  }, [rideLocation]);

  //initialize map to center on the location set in "center" object
  const onLoad = useCallback(function callback(map: google.maps.Map) {

    //create a bounding box centered on "center" location
    const bounds = new window.google.maps.LatLngBounds(center);
    
    //adjust map viewports to include the given bounds
    map.fitBounds(bounds);

    //set zoom value when map becomes idle (finished moving or rendering)
    const listener = map.addListener("idle", () => {
      map.setZoom(10); 
      //remove event listener to allow changing zoom level by user
      window.google.maps.event.removeListener(listener); 
    });

    //store the map in state
    setMap(map);
  }, [])

  //remove map from state when component unmounts
  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  //display google map
  return  (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{mapId: google_map_id}}
    >
      {/* markers for source and destination */}
     {(source.lat && source.lng) ? (
      <MarkerF
      position={{lat: source.lat, lng: source.lng}}
      >
        <OverlayViewF
          position={{lat: source.lat, lng: source.lng}}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <div className="bg-white p-2 w-[300px] flex justify-center items-center flex-wrap rounded-lg border-2 border-black">
          <p className="text-sm">
          {source.label}
          </p>
          </div>
        
        </OverlayViewF>
      </MarkerF>   
     ): null} 

     {(destination.lat && destination.lng) ? (
      <MarkerF
      position={{lat: destination.lat, lng: destination.lng}}
      >
        <OverlayView
         position={{lat: destination.lat, lng: destination.lng}}
         mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
         >
          <div className="bg-white p-2 w-[300px] flex justify-center items-center flex-wrap rounded-lg border-2 border-black">
            <p className="text-sm">
            {destination.label}
            </p>
          </div>
          
        </OverlayView>
      </MarkerF>
     ): null} 
     {/* display a different marker for available rides when rides are available */}
     {
      ( rideLocation && rideLocation.length) ? (
        <div>
        {rideLocation.map((ride, index)=>(
          <MarkerF 
           key={index}
           position={markerPosition[index]}
           icon={{
               url: "/assets/car-top.png",
               scaledSize: new google.maps.Size(50, 20)
           }}
         >
          </MarkerF>
        ))} 
         </div>
      ):null
    }
    {/* display directions between source and destination when these values are set */}
    {
      (dirRoutePoints && source.lat && source.lng && destination.lat && destination.lng) && (
        <DirectionsRenderer
          directions={dirRoutePoints}
          options={{
            polylineOptions: {
              strokeColor: "#08f613",
              strokeWeight: 5
            },
            suppressMarkers: true,
          }}
        />
      )
    }
    </GoogleMap>
  )
}

export default React.memo(GoogleMapSection);