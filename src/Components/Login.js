import { useEffect, useState, useContext } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import { Outlet, useNavigate, Navigate } from "react-router-dom";
import { LoginInfo } from "../App";

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { loggedInUser, setLoggedInUser } = useContext(LoginInfo);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(props.isLoggedIn);
    props.isLoggedIn ? <Navigate to="/Gmap" /> : <Navigate to="/Signup" />;
  }, [props.isLoggedIn]);

  const handleSignIn = () => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setLoggedInUser({
          isLoggedIn: true,
          displayName: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL,
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
        <Card.Body>
          <Card.Title>Sign In</Card.Title>
          <Card.Text>Sign in with email and password</Card.Text>
        </Card.Body>
      </Card>
      <Form.Group>
        {/* <Form.Label>Sign in!</Form.Label> */}

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
