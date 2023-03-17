import { useState, useContext } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { signInWithEmailAndPassword } from "firebase/auth";

import { Outlet, useNavigate, Navigate } from "react-router-dom";
import { LoginInfo } from "../App";
import logo from "../logo.png";

import { ref as databaseRef, onValue } from "firebase/database";
import { database, auth } from "../firebase";


export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { loggedInUser, setLoggedInUser } = useContext(LoginInfo);
  const navigate = useNavigate();

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const messagesRef = databaseRef(
          database,
          "users/" + userCredential.user.uid + "/favourites"
        );
        onValue(messagesRef, (snapshot) => {
          const data = snapshot.val();

          setLoggedInUser({
            isLoggedIn: true,
            displayName: auth.currentUser.displayName,
            photoURL: auth.currentUser.photoURL,
            userID: userCredential.user.uid,
            favs: data,
          });
        });
      })

      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === "auth/invalid-email") alert("Please sign up!");
      });
    navigate("/gmap");
  };

  return (
    <div>
      <Card
        style={{
          width: "22rem",
          color: "#1c1c1c",
          backgroundColor: "#6e6e6e",
        }}
      >
        <Card.Img variant="top" src={logo} />
      </Card>
      <Form.Group>
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
      </Form.Group>

      <Button variant="success" onClick={handleSignIn}>
        Sign In
      </Button>

      <Outlet />
    </div>
  );
}
