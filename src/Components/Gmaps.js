import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import SVY21 from "./SVY21";
import axios from "axios";
import { onChildAdded, ref as databaseRef } from "firebase/database";
import { database } from "../firebase";
import Popup from "./Popup";

const DB_IMAGE_KEY = "Carparks";

export default function Gmaps() {
  // Initialization
  var cv = new SVY21();
  const [carpark, setCarpark] = useState([]);
  const [center, setCenter] = useState({
    lat: 1.362099,
    lng: 103.763447,
  });
  const [currentCarpark, setCurrentCarpark] = useState([]);
  const [modal, setModal] = useState(false);

  const [freeLots, setFreeLots] = useState("");

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
        setFreeLots(
          [...response.data.items[0].carpark_data].filter(
            (item) => item.carpark_number === cp.key
          )
        );
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

  return (
    <div className="GmapWrapper">
      <h1> Maps</h1>
      <h6> Click on the marker to see available slots!</h6>
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
        <Popup
          modal={modal}
          toggleModal={toggleModal}
          currentCarparkAddressProp={currentCarpark.val.address}
          currentCarparkPropNo={currentCarpark.val.car_park_no}
          freeLots={freeLots}
        />
      )}
    </div>
  );
}
