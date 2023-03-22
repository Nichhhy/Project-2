import { useState, useContext } from "react";
import { ref as databaseRef, set } from "firebase/database";
import { database } from "../firebase";
import { LoginInfo } from "../App";
import { Card, Button, Modal } from "react-bootstrap";
import axios from "axios";

export default function Favorites() {
  const { loggedInUser, setLoggedInUser } = useContext(LoginInfo);
  const [modal, setModal] = useState(false);
  const [currentCarpark, setCurrentCarpark] = useState();
  const [freeLots, setFreeLots] = useState("");

  const handleClose = () => {
    setCurrentCarpark("");
    setFreeLots("");
    setModal(false);
  };

  const handleShow = (faves) => {
    setCurrentCarpark(faves);
    info(faves.cp_no);
    setModal(true);
  };

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

  const removeFav = () => {
    const tasksRef = databaseRef(
      database,
      "users/" + loggedInUser.userID + "/favourites"
    );

    const newArrOfFavs = loggedInUser.favs.filter(
      (item) => item.cp_no !== currentCarpark.cp_no
    );
    set(tasksRef, newArrOfFavs);
    setLoggedInUser({
      ...loggedInUser,
      favs: newArrOfFavs,
    });
    handleClose();
  };

  return (
    <div>
      <h2> List of Favourites </h2>
      {loggedInUser.favs.map((faves) => (
        <Card
          onClick={() => {
            handleShow(faves);
          }}
          key={faves.cp_no}
          style={{ width: "18rem" }}
          bg="success"
        >
          {" "}
          <Card.Body>
            <Card.Title>{faves.address}</Card.Title>
          </Card.Body>
        </Card>
      ))}

      {modal && (
        <Modal show={modal} onHide={handleClose} animation={false} centered>
          <Modal.Header closeButton>
            <Modal.Title>Address : {currentCarpark.address}</Modal.Title>
          </Modal.Header>
          <Modal.Body>Total Lots : {freeLots}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                removeFav();
              }}
            >
              Remove from favorites
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
