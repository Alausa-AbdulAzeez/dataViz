import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages";
import { AfricasSolarSurge, WorldPopulation } from "./charts";
import AppTest from "./charts/bar/AppTest";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="worldPopulation" element={<WorldPopulation />}></Route>
        <Route path="worldPopulationNew" element={<AppTest />}></Route>
        <Route path="solarSurgeAfrica" element={<AfricasSolarSurge />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

