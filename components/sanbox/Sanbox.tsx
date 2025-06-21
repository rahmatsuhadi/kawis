"use client"

import { useGeolocation } from "@/context/geolocation-context"


export default function Sanbox(){
    const {address,location} = useGeolocation()

    return(
        <div>
            <h1>
                {address}
            </h1>
            <h2>
                {JSON.stringify(location)}</h2>
        </div>
    )
}