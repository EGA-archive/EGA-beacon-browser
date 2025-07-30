import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";

// This component renders the top navigation bar with the EGA logo and title.
const CustomNavbar = () => {
  return (
    // Navbar component
    <Navbar className="custom-navbar">
      <Container>
        <a
          href="https://ega-archive.org/about/ega/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/../egalogo.png" className="egalogo" alt="egalogo" />
        </a>
        {/* Title */}
        <h1 className="beacon-title">EGA Allele Frequency Browser</h1>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
