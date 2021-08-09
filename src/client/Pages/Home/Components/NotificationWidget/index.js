import React, { Component, useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from '@material-ui/core/Paper';
import { connectedSocket } from "client/socket";
import { getNasdaqHalts } from "client/apis/haltsApi";
import { playPristine, playSwipe, playFlush, playSwiftly } from "client/sounds/play";
import "./styles.scss";

let halts = [];

const useStyles = makeStyles({
    container: {
        padding: '8px 16px',
        width: '550px',
        textAlign: 'left',
        maxHeight: '350px',
        overflow: 'auto',
    },
    item: {
        borderBottom: '1px solid #e0e0e0',
        fontSize: '14px',
        lineHeight: '24px'
    }
});

const Widget = () => {
    const [notifications, setNotifications] = useState([]);
    const notificationStateRef = useRef();

    notificationStateRef.current = notifications;

    const updateMessageNotifications = (message) => {
        const _notifications = [...notificationStateRef.current];
        setNotifications([message, ..._notifications]);
    }

    const handleNotifications = (_halts) => {
        setNotifications((previousNotificationsState) => {
            if(previousNotificationsState.length !== _halts.length) {
                const _notifications = [];
                for(let i = 0; i < _halts.length; i++) {
                    const { ticker, haltDate, haltTime, resumptionDate, resumptionTime, reasonCode } = _halts[i];
                    const message = `${ticker} (${reasonCode}) halted ${haltDate} ${haltTime} and resumes ${resumptionDate} ${resumptionTime}`;
                    if(previousNotificationsState.indexOf(message) === -1) {
                        // halts.push(_halts[i]);
                        _notifications.push(message);
                    } else {
                        break;
                    }
                }
    
                if(_notifications.length) {
                    playPristine();
                    return [..._notifications, ...previousNotificationsState]
                }
            }
            return previousNotificationsState;
        })
        
    };

    useEffect(() => {
        const socket = connectedSocket();
        socket.on('Halts', handleNotifications);
        socket.on("Alert", ({swipe, message}) => {
            updateMessageNotifications(message);
            if (swipe) {
                playSwipe();
              } else {
                playFlush();
              }
        });
        socket.on("AlertHOD", ({symbol}) => {
            updateMessageNotifications(symbol + ' near HOD');
            playSwiftly();
        });

        // Start Nasdaq RSS
        getNasdaqHalts();
    }, []);

    const classes = useStyles();
    return <div><Paper variant="outlined">
        <div className={classes.container}>
            {
                notifications.map((message, i) => <div key={i} className={classes.item}>{message}</div>)
            }
        </div>
        </Paper></div>
};

export default Widget;