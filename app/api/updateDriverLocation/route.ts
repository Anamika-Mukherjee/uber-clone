//api to update driver location in database
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    //get driver id and driver location from request body
    const { driverId, lat, lng} = await req.json();

    //return with error message if latitude and longitude are not numbers
    if (typeof lat !== "number" || typeof lng !== "number") {
        return NextResponse.json(
          { message: "Invalid latitude or longitude" },
          { status: 400 }
        );
      }

    //get driver document from firestore database through driver id
    const driverRef = db.collection("users").doc(driverId);
    const driverUser = await driverRef.get();
    
    //return with error message if driver document does not exist
    if(!driverUser){
      return NextResponse.json({message: "Driver document does not exist"}, {status: 400});
    }

    //update driver location in driver document in database
    const locationUpdate = await driverRef.set({
      driverLocation: {
        lat,
        lng,
      },
    },
    {merge: true}
    );
     
    //return with error message if location not updated 
    if(!locationUpdate){
      return NextResponse.json({message: "Could not update driver location in database"}, {status: 400});
    }

    //return with success message if driver location updated successfully
    return NextResponse.json({ message: "Location updated successfully" }, { status: 200 });  
  } 
  catch (err) {
    return NextResponse.json({message: "Error: Something went wrong"}, {status: 500});
  }
}


