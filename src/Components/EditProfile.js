import { useState, useContext } from "react";
import { Button, Form, Card } from "react-bootstrap";
import { updateProfile } from "firebase/auth";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { auth, storage } from "../firebase";
import { useNavigate } from "react-router-dom";
import { LoginInfo } from "../App";
import logo from "../updateProfile.png";
const STORAGE_FILE_KEY = "images";

export default function EditProfile() {
  const [newDisplayName, setNewDisplayName] = useState("");
  const [fileInputFile, setFileInputFile] = useState(null);
  const [fileInputValue, setfileInputValue] = useState("");

  const { loggedInUser, setLoggedInUser } = useContext(LoginInfo);
  const navigate = useNavigate();

  const newProfileSubmit = () => {
    const imageRef = storageRef(
      storage,
      `${STORAGE_FILE_KEY}/${fileInputFile.name}`
    );

    uploadBytes(imageRef, fileInputFile).then((snapshot) => {
      getDownloadURL(imageRef, fileInputFile).then((url) => {
        updateProfile(auth.currentUser, {
          displayName: newDisplayName,
          photoURL: url,
        });

        setLoggedInUser({
          isLoggedIn: true,
          displayName: newDisplayName,
          photoURL: url,
        });
        alert("Profile Updated!");
      });
    });
  };

  const handleFileChange = (e) => {
    setFileInputFile(e.target.files[0]);
    setfileInputValue(e.target.value);
  };

  return (
    <div>
      <h2>Edit Profile</h2>
      <Card
        style={{
          width: "22rem",
          color: "#1c1c1c",
          backgroundColor: "#6e6e6e",
        }}
      >
        <Card.Img variant="top" src={logo} />
      </Card>
      <Form.Group>
        {/* <Form.Label>Set New Display Name/ Profile Picture</Form.Label> */}
        <Form.Control
          type="text"
          name="displayName"
          placeholder="Select your Username"
          value={newDisplayName}
          onChange={(e) => setNewDisplayName(e.target.value)}
        />
        <Form.Control
          type="file"
          value={fileInputValue}
          placeholder="Profile picture optional"
          onChange={handleFileChange}
        />
        <Button variant="success" onClick={newProfileSubmit}>
          Update
        </Button>
      </Form.Group>
    </div>
  );
}
