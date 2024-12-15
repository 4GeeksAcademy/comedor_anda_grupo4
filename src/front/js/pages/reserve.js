import React from "react";
import Dining from "../component/dining";

const Reserve = () => {
  return (
    <div className="d-flex justify-content-center min-vh-100 pt-5">
      <div className="w-100 w-md-75 w-lg-50" style={{ maxWidth: "400px" }}>
        <Dining />
      </div>
    </div>
  );
};

export default Reserve;
