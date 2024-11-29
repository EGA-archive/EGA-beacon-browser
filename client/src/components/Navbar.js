import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import LoggedIn from "./SignIn/LoggedIn";

const CustomNavbar = ({ onClickHandler }) => {
  return (
    <Navbar className="custom-navbar">
      <Container>
        <a
          className="egalogo"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          <img src="/../egalogo.png" className="egalogo" alt="egalogo" />
        </a>
        <h1 className="beacon">EGA Allele Frequency Browser</h1>
        <LoggedIn onClickHandler={onClickHandler} />
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
