import { Button, Card, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { auth, storage, database } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useContext } from "react";
import { LoginInfo } from "../App";

import logo from "../logo.png";

import { ref as databaseRef, onValue } from "firebase/database";

const STORAGE_FILE_KEY = "images";

export default function Signup(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [fileInputFile, setFileInputFile] = useState(null);
  const [fileInputValue, setfileInputValue] = useState("");
  const navigate = useNavigate();
  const { loggedInUser, setLoggedInUser } = useContext(LoginInfo);
  const [disableButton, setDisableButton] = useState(true);

  const handleFileChange = (e) => {
    setFileInputFile(e.target.files[0]);
    setfileInputValue(e.target.value);
  };

  useEffect(() => {
    if (disableButton === true) {
      if (displayName.length > 1 && email.length > 0 && password.length > 0) {
        setDisableButton(false);
      }
    }
  });

  const handleSignUp = (url) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in

        updateProfile(auth.currentUser, {
          displayName: displayName,
          photoURL: url,
        });

        const messagesRef = databaseRef(
          database,
          "users/" + userCredential.user.uid + "/favourites"
        );
        onValue(messagesRef, (snapshot) => {
          const data = snapshot.val();

          setLoggedInUser({
            isLoggedIn: true,
            displayName: displayName,
            photoURL: url,
            userID: userCredential.user.uid,
            favs: data,
          });
        });
      })

      .then(() => {
        alert("Congrats! Thank you for signing up!");
        navigate("/HowItWorks");
      })

      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        navigate("/Signup");

        if (errorCode === "auth/email-already-in-use")
          alert("You have already signed up before! Please sign in!");
      });
  };

  const handleSubmit = (e) => {
    // Creates a reference to the bucket and save to storage

    if (!fileInputFile) {
      // to allow user to not upload profile pic
      handleSignUp(
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
      );
    } else {
      const imageRef = storageRef(
        storage,
        `${STORAGE_FILE_KEY}/${fileInputFile.name}`
      );

      uploadBytes(imageRef, fileInputFile).then((snapshot) => {
        getDownloadURL(imageRef, fileInputFile).then((url) => {
          handleSignUp(url);
        });
      });
    }
  };

  return (
    <div>
      <h2> Sign Up </h2>
      <Card
        style={{
          width: "22rem",
          color: "#949494",
          backgroundColor: "#242424",
        }}
      >
        <Card.Img variant="top" src={logo} />
        <Card.Body>
          <Card.Text>Profile Picture optional</Card.Text>
        </Card.Body>
      </Card>

      <Form.Group>
        <Form.Control
          required
          type="text"
          name="displayName"
          placeholder="Select your Username"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <Form.Control
          type="text"
          name="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Form.Control
          type="text"
          name="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Form.Control
          type="file"
          value={fileInputValue}
          placeholder="Profile picture optional"
          onChange={handleFileChange}
        />
      </Form.Group>
      <Button variant="info" onClick={handleSubmit} disabled={disableButton}>
        Sign up
      </Button>
    </div>
  );
}
