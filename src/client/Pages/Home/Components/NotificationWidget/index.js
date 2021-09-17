import React, { Component, useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { Badge } from "@material-ui/core";
import { connectedSocket } from "client/socket";
import { getNasdaqHalts } from "client/apis/haltsApi";
import {
  playPristine,
  playSwipe,
  playFlush,
  playSwiftly,
} from "client/sounds/play";
import "./styles.scss";

let halts = [];

const getTimeFromTimestamp = (timestamp) => {
  let timestampDate = new Date(timestamp);
  let timestampDateString =
    timestampDate.getHours() +
    1 +
    ":" +
    (timestampDate.getMinutes() < 10
      ? "0" + timestampDate.getMinutes()
      : timestampDate.getMinutes()) +
    ":" +
    (timestampDate.getSeconds() < 10
      ? "0" + timestampDate.getSeconds()
      : timestampDate.getSeconds());

  return timestampDateString;
};

const useStyles = makeStyles({
  container: {
    display: "flex",
  },
  primaryContainer: {
    padding: "8px 16px",
    width: "550px",
    textAlign: "left",
    maxHeight: "350px",
    overflow: "auto",
  },
  secondaryContainer: {
    padding: "8px 16px",
    width: "550px",
    textAlign: "left",
    maxHeight: "350px",
    overflow: "auto",
  },
  item: {
    borderBottom: "1px solid #e0e0e0",
    fontSize: "14px",
    lineHeight: "24px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  notificationCount: {
    marginRight: "18px",
  },
});

const Widget = ({ onAlertClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [secondaryNotifications, setSecondaryNotifications] = useState([]);
  const notificationStateRef = useRef();

  notificationStateRef.current = notifications;

  const updateMessageNotifications = (message, symbol) => {
    const _notifications = [...notificationStateRef.current];
    setNotifications([{ message, ticker: symbol }, ..._notifications]);
  };

  const updateSecondaryMessageNotifications = ({ message, count, symbol }) => {
    setSecondaryNotifications((prevState) => {
      const _filteredArray = prevState.filter(
        (entry) => entry.symbol !== symbol
      );
      return [{ message, count, symbol }, ..._filteredArray];
    });
  };

  const handleNotifications = (_halts) => {
    setNotifications((previousNotificationsState) => {
      if (previousNotificationsState.length !== _halts.length) {
        const _notifications = [];
        const _previousNotificationMessages = previousNotificationsState.map(
          (p) => p.message
        );
        for (let i = 0; i < _halts.length; i++) {
          const {
            ticker,
            haltDate,
            haltTime,
            resumptionDate,
            resumptionTime,
            reasonCode,
          } = _halts[i];
          const message = `${ticker} (${reasonCode}) halted ${haltDate} ${haltTime} and resumes ${resumptionDate} ${resumptionTime}`;
          if (_previousNotificationMessages.indexOf(message) === -1) {
            // halts.push(_halts[i]);
            _notifications.push({ message, ticker });
          } else {
            break;
          }
        }

        if (_notifications.length) {
          playPristine();
          return [..._notifications, ...previousNotificationsState];
        }
      }
      return previousNotificationsState;
    });
  };

  useEffect(() => {
    const socket = connectedSocket();
    socket.on("Halts", handleNotifications);
    socket.on("Alert", ({ swipe, message, symbol }) => {
      updateMessageNotifications(message, symbol);
      if (swipe) {
        playSwipe();
      } else {
        playFlush();
      }
    });
    socket.on("AlertHOD", ({ symbol, lastNotified, now, count }) => {
      updateSecondaryMessageNotifications({
        message: lastNotified
          ? `${getTimeFromTimestamp(
              now
            )} | ${symbol} near HOD. Last notified ${getTimeFromTimestamp(
              lastNotified
            )}`
          : `${getTimeFromTimestamp(now)} | ${symbol} near HOD.`,
        count,
        symbol,
      });

      if (count > 2) {
        // playSwiftly();
      }
    });

    // Start Nasdaq RSS
    getNasdaqHalts();
  }, []);

  const classes = useStyles();
  return (
    <div>
      <Paper variant="outlined">
        <div className={classes.container}>
          <div className={classes.primaryContainer}>
            {notifications.map(({ message, ticker }, i) => (
              <div
                key={i}
                className={classes.item}
                onClick={() =>
                  onAlertClick(new Date().toISOString().split("T")[0], ticker)
                }
              >
                {message}
              </div>
            ))}
          </div>
          <div className={classes.secondaryContainer}>
            {secondaryNotifications.map(({ message, count, symbol }, i) => (
              <div
                key={i}
                className={classes.item}
                onClick={() =>
                  onAlertClick(new Date().toISOString().split("T")[0], symbol)
                }
              >
                <Badge
                  badgeContent={count}
                  color={`${count > 4 ? "secondary" : "primary"}`}
                  className={classes.notificationCount}
                ></Badge>{" "}
                {message}
              </div>
            ))}
          </div>
        </div>
      </Paper>
    </div>
  );
};

export default Widget;
