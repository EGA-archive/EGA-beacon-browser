import React from "react";
import { Container } from "react-bootstrap";

function NetworkMembers() {
  return (
    <div className="yo">
      <p className="lead mt-5 mb-4 bnmembers-title">
        <b>Institutions involved</b>
      </p>
      <div className="bnmembers-container">
        <div className="bnmembers-grid">
          <div className="cell">
            <img
              src="./egalogocolor.png"
              alt="EGA Logo"
              className="cell-image"
              style={{ width: "248px", height: "71.97px" }}
            />
          </div>

          <div className="cell">
            <img
              src="./crglogo.png"
              alt="CRG Logo"
              className="cell-image"
              style={{ width: "164.49px", height: "94.45px" }}
            />
          </div>
          <div className="cell">
            <img
              src="./embllogo.png"
              alt="EMBL Logo"
              className="cell-image"
              style={{ width: "248px", height: "71.97px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetworkMembers;
