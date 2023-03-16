import { useState, useEffect } from "react";
import { onChildAdded, ref } from "firebase/database";
import { Outlet } from "react-router-dom";
import { database } from "../firebase";

const DB_USER_FAVES_KEY = "Favorites";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const favoriteRef = ref(database, DB_USER_FAVES_KEY);
    onChildAdded(favoriteRef, (data) => {
      setFavorites((previous) => [
        ...previous,
        { key: data.key, val: data.val() },
      ]);
    });
  }, []);

  let favoritesListItems = favorites.map((faves) => (
    <div key={faves.key}>
      <div>{faves.val.user}</div>
      {/* <div>{faves.val.favorites}.</div> */}
      {console.log(favorites)}
      {console.log(favorites[0].val)}

      {faves.val.favorites.map((data) => {
        <div>{faves.val.favorites.data}</div>;
      })}
    </div>
  ));

  return (
    <div>
      {favoritesListItems}
      <Outlet />
    </div>
  );
}

// create another place to store
// Stores user info
// Stores an array of carpark IDs that have been favorited
