import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useContext, useEffect, useState } from "react";
import { LoginInfo } from "../App";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import logo from "../logo.png";
import { onAuthStateChanged } from "firebase/auth";

export default function NavHeader() {
  const { loggedInUser, setLoggedInUser } = useContext(LoginInfo);
  const navigate = useNavigate();

  const logout = () => {
    signOut(auth).then(() => {
      setLoggedInUser({
        isLoggedIn: false,
        displayName: "",
        photoURL: "",
      });
      navigate("/");
    });
  };

  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="/">
          <img alt="Logo" src={logo} height="40" className="navbar-logo" />
        </Navbar.Brand>

        {loggedInUser.isLoggedIn ? (
          <div className="navProfile">
            <Navbar.Text className="justify-content-end">
              <img
                alt="profilePic"
                className="headerImg"
                src={loggedInUser.photoURL}
                width="30"
                height="30"
              />
              Welcome: {loggedInUser.displayName}{" "}
              <Nav.Link href="/Edit">Edit Profile</Nav.Link>
            </Navbar.Text>
          </div>
        ) : null}
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto"></Nav>

          {loggedInUser.isLoggedIn ? (
            <Nav>
              <Nav.Link href="/Gmap">Map</Nav.Link>

              <Nav.Link onClick={() => logout()}>logout</Nav.Link>
            </Nav>
          ) : (
            <Nav>
              <Nav.Link href="/Signup">Signup</Nav.Link>
              <Nav.Link href="/Login">Login</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
