import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
// import StocksTable from "client/Pages/StocksTable";
import BackTesting from "client/Pages/BackTesting";
import HaltResume from "client/Pages/HaltResume";
import Statistics from "client/Pages/Stats";
import TickerHistory from "client/Pages/TickerHistory";
import Home from "client/Pages/Home";
import Button from "@material-ui/core/Button";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import { IconButton } from "@material-ui/core";
import NotificationsIcon from "@material-ui/icons/Notifications";
import MenuIcon from "@material-ui/icons/Menu";
import NotificationWidget from "client/Pages/Home/Components/NotificationWidget";
import logo from "client/images/logo.png";
import "./app.scss";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  appBar: {
    marginBottom: 32,
    color: "white",
  },
  link: {
    textDecoration: "none",
  },
  notificationContainer: {
    position: "absolute",
    right: 0,
    top: 45,
    visibility: "hidden",
    zIndex: 99,
  },
  showNotifications: {
    visibility: "visible",
  },
  appContainer: {
    height: "100%",
    backgroundColor: "#e9ecff",
  },
  linksContainer: {
    color: "black",
    margin: "16px 32px",
  },
}));

// const Home = () => {
//   const [selectedTrim, setSelectedTrim] = useState("all");
//   return (
//     <div className="app-container">
//       <div>
//         <Button
//           color="primary"
//           variant={`${selectedTrim === "all" ? "outlined" : ""}`}
//           onClick={() => setSelectedTrim("all")}
//         >
//           All{" "}
//         </Button>{" "}
//         <Button
//           color="primary"
//           variant={`${selectedTrim === "pml" ? "outlined" : ""}`}
//           onClick={() => setSelectedTrim("pml")}
//         >
//           Premarket % lost{" "}
//         </Button>{" "}
//         <Button
//           color="primary"
//           variant={`${selectedTrim === "mog" ? "outlined" : ""}`}
//           onClick={() => setSelectedTrim("mog")}
//         >
//           Market open Gapup %
//         </Button>{" "}
//         <Button
//           color="primary"
//           variant={`${selectedTrim === "og" ? "outlined" : ""}`}
//           onClick={() => setSelectedTrim("og")}
//         >
//           Open Gap %
//         </Button>{" "}
//       </div>{" "}
//       <StocksTable trim={selectedTrim} />{" "}
//       <BackTesting />
//     </div>
//   );
// };

const App = () => {
  const classes = useStyles();
  const [showNotifications, setShowNotifications] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleClickAway = () => {
    setShowNotifications(false);
  };

  const toggleDrawer = (value) => {
    setDrawerOpen(value);
  };

  return (
    <Router basename="/#/">
      <div className={classes.appContainer}>
        <Drawer
          anchor={"left"}
          open={drawerOpen}
          onClose={() => toggleDrawer(false)}
        >
          <div className={classes.linksContainer}>
            <div>
              <Button color="inherit">
                <Link className={classes.link} to="/home">
                  Home
                </Link>
              </Button>
            </div>
            <div>
              <Button color="inherit">
                <Link className={classes.link} to="/">
                  Watchlist
                </Link>
              </Button>
            </div>
            <div>
              <Button color="inherit">
                <Link className={classes.link} to="/halt-resume">
                  Halt Resume
                </Link>
              </Button>
            </div>
            <div>
              <Button color="inherit">
                <Link className={classes.link} to="/statistics">
                  Statistics
                </Link>
              </Button>
            </div>
            <div>
              <Button color="inherit">
                <Link className={classes.link} to="/bt">
                  Back Testing
                </Link>
              </Button>
            </div>
          </div>
        </Drawer>
        <AppBar className={classes.appBar} position="static">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="opem-menu"
              onClick={() => toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            <div>
              <img style={{ height: "75px" }} src={logo} />
            </div>
            <Typography variant="h6" className={classes.title}></Typography>

            <IconButton
              color="inherit"
              aria-label="delete"
              onClick={toggleNotifications}
            >
              <NotificationsIcon />

              <div>
                <div
                  className={`${classes.notificationContainer} ${
                    showNotifications ? classes.showNotifications : ""
                  }`}
                >
                  <NotificationWidget />
                </div>
              </div>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/home">
            <Home />
          </Route>
          <Route path="/bt">
            <BackTesting />
          </Route>
          <Route path="/halt-resume">
            <HaltResume />
          </Route>
          <Route path="/statistics">
            <Statistics />
          </Route>
          <Route path="/">
            <TickerHistory />
          </Route>
          {/* <Route path="/">
            <Home />
          </Route> */}
        </Switch>
      </div>
    </Router>
  );
};

export default App;
