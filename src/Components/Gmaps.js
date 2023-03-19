import { useState, useEffect, useContext } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import SVY21 from "./SVY21";
import axios from "axios";
import { onChildAdded, ref as databaseRef, set } from "firebase/database";
import { database } from "../firebase";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Outlet } from "react-router-dom";
import { LoginInfo } from "../App";

const DB_IMAGE_KEY = "Carparks";

export default function Gmaps() {
  // Initialization
  var cv = new SVY21();
  const { loggedInUser, setLoggedInUser } = useContext(LoginInfo);
  const [carpark, setCarpark] = useState([]);
  const [carparkInfo, setCarparkInfo] = useState([]);
  const [center, setCenter] = useState({
    lat: 1.362099,
    lng: 103.763447,
  });
  const [currentCarpark, setCurrentCarpark] = useState([]);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    const messagesRef = databaseRef(database, DB_IMAGE_KEY);
    // onChildAdded will return data for every child at the reference and every subsequent new child
    onChildAdded(messagesRef, (data) => {
      // Add the subsequent child to local component state, initialising a new array to trigger re-render

      setCarpark((carpark) => [
        ...carpark,
        {
          key: data.val().car_park_no,
          val: data.val(),
          position: {
            lat: cv.computeLatLon(data.val().y_coord, data.val().x_coord).lat,
            lng: cv.computeLatLon(data.val().y_coord, data.val().x_coord).lon,
          },
        },
      ]);
    });
  }, []);

  const info = (cp) => {
    axios
      .get(`https://api.data.gov.sg/v1/transport/carpark-availability`)
      .then((response) => {
        setCarparkInfo(
          [...response.data.items[0].carpark_data].filter(
            (item) => item.carpark_number === cp.key
          )
        );

        // Write remaining logic once we understand response format
      })
      .then(() => {
        setCenter(cp.position);
        setCurrentCarpark(cp);
      })
      .then(() => toggleModal());
  };

  const addFavourite = () => {
    loggedInUser.favs === null
      ? set(databaseRef(database, "users/" + loggedInUser.userID), {
          favourites: [currentCarpark.val.car_park_no],
        })
          .then(() => {
            setLoggedInUser({
              ...loggedInUser,
              favs: [currentCarpark.val.car_park_no],
            });
          })
          .catch((error) => {
            console.log(error);
          })
      : set(databaseRef(database, "users/" + loggedInUser.userID), {
          favourites: [...loggedInUser.favs, currentCarpark.val.car_park_no],
        })
          .then(() => {
            setLoggedInUser({
              ...loggedInUser,
              favs: [...loggedInUser.favs, currentCarpark.val.car_park_no],
            });
          })
          .catch((error) => {
            console.log(error);
          });
  };

  const removeFav = () => {
    const tasksRef = databaseRef(
      database,
      "users/" + loggedInUser.userID + "/favourites"
    );

    const newArrOfFavs = loggedInUser.favs.filter(
      (item) => item !== currentCarpark.val.car_park_no
    );
    set(tasksRef, newArrOfFavs);
    setLoggedInUser({
      ...loggedInUser,
      favs: newArrOfFavs,
    });
  };

  const containerStyle = {
    width: "90vw",
    height: "50vh",
  };

  const toggleModal = () => {
    setModal(!modal);
  };

  if (modal) {
    document.body.classList.add("active-modal");
  } else {
    document.body.classList.remove("active-modal");
  }

  return (
    <div>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
          {carpark.map((cp) => (
            <Marker
              key={cp.key}
              position={cp.position}
              onClick={() => {
                info(cp);
              }}
            />
          ))}
        </GoogleMap>
      </LoadScript>
      {modal && (
        <Modal show={modal} onHide={toggleModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Address : {currentCarpark.val.address}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Total Lots :{" "}
            {carparkInfo.length /* [0].carpark_info[0].total_lots */ === 0
              ? "No Lots avaialble"
              : carparkInfo[0].carpark_info[0].total_lots}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={toggleModal}>
              Close
            </Button>
            {loggedInUser.favs === null ||
            loggedInUser.favs.filter(
              (item) => item === currentCarpark.val.car_park_no
            ).length < 1 ? (
              <Button
                variant="primary"
                onClick={() => {
                  addFavourite();
                }}
              >
                Favourite
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  removeFav();
                }}
              >
                Remove Favourite
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
