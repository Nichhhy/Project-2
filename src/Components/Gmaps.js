import { useState, useEffect } from "react";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import SVY21 from "./SVY21";
import axios from "axios";
import { onChildAdded, push, ref as databaseRef, set } from "firebase/database";
import { database } from "../firebase";
import "./Popup.css";

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
    width: "1200px",
    height: "800px",
  };

  const [modal, setModal] = useState(false);

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
      <button type="button" onClick={() => info()}>
        click here
      </button>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_API_KEY}>
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
        <div className="modal">
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content">
            <h2>Address : {currentCarpark.val.address}</h2>
            <p>
              Total Lots :{" "}
              {carparkInfo[0].carpark_info[0].total_lots !== undefined
                ? carparkInfo[0].carpark_info[0].total_lots
                : null}
            </p>
            <p>
              Lots Available :{" "}
              {carparkInfo[0].carpark_info[0].lots_available !== undefined
                ? carparkInfo[0].carpark_info[0].lots_available
                : null}
            </p>
            <button className="close-modal" onClick={toggleModal}>
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
