import { Card, Container } from "react-bootstrap";
import guide1 from "../guide1.png";
import guide2 from "../guide2.png";

export default function HowItWorks() {
  return (
    <div>
      <h2>How it Works</h2>
      <h6>You're able to check avaialble lots and Add them to favourites</h6>
      <Container className="cards">
        <Card
          style={{
            width: "25rem",
            color: "#474747",
          }}
        >
          <Card.Img src={guide1} />
        </Card>
        <Card
          style={{
            width: "25rem",
            color: "#474747",
          }}
        >
          <Card.Img src={guide2} />
        </Card>
      </Container>
    </div>
  );
}
