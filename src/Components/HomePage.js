import { Outlet } from "react-router-dom";
import Favorites from "./Favorites";

import NavHeader from "./NavHeader";

export default function HomePage() {
  return (
    <div className="App">
      <NavHeader />
      <header className="App-header">
        <Outlet />
      </header>
    </div>
  );
}
