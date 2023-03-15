import { Button, Card, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";

import { auth, storage } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useContext } from "react";
import { LoginInfo } from "../App";

const STORAGE_FILE_KEY = "images";

export default function Signup(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [fileInputFile, setFileInputFile] = useState(null);
  const [fileInputValue, setfileInputValue] = useState("");
  const navigate = useNavigate();
  const { loggedInUser, setLoggedInUser } = useContext(LoginInfo);
  /* 
  useEffect(() => {
    console.log(loggedInUser.isLoggedIn);
    loggedInUser.isLoggedIn ? navigate("/") : navigate("/Signup");
  }, [loggedInUser.isLoggedIn]); */

  const handleFileChange = (e) => {
    setFileInputFile(e.target.files[0]);
    setfileInputValue(e.target.value);
  };

  const handleSignUp = (url) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in

        updateProfile(auth.currentUser, {
          displayName: displayName,
          photoURL: url,
        });
      })
      .then(() => {
        setLoggedInUser({
          isLoggedIn: true,
          displayName: displayName,
          photoURL: url,
        });
      })

      .then(() => {
        alert("Congrats! Thank you for signing up!");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === "auth/email-already-in-use")
          alert("You have already signed up before! Please sign in!");
      });
    navigate("/Gmap");
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
      <Card
        style={{
          width: "22rem",
          color: "#949494",
          backgroundColor: "#242424",
        }}
      >
        <Card.Body>
          <Card.Title>Sign Up</Card.Title>
          <Card.Text>
            Please input your Username, email and password to sign up (Profile
            Picture optional)
          </Card.Text>
        </Card.Body>
      </Card>

      <Form.Group>
        {/* <Form.Label>Sign in!</Form.Label> */}
        <Form.Control
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
      <Button variant="info" onClick={handleSubmit}>
        Sign up
      </Button>
    </div>
  );
}
