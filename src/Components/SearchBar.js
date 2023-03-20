import { useState, useEffect, useContext } from "react";
import { database } from "../firebase";
import { LoginInfo } from "../App";
import axios from "axios";

import Button from "react-bootstrap/Button";

import Modal from "react-bootstrap/Modal";
import { ReactSearchAutocomplete } from "react-search-autocomplete";

import { onChildAdded, ref as databaseRef, set } from "firebase/database";
const DB_IMAGE_KEY = "Carparks";

export default function SearchBar() {
  const [carpark, setCarpark] = useState([]);
  const [modal, setModal] = useState(false);
  const [currentCarpark, setCurrentCarpark] = useState({});
  const [freeLots, setFreeLots] = useState("");

  const { loggedInUser, setLoggedInUser } = useContext(LoginInfo);

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
        let tempLots = [...response.data.items[0].carpark_data].filter(
          (item) => item.carpark_number === cp
        );
        setFreeLots(tempLots[0].carpark_info[0].lots_available);
      });
  };
  const toggleModal = () => {
    setModal(!modal);
  };

  const handleOnSearch = (string, results) => {
    // onSearch will have as the first callback parameter
    // the string searched and for the second the results.
    console.log(string, results);
  };

  const handleOnSelect = (item) => {
    // the item selected
    setCurrentCarpark(item);
    info(item.info.car_park_no);
    toggleModal();
  };

  const addFavourite = (cpAddress) => {
    loggedInUser.favs === null
      ? set(databaseRef(database, "users/" + loggedInUser.userID), {
          favourites: [
            {
              address: cpAddress,
              cp_no: currentCarpark.info.car_park_no,
            },
          ],
        })
          .then(() => {
            setLoggedInUser({
              ...loggedInUser,
              favs: [
                {
                  address: cpAddress,
                  cp_no: currentCarpark.info.car_park_no,
                },
              ],
            });
          })
          .catch((error) => {
            console.log(error);
          })
      : set(databaseRef(database, "users/" + loggedInUser.userID), {
          favourites: [
            ...loggedInUser.favs,
            {
              address: cpAddress,
              cp_no: currentCarpark.info.car_park_no,
            },
          ],
        })
          .then(() => {
            setLoggedInUser({
              ...loggedInUser,
              favs: [
                ...loggedInUser.favs,
                {
                  address: cpAddress,
                  cp_no: currentCarpark.info.car_park_no,
                },
              ],
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
      (item) => item.cp_no !== currentCarpark.info.car_park_no
    );
    set(tasksRef, newArrOfFavs);
    setLoggedInUser({
      ...loggedInUser,
      favs: newArrOfFavs,
    });
  };

  return (
    <div>
      <ReactSearchAutocomplete
        items={carpark}
        maxResults={5}
        onSearch={handleOnSearch}
        onSelect={handleOnSelect}
        styling={{ zIndex: 4 }}
        autoFocus
        fuseOptions={{ keys: ["name"] }}
      />
      {modal && (
        <Modal show={modal} onHide={toggleModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Address : {currentCarpark.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>Total Lots : {freeLots}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={toggleModal}>
              Close
            </Button>
            {loggedInUser.favs === null ||
            loggedInUser.favs.filter(
              (item) => item.cp_no === currentCarpark.info.car_park_no
            ).length < 1 ? (
              <Button
                variant="primary"
                onClick={() => {
                  addFavourite(currentCarpark.name);
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
