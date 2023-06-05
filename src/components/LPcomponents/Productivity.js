import React from "react";
import productivity from "./Up.jpg";

const Productivity = () => {
  return (
    <div className="productivity-section-container">
      <div className="productivity-background-image-container">
        <img src="" alt="" />
      </div>
      <div className="productivity-section-text-container">
        <p className="primary-subheading">More...</p>
        <h1 className="primary-heading">Enhanced Productivity</h1>
        <p className="primary-text">
          Enhanced productivity refers to the state of achieving higher levels
          of efficiency, effectiveness, and output in one's work or tasks. It
          involves optimizing the use of resources, minimizing wasted time and
          effort, and achieving desired outcomes more quickly and with greater
          quality. <br /> <br /> When productivity is enhanced, individuals are able
          to accomplish more in less time, leading to improved results and
          increased overall performance. It involves streamlining processes,
          eliminating unnecessary steps, and leveraging tools or techniques that
          facilitate workflow optimization. <br /> <br /> Enhanced productivity is not solely
          about working harder or longer hours; it encompasses working smarter
          and making strategic decisions to maximize output.
        </p>
      </div>
      <div className="productivity-section-image-container">
        <img src={productivity} alt="rising curve" />
      </div>
    </div>
  );
};

export default Productivity;
