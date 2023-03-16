import { useState, useEffect, useContext } from "react";
import { LoginInfo } from "../App";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import SVY21 from "./SVY21";
import axios from "axios";
import {
  onChildAdded,
  ref as databaseRef,
  push,
  set,
  update,
  ref,
  child,
  get,
} from "firebase/database";
import { database } from "../firebase";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Outlet } from "react-router-dom";

const DB_IMAGE_KEY = "Carparks";
const DB_USER_FAVES_KEY = "Favorites";

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
  const [currentFaves, setCurrentFaves] = useState([
    "dummy data 1",
    "dummy data 2",
  ]);

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

  const containerStyle = {
    width: "90vw",
    height: "50vh",
  };

  const toggleModal = () => {
    setModal(!modal);
  };

  const addFave = (carparkKey) => {
    setCurrentFaves((faves) => [...faves, carparkKey]);
  };

  useEffect(() => {
    console.log(currentFaves);
  }, [currentFaves]);

  const saveFavorites = () => {
    let userEmail = loggedInUser.email;
    const favouriteList = databaseRef(
      database,
      DB_USER_FAVES_KEY + { userEmail }
    );
    const newFavoriteRef = push(favouriteList);
    update(newFavoriteRef, {
      user: loggedInUser.email,
      favorites: currentFaves,
    });
  };

  // const saveFavorites = () => {
  //   const reference = ref(database, DB_USER_FAVES_KEY);

  //   set(reference, {
  //     user: { email: loggedInUser.email, faves: currentFaves },
  //   });
  // };

  const readInfo = () => {
    const dbRef = ref(database);
    get(child(dbRef, `Favorites/NQcO794tTe1OS7564iO`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  function writeNewPost(email) {
    // A post entry.
    const postData = {
      email: email,
    };

    // Get a key for a new Post.
    const newPostKey = push(child(ref(database), DB_USER_FAVES_KEY)).key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    const updates = {};
    updates["/Favorites/" + newPostKey] = postData;

    return update(ref(database), updates);
  }

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
              ? "No Lots available"
              : carparkInfo[0].carpark_info[0].total_lots}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={toggleModal}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                readInfo();
              }}
            >
              Favourite
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      <Outlet />
    </div>
  );
}
