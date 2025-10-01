import React from "react";
import ArtworksTable from "./components/ArtworksTable";

const App: React.FC = () => {
  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 style={{ margin: 0, textAlign: "center", paddingTop: 20 }}>
            GrowMeOrganic Private Limited
          </h1>
          <div style={{ fontSize: 13, color: "#6b7280" }}></div>
        </div>
      </div>

      <ArtworksTable />
    </div>
  );
};

export default App;
