import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useContext } from "react";
import { LoginInfo } from "../App";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

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
        <Navbar.Brand href="/">Find a Carpark</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        {loggedInUser.isLoggedIn ? (
          <Navbar.Text className="justify-content-end">
            <img
              alt="profilePic"
              className="headerImg"
              src={loggedInUser.photoURL}
              width="30"
              height="30"
            />
            Welcome: {loggedInUser.displayName}
            <Nav.Link href="/Edit">Edit Profile</Nav.Link>
          </Navbar.Text>
        ) : null}

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
