import "../../../src/App.css";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";

// Footer section
function Footer() {
  return (
    <Navbar className="custom-footer">
      <Container className="container-footer">
        <span className="footer-text">@Copyright 2024. EGA CONSORTIUM</span>
      </Container>
    </Navbar>
  );
}

export default Footer;
