import { useRef, useState, useCallback, useEffect } from "react"

import Places from "./components/Places.jsx"
import Modal from "./components/Modal.jsx"
import DeleteConfirmation from "./components/DeleteConfirmation.jsx"
import logoImg from "./assets/logo.png"
import AvailablePlaces from "./components/AvailablePlaces.jsx"
import { fetchUserPlaces, updateUserPlaces } from "./http.js"
import Error from "./components/Error.jsx"
import { useFetch } from "./hooks/useFetch.js"

function App() {
  const selectedPlace = useRef()

  const [modalIsOpen, setModalIsOpen] = useState(false)

  const [errorUpdatingPlaces, setErrorUpdaingPlaces] = useState()

  // const [userPlaces, setUserPlaces] = useState([])
  // const [isFetching, setIsFetching] = useState(false)
  // const [error, setError] = useState()
  const {
    isFetching,
    error,
    fetchedData: userPlaces,
    setFetchedData: setUserPlaces,
  } = useFetch(fetchUserPlaces, [])

  // useEffect(() => {
  //   async function fetchPlaces() {
  //     setIsFetching(true)
  //     try {
  //       const userPlaces = await fetchUserPlaces()
  //       setUserPlaces(userPlaces)
  //     } catch (error) {
  //       setError({ message: error.message || "Failed to fetch user places." })
  //     }
  //     setIsFetching(false)
  //   }
  //   fetchPlaces()
  // }, [])

  function handleStartRemovePlace(place) {
    setModalIsOpen(true)
    selectedPlace.current = place
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false)
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = []
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces
      }
      return [selectedPlace, ...prevPickedPlaces]
    })

    //sending req to store data
    try {
      await updateUserPlaces([selectedPlace, ...userPlaces])
    } catch (error) {
      setUserPlaces(userPlaces)
      setErrorUpdaingPlaces({
        message: error.message || "Failed to update places.",
      })
    }
  }

  const handleRemovePlace = useCallback(
    async function handleRemovePlace() {
      setUserPlaces((prevPickedPlaces) =>
        prevPickedPlaces.filter(
          (place) => place.id !== selectedPlace.current.id
        )
      )

      try {
        //sending http req to delete
        await updateUserPlaces(
          userPlaces.filter((place) => place.id !== selectedPlace.current.id)
        )
      } catch (error) {
        setUserPlaces(userPlaces)
        setErrorUpdaingPlaces({
          message: error.message || "Failed to delete place.",
        })
      }
      setModalIsOpen(false)
    },
    [userPlaces, setUserPlaces]
  )

  function handleError() {
    setErrorUpdaingPlaces(null)
  }
  return (
    <>
      <Modal open={errorUpdatingPlaces}>
        onClose={handleError}
        {errorUpdatingPlaces && (
          <Error
            title={"An error occured"}
            message={errorUpdatingPlaces.message}
            onConfirm={handleError}
          />
        )}
      </Modal>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title={"An error occurred"} message={error.message} />}
        {!error && (
          <Places
            title="I'd like to visit ..."
            fallbackText="Select the places you would like to visit below."
            places={userPlaces}
            onSelectPlace={handleStartRemovePlace}
            isLoading={isFetching}
            loadingText={"Fetching your places..."}
          />
        )}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  )
}

export default App
