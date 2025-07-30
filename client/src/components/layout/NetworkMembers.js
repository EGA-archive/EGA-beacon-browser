import React from "react";

// This component displays the logos of institutions involved in the project,
// each with a link to their respective websites.
function NetworkMembers() {
  return (
    <div>
      <p className="lead mt-5 mb-4 institution-title">
        <b>Institutions involved</b>
      </p>
      {/* Container for institution logos */}
      <div className="bnmembers-container">
        <div className="bnmembers-grid">
          {/* EGA Logo */}
          <div className="cell">
            <a
              href="https://ega-archive.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="./egalogocolor.png"
                alt="EGA Logo"
                className="cell-image egaembllogo"
              />
            </a>
          </div>
          {/* CRG Logo */}
          <div className="cell">
            <a
              href="https://www.crg.eu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="./crglogo.png"
                alt="CRG Logo"
                className="cell-image crglogo"
              />
            </a>
          </div>
          {/* EMBL-EBI Logo */}
          <div className="cell">
            <a
              href="https://www.ebi.ac.uk/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="./embllogo.png"
                alt="EMBL Logo"
                className="cell-image egaembllogo"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetworkMembers;
