
declare interface ErrorContextInterface {
    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;
};

declare interface InfoContextInterface {
    info: string;
    setInfo: React.Dispatch<React.SetStateAction<string>>;
}

declare interface SourceObject{
   source: {
     lat: number,
     lng: number,
     label: string
   };
   setSource: (value: {lat: number, lng: number, label: string})=>void;
}

declare interface DestinationObject{
  destination: {
    lat: number,
    lng: number,
    label: string,
  };
  setDestination: (value: {lat:number, lng: number, label: string})=>void;
}

declare interface DistanceContextInterface{
    distance: number;
    setDistance: (value: number)=>void;
}

declare interface RideInterface{
  driverId: string;
  lat: number;
  lng: number;
};

declare interface RideLocationInterface{
    rideLocation: RideInterface[];
    setRideLocation: (value: RideInterface[] | ((prev: RideInterface[]) => RideInterface[]))=>void;
}

declare interface CreateOrderResponse{
    data:{
        cf_order_id: string,
        created_at: string,
        customer_details: {
          customer_id: string,
          customer_name: string,
          customer_email: string,
          customer_phone: string,
          customer_uid: string,
        },
        entity: string,
        order_amount: number,
        payment_session_id: string,
        order_currency: string,
        order_expiry_time: string,
        order_id: string,
        order_meta: {
          return_url: string,
          payment_methods: string,
          notify_url: string,
        },
        order_note: string,
        order_splits: object[],
        order_status: string,
        order_tags: {},
        terminal_data: {},
        cart_details: {}
    }
}

declare interface PaymentDetails{
    orderId: string;
    customerId: string;
    customerEmail: string;
    customerName: string;
    time: number;
    amount: number;
    currency: string;
    paymentId: number;
    paymentMethod: {
      [key: string]: string;
    }
    paymentStatus: string;
}