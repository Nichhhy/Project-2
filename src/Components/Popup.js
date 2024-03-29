import React from "react";
import { useContext } from "react";
import { database } from "../firebase";
import { LoginInfo } from "../App";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import { ref as databaseRef, set } from "firebase/database";

export default function Popup(props) {
  const { loggedInUser, setLoggedInUser } = useContext(LoginInfo);

  const addFavourite = (cpAddress) => {
    loggedInUser.favs === null
      ? set(databaseRef(database, "users/" + loggedInUser.userID), {
          favourites: [
            {
              address: cpAddress,
              cp_no: props.currentCarparkPropNo,
            },
          ],
        })
          .then(() => {
            setLoggedInUser({
              ...loggedInUser,
              favs: [
                {
                  address: cpAddress,
                  cp_no: props.currentCarparkPropNo,
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
              cp_no: props.currentCarparkPropNo,
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
                  cp_no: props.currentCarparkPropNo,
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
      (item) => item.cp_no !== props.currentCarparkPropNo
    );
    set(tasksRef, newArrOfFavs);
    setLoggedInUser({
      ...loggedInUser,
      favs: newArrOfFavs,
    });
  };

  return (
    <div>
      {props.modal && (
        <Modal show={props.modal} onHide={props.toggleModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              Address : {props.currentCarparkAddressProp}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Total Lots :{" "}
            {props.freeLots.length /* [0].carpark_info[0].total_lots */ === 0
              ? "No info available"
              : props.freeLots[0].carpark_info[0].total_lots}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={props.toggleModal}>
              Close
            </Button>
            {loggedInUser.favs === null ||
            loggedInUser.favs.filter(
              (item) => item.cp_no === props.currentCarparkPropNo
            ).length < 1 ? (
              <Button
                variant="primary"
                onClick={() => {
                  addFavourite(props.currentCarparkAddressProp);
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
