import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import Gmaps from "./Components/Gmaps";
import Login from "./Components/Login";
import { auth } from "./firebase";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect, createContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Signup from "./Components/Signup";
import HomePage from "./Components/HomePage";
import EditProfile from "./Components/EditProfile";

export const LoginInfo = createContext(null);

function App() {
  const [loggedInUser, setLoggedInUser] = useState({
    isLoggedIn: false,
    displayName: "",
    photoURL: "",
    email: "",
  });

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedInUser({
          isLoggedIn: true,
          displayName: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL,
          email: auth.currentUser.email,
        });
      }
    });
  }, []);

  return (
    <LoginInfo.Provider value={{ loggedInUser, setLoggedInUser }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />}>
            <Route path="Gmap" element={<Gmaps />} />
            <Route path="Signup" element={<Signup />} />
            <Route
              path="Login"
              element={<Login isLoggedIn={loggedInUser.isLoggedIn} />}
            />
            <Route path="Edit" element={<EditProfile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LoginInfo.Provider>
  );
}

export default App;
