//wrapper component to wrap components inside google maps script to load google map 
"use client";
import { LoadScript } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

const GoogleMapsWrapper = ({ children }: { children: React.ReactNode }) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries} id="google-map-script">
      {children}
    </LoadScript>
  );
};

export default GoogleMapsWrapper;
