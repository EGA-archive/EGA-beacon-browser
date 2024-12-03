import React from "react";
import { Container } from "react-bootstrap";

function NetworkMembers() {
  return (
    <div>
      <p className="lead mt-5 mb-4">
        <b>Institutions involved</b>
      </p>
      <div className="bnmembers-container">
        <div className="bnmembers-grid">
          <div className="cell">
            <img
              src="./egalogocolor.png"
              alt="EGA Logo"
              className="cell-image egaembllogo"
            />
          </div>

          <div className="cell">
            <img
              src="./crglogo.png"
              alt="CRG Logo"
              className="cell-image crglogo"
            />
          </div>
          <div className="cell">
            <img
              src="./embllogo.png"
              alt="EMBL Logo"
              className="cell-image egaembllogo"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetworkMembers;
