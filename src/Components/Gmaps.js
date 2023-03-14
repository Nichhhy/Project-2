import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import SVY21 from "./SVY21";
import axios from "axios";
import { onChildAdded, ref as databaseRef } from "firebase/database";
import { database } from "../firebase";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Outlet } from "react-router-dom";

const DB_IMAGE_KEY = "Carparks";

export default function Gmaps() {
  // Initialization
  var cv = new SVY21();

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
            {carparkInfo[0].carpark_info[0].total_lots !== undefined
              ? carparkInfo[0].carpark_info[0].total_lots
              : null}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={toggleModal}>
              Close
            </Button>
            <Button variant="primary" onClick={toggleModal}>
              Favourite
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      <Outlet />
    </div>
  );
}
