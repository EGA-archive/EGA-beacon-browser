import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";

const CustomNavbar = () => {
  return (
    <Navbar className="custom-navbar">
      <Container className="navbar-container">
        <a
          className="egalogo"
          href="https://ega-archive.org/about/ega/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/../egalogo.png" className="egalogo" alt="egalogo" />
        </a>
        <h1 className="beacon-title">EGA Allele Frequency Browser</h1>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
