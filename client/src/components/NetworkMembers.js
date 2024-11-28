import React, { useEffect, useState } from "react";
import axios from "axios";

function NetworkMembers() {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState(null);

  //   API call to get the imageURL of the beacons.
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        let metaresponse;
        metaresponse = await axios({
          method: "get",
          url: "https://beacon-network-backend-test.ega-archive.org/beacon-network/v2.0.0/",
          headers: {
            "Content-Type": "application/json",
          },
        });
        setMembers(metaresponse.data.responses);
      } catch (err) {
        console.error(err);
        setError(err);
      }
    };

    fetchMembers();
  }, []);
  if (error) {
    return <div>Error loading members: {error.message}</div>;
  }

  return (
    <div>
      <p className="lead mt-5 mb-4 bnmembers-title">
        <b>Beacon Network Members</b>
      </p>
      <div className="bnmembers-container">
        {/* <div className="row bnmembers-row"> */}
        <div className="bnmembers-grid">
          {members.map((member, index) => (
            <div className="cell" key={index}>
              {member.response?.organization?.logoUrl ? (
                <img
                  src={member.response.organization.logoUrl}
                  alt={member.response.organization.name || "Organization Logo"}
                  className="cell-image"
                />
              ) : (
                <p>No Logo Available</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NetworkMembers;
