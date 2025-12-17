import { BrowserRouter, Routes, Route } from "react-router-dom";
import PosterBoardComponent from "./PosterBoardComponent";
import PosterBoardComponent1 from "./PosterBoardComponent1";
import PosterBoardComponent2 from "./PosterBoardComponent2";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ルート */}
        <Route path="/" element={<PosterBoardComponent />} />

        {/* 追加ルート */}
        <Route path="/first" element={<PosterBoardComponent1 />} />
        <Route path="/second" element={<PosterBoardComponent2 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

