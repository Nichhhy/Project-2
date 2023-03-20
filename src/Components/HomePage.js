import { Card, Col, Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { LoginInfo } from "../App";
import { useContext, useState, useEffect } from "react";
import SearchBar from "./SearchBar";

import Favorites from "./Favorites";
import guide1 from "../guide1.png";
import guide2 from "../guide2.png";

export default function HomePage() {
  const { loggedInUser, setLoggedInUser } = useContext(LoginInfo);

  return (
    <div className="App">
      <header className="App-header">
        <SearchBar />
        <Container className="cards">
          <Card
            style={{
              width: "15rem",
              color: "#474747",
            }}
          >
            <Card.Img src={guide1} />
          </Card>
          <Card
            style={{
              width: "15rem",
              color: "#474747",
            }}
          >
            <Card.Img src={guide2} />
          </Card>
        </Container>

        <Outlet />

        {loggedInUser.favs ? <Favorites /> : null}
      </header>
    </div>
  );
}
