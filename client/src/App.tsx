import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Overview from "./pages/Overview";


const pageInfo: Record<
  string,
  {
    title: string;
    description: string;
  }
> = {

  overview: {
    title: "Overview",
    description:
      "SIF potential & precursor intelligence",
  },

  reports: {
    title: "Safety Reports",
    description:
      "Review analyzed safety reports",
  },

  sif: {
    title: "SIF Analysis",
    description:
      "Serious Injury & Fatality potential analysis",
  },

  precursors: {
    title: "Precursor Intelligence",
    description:
      "Identify recurring SIF precursor patterns",
  },

  priorities: {
    title: "HSE Priorities",
    description:
      "Prioritize areas requiring HSE intervention",
  },

  monitoring: {
    title: "Intervention Monitoring",
    description:
      "Monitor precursor patterns after intervention",
  },
};


function App() {

  const [activePage, setActivePage] =
    useState("overview");


  const current =
    pageInfo[activePage];


  const renderPage = () => {

    switch (activePage) {

      case "overview":
        return <Overview />;

      default:
        return (
          <div className="coming-soon">
            <h2>
              {current.title}
            </h2>

            <p>
              This module will be connected next.
            </p>
          </div>
        );
    }
  };


  return (
    <div className="app">

      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />


      <div className="main-area">

        <Header
          title={current.title}
          description={current.description}
        />


        <main>
          {renderPage()}
        </main>

      </div>

    </div>
  );
}


export default App;