import { useState, useEffect } from "react";
import { database } from "../firebase";

import axios from "axios";
import Popup from "./Popup";
import { ReactSearchAutocomplete } from "react-search-autocomplete";

import { onChildAdded, ref as databaseRef } from "firebase/database";
const DB_IMAGE_KEY = "Carparks";

export default function SearchBar() {
  const [carpark, setCarpark] = useState([]);
  const [modal, setModal] = useState(false);
  const [currentCarpark, setCurrentCarpark] = useState({});
  const [freeLots, setFreeLots] = useState("");

  useEffect(() => {
    const messagesRef = databaseRef(database, DB_IMAGE_KEY);
    // onChildAdded will return data for every child at the reference and every subsequent new child
    onChildAdded(messagesRef, (data) => {
      // Add the subsequent child to local component state, initialising a new array to trigger re-render

      setCarpark((carpark) => [
        ...carpark,
        {
          id: data.ref._path.pieces_[1],
          name: data.val().address,
          info: data.val(),
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
            (item) => item.carpark_number === cp
          )
        );
      });
  };

  const toggleModal = () => {
    setModal(!modal);
  };

  const handleOnSelect = (item) => {
    // the item selected
    setCurrentCarpark(item);
    info(item.info.car_park_no);
    toggleModal();
  };

  return (
    <div className="GmapWrapper">
      <h4> Search for any carpark</h4>
      <ReactSearchAutocomplete
        items={carpark}
        maxResults={5}
        onSelect={handleOnSelect}
        styling={{ zIndex: 4 }}
        autoFocus
        fuseOptions={{ keys: ["name"] }}
      />

      {modal && (
        <Popup
          modal={modal}
          toggleModal={toggleModal}
          currentCarparkAddressProp={currentCarpark.name}
          currentCarparkPropNo={currentCarpark.info.car_park_no}
          freeLots={freeLots}
        />
      )}
    </div>
  );
}
