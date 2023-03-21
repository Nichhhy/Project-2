import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Gmaps from "./Components/Gmaps";
import Login from "./Components/Login";
import { auth } from "./firebase";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, createContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Signup from "./Components/Signup";
import HomePage from "./Components/HomePage";
import EditProfile from "./Components/EditProfile";
import NavigationBar from "./Components/Navigation";
import { database } from "./firebase";
import { ref as databaseRef, onValue } from "firebase/database";
import Favorites from "./Components/Favorites";
import SearchBar from "./Components/SearchBar";
import HowItWorks from "./Components/HowItWorks";

export const LoginInfo = createContext(null);

function App() {
  const [loggedInUser, setLoggedInUser] = useState({
    isLoggedIn: false,
    displayName: "",
    photoURL: "",

    userID: "",
    favs: [],
  });

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const messagesRef = databaseRef(
          database,
          "users/" + user.uid + "/favourites"
        );
        onValue(messagesRef, (snapshot) => {
          const data = snapshot.val();

          setLoggedInUser({
            isLoggedIn: true,
            displayName: auth.currentUser.displayName,
            photoURL: auth.currentUser.photoURL,
            userID: user.uid,
            favs: data,
          });
        });
      }
    });
  }, []);

  return (
    <div className="App" bg="light">
      <LoginInfo.Provider value={{ loggedInUser, setLoggedInUser }}>
        <BrowserRouter>
          <NavigationBar />
          <header className="App-header">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="Signup" element={<Signup />} />
              <Route path="Login" element={<Login />} />
              <Route path="Gmap" element={<Gmaps />} />
              <Route path="Search" element={<SearchBar />} />
              <Route path="Edit" element={<EditProfile />} />
              <Route path="Favourites" element={<Favorites />} />
              <Route path="HowItWorks" element={<HowItWorks />} />
            </Routes>
          </header>
        </BrowserRouter>
      </LoginInfo.Provider>
    </div>
  );
}

export default App;
