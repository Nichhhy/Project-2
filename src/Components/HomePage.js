import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { auth } from "../firebase";

import { onAuthStateChanged } from "firebase/auth";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/Favourites");
      }
    });
  }, []);

  return (
    <div>
      <h1>Welcome! </h1>
      <h5>please sign in or login</h5>
    </div>
  );
}
