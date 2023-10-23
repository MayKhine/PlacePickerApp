import { useState, useEffect } from "react"
import Places from "./Places.jsx"
import { sortPlacesByDistance } from "../loc.js"
import Error from "./Error.jsx"
import { fetchAvailablePlaces } from "../http.js"

export default function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState()

  useEffect(() => {
    async function fetchPlaces() {
      setIsLoading(true)

      try {
        const places = await fetchAvailablePlaces()
        navigator.geolocation.getCurrentPosition((position) => {
          const sortedPlaces = sortPlacesByDistance(
            places,
            position.coords.latitude,
            position.coords.longitude
          )
          setAvailablePlaces(sortedPlaces)
          setIsLoading(false)
        })
      } catch (error) {
        setError({
          message:
            error.message || "Could not fetch places, please try again later.",
        })
        setIsLoading(false)
      }
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
