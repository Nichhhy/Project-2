import "../index.css";

import { ReactComponent as CaretIcon } from "./icons/caret.svg";

import { ReactComponent as CogIcon } from "./icons/cog.svg";
import { ReactComponent as ChevronIcon } from "./icons/chevron.svg";
import { ReactComponent as ArrowIcon } from "./icons/arrow.svg";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../logo.png";

import { useNavigate } from "react-router-dom";

import React, { useState, useEffect, useRef, useContext } from "react";
import { CSSTransition } from "react-transition-group";
import { LoginInfo } from "../App";

export default function NavigationBar() {
  return (
    <Navbar>
      <a className="navLogo" href="/">
        <img alt="Logo" src={logo} height="40" className="navbar-logo" />
      </a>
      <NavItem icon={<CaretIcon />}>
        <DropdownMenu></DropdownMenu>
      </NavItem>
    </Navbar>
  );
}

function Navbar(props) {
  return (
    <nav className="navbar2">
      <ul className="navbar-nav2">{props.children}</ul>
    </nav>
  );
}

function NavItem(props) {
  const [open, setOpen] = useState(false);

  return (
    <li className="nav-item2">
      <a
        href={props.url}
        className="icon-button2"
        onClick={() => setOpen(!open)}
      >
        {props.icon}
      </a>

      {open && props.children}
    </li>
  );
}

function DropdownMenu() {
  const [activeMenu, setActiveMenu] = useState("main");
  const [menuHeight, setMenuHeight] = useState(null);
  const dropdownRef = useRef(null);

  const { loggedInUser, setLoggedInUser } = useContext(LoginInfo);
  const navigate = useNavigate();

  useEffect(() => {
    setMenuHeight(dropdownRef.current?.firstChild.offsetHeight + 50);
  }, []);

  function calcHeight(el) {
    const height = el.offsetHeight + 50;

    setMenuHeight(height);
  }

  function DropdownItem(props) {
    return (
      <a
        href={props.url}
        className="menu-item2"
        onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}
      >
        <span className="icon-button2">{props.leftIcon}</span>
        {props.children}
        <span className="icon-right2">{props.rightIcon}</span>
      </a>
    );
  }

  function Logout(props) {
    return (
      <a href="/" className="menu-item2" onClick={props.logout}>
        <span className="icon-button2">{props.leftIcon}</span>
        {props.children}
        <span className="icon-right2">{props.rightIcon}</span>
      </a>
    );
  }

  function ProfileView(props) {
    return (
      <div className="menu-item2">
        <img
          alt="profilePic"
          className="headerImg"
          src={loggedInUser.photoURL}
          width="30"
          height="30"
        />
        <p style={{ color: "white " }}>Welcome: {loggedInUser.displayName}</p>;
      </div>
    );
  }

  const logoutUser = () => {
    signOut(auth)
      .then(() => {
        setLoggedInUser({
          isLoggedIn: false,
          displayName: "",
          photoURL: "",
        });
      })
      .then(() => {
        navigate("/");
      });
  };

  return (
    <div className="dropdown2" style={{ height: menuHeight }} ref={dropdownRef}>
      <CSSTransition
        in={activeMenu === "main"}
        timeout={500}
        classNames="menu-primary2"
        unmountOnExit
        onEnter={calcHeight}
      >
        {loggedInUser.isLoggedIn ? (
          <div className="menu2">
            {loggedInUser.isLoggedIn && <ProfileView />}

            <DropdownItem
              leftIcon={<CogIcon />}
              url="/Edit"
              rightIcon={<ChevronIcon />}
            >
              Edit Profile
            </DropdownItem>
            <DropdownItem
              leftIcon={<CogIcon />}
              url="/HowItWorks"
              rightIcon={<ChevronIcon />}
            >
              How it Works
            </DropdownItem>
            <DropdownItem
              leftIcon="🦧"
              rightIcon={<ChevronIcon />}
              goToMenu="Maps"
            >
              Map Options
            </DropdownItem>

            <Logout logout={logoutUser}>Logout</Logout>
          </div>
        ) : (
          <div className="menu2">
            {loggedInUser.isLoggedIn && <ProfileView />}

            <DropdownItem
              leftIcon={<CogIcon />}
              url="/Signup"
              rightIcon={<ChevronIcon />}
            >
              Sign up
            </DropdownItem>
            <DropdownItem
              leftIcon={<CogIcon />}
              rightIcon={<ChevronIcon />}
              url="/Login"
            >
              Login
            </DropdownItem>
          </div>
        )}
      </CSSTransition>

      <CSSTransition
        in={activeMenu === "Maps"}
        timeout={500}
        classNames="menu-secondary2"
        unmountOnExit
        onEnter={calcHeight}
      >
        <div className="menu2">
          <DropdownItem goToMenu="main" leftIcon={<ArrowIcon />}>
            <h2>Map Options</h2>
          </DropdownItem>
          <DropdownItem leftIcon="🦘" url="/Gmap">
            Google Maps
          </DropdownItem>
          <DropdownItem leftIcon="🐸" url="/Search">
            Search
          </DropdownItem>
          <DropdownItem leftIcon="🐸" url="/Favourites">
            Favourites
          </DropdownItem>
        </div>
      </CSSTransition>
    </div>
  );
}
