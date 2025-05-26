import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages";
import {
  AfricaGDPComparison,
  AfricasSolarSurge,
  WorldPopulation,
} from "./charts";
import AppTest from "./charts/bar/AppTest";
import { AfricaSolarSurge } from "./articles";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<AfricaSolarSurge />}></Route>
        {/* <Route path="worldPopulation" element={<WorldPopulation />}></Route> */}
        {/* <Route path="worldPopulationNew" element={<AppTest />}></Route> */}
        {/* <Route path="solarSurgeAfrica" element={<AfricasSolarSurge />}></Route> */}
        <Route
          path="articles/solarSurgeAfrica"
          element={<AfricaSolarSurge />}
        ></Route>
        <Route
          path="charts/africaGdpCompare"
          element={<AfricaGDPComparison />}
        ></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

