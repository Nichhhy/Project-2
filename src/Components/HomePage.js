import { Card, Col, Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import Favorites from "./Favorites";
import NavHeader from "./NavHeader";
import guide1 from "../guide1.png";
import guide2 from "../guide2.png";

export default function HomePage() {
  return (
    <div className="App">
      <header className="App-header">
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
      </header>
    </div>
  );
}
