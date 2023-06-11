import React, { useState, useEffect } from "react";
import About from "./About";
import Creators from "./Creators";
import Features from "./Features";
import Productivity from "./Productivity";
import { Link } from "react-router-dom";
import { HiOutlineBars3 } from "react-icons/hi2";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import GroupIcon from "@mui/icons-material/Group";
import AppsIcon from "@mui/icons-material/Apps";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import { FiArrowRight } from "react-icons/fi";
import HomeBG from "./Productivity.jpg";
import { BsTwitter } from "react-icons/bs";
import { SiLinkedin } from "react-icons/si";
import { BsYoutube } from "react-icons/bs";
import { FaFacebookF } from "react-icons/fa";

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <button
      className={`back-to-top-button ${isVisible ? "visible" : ""}`}
      onClick={scrollToTop}
    >
      &#8593;
    </button>
  );
};

const LandingPage = () => {
  const [openMenu, setOpenMenu] = useState(false);

  const menuOptions = [
    {
      text: "Home",
      icon: <HomeIcon />,
    },
    {
      text: "About",
      icon: <InfoIcon />,
    },
    {
      text: "Creators",
      icon: <GroupIcon />,
    },
    {
      text: "Features",
      icon: <AppsIcon />,
    },
    {
      text: "More",
      icon: <ReadMoreIcon />,
    },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        behavior: "smooth",
        top: element.offsetTop - 50,
      });
    }
  };

  return (
    <>
      <div className="home-container" id="Home">
        <nav>
          <div className="nav-logo-container">
            <h1>Collabify</h1>
          </div>
          <div className="navbar-links-container">
            <p onClick={() => scrollToSection("Home")}>Home</p>
            <p onClick={() => scrollToSection("About")}>About</p>
            <p onClick={() => scrollToSection("Creators")}>Creators</p>
            <p onClick={() => scrollToSection("Features")}>Features</p>
            <p onClick={() => scrollToSection("More")}>More...</p>
            <Link to="/collabify/login">
              <button className="primary-button">Get Started</button>
            </Link>
          </div>
          <div className="navbar-menu-container">
            <HiOutlineBars3 onClick={() => setOpenMenu(true)} />
          </div>
          <Drawer
            open={openMenu}
            onClose={() => setOpenMenu(false)}
            anchor="right"
          >
            <Box
              sx={{ width: 250, height: "100%", backgroundColor: '#333333'}}
              role="presentation"
              onClick={() => setOpenMenu(false)}
              onKeyDown={() => setOpenMenu(false)}
            >
              <List className="sideMenu">
                {menuOptions.map((item) => (
                  <ListItem className="sideMenuItem" key={item.text} disablePadding>
                    <ListItemButton onClick={() => scrollToSection(item.text)}>
                      <ListItemIcon >{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>
        </nav>
        <div className="home-banner-container">
          <div className="home-text-section">
            <h1 className="primary-heading">
              All the features you need to be your most productive self
            </h1>
            <p className="primary-text">
              Tired of having to open different apps everytime you have to work?
              Well Collabify is here for you.
            </p>
            <Link to="/collabify/login">
              <button className="secondary-button">
                Get Started Now <FiArrowRight />
              </button>
            </Link>
          </div>
          <div className="home-image-section">
            <img src={HomeBG} alt=""></img>
          </div>
        </div>
      </div>
      <div>
        <section id="About">
          <About />
        </section>
        <section id="Creators">
          <Creators />
        </section>
        <section id="Features">
          <Features />
        </section>
        <section id="More">
          <Productivity />
        </section>
        <div className="footer-wrapper">
          <div className="footer-section-one">
            <div className="footer-logo-container">
              <h1>Collabify</h1>
            </div>
            <div className="footer-icons">
              <BsTwitter />
              <SiLinkedin />
              <BsYoutube />
              <FaFacebookF />
            </div>
          </div>
          <div className="footer-section-two">
            <div className="footer-section-columns">
              <span onClick={() => scrollToSection("Home")}>Home</span>
              <span>Help</span>
              <span onClick={() => scrollToSection("About")}>About</span>
              <span onClick={() => scrollToSection("Creators")}>Creators</span>
              <span onClick={() => scrollToSection("Features")}>Features</span>
              <span onClick={() => scrollToSection("More")}>Productivity</span>
            </div>
            <div className="footer-section-columns">
              <span>+261 34 02 839 04</span>
              <span>collabify@gmail.com</span>
              <span>collabifyHelp@gamil.com</span>
              <span>collabifyIssue@collabify.com</span>
            </div>
            <div className="footer-section-columns">
              <span>Terms & Conditions</span>
              <span>Privacy Policy</span>
            </div>
          </div>
        </div>
      </div>
      <BackToTopButton />
    </>
  );
};

export default LandingPage;
