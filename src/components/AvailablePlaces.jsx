import { useState, useEffect } from "react"
import Places from "./Places.jsx"

import Error from "./Error.jsx"

export default function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState()

  useEffect(() => {
    async function fetchPlaces() {
      setIsLoading(true)

      try {
        const response = await fetch("http://localhost:3000/places")
        const resData = await response.json()

        if (!response.ok) {
          // 200, 300  || error: 400, 500
          throw new Error("Failed to fetch places")
        }
        setAvailablePlaces(resData.places)
      } catch (error) {
        setError({
          message:
            error.message || "Could not fetch places, please try again later.",
        })
      }
      setIsLoading(false)
    }

    fetchPlaces()
  }, [])

  if (error) {
    return <Error title="An error occured!" message={error.message} />
  }

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      isLoading={isLoading}
      loadingText="Fetching place data..."
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  )
}
