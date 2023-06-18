import React, { useState } from "react";
import { makeStyles } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import CloseIcon from "@material-ui/icons/Close";
import Select from "client/common/Dropdown/index.jsx";

const useStyles = makeStyles({
  notificationAlertsContainer: {
    backgroundColor: "white",
    width: 850,
    padding: 8,
  },
  addNotificationForm: {
    display: "flex",
  },
  addConditionsContainer: {
    display: "flex",
  },
  textFieldRoot: {
    margin: "0 8px",
  },
  selectRoot: {
    margin: "0 8px",
    width: 100,
  },
  addNewConditionIconContainer: {
    color: "#7e7e7e",
    paddingTop: 25,
  },
  buttonsContainer: {
    alignSelf: "flex-end",
    marginLeft: 20,
    marginBottom: 10,
  },
});

const defaultConditions = [
  {
    condition: "GREATER_THAN",
    price: 5,
  },
];

const CONDITION_OPTIONS = [
  {
    label: ">",
    value: "GREATER_THAN",
  },
  {
    label: ">=",
    value: "GREATER_THAN_OR_EQUALS",
  },
  {
    label: "<",
    value: "LESS_THAN",
  },
  {
    label: "<=",
    value: "LESS_THAN_OR_EQUALS",
  },
  {
    label: "=",
    value: "EQUALS",
  },
];

const AddNotificationAlert = () => {
  const [alerts, setAlerts] = useState([]);
  const [addNewAlert, setAddNewAlert] = useState({
    ticker: "",
    conditions: [...defaultConditions],
  });
  const classes = useStyles();

  const condtionOnChange = () => {};

  const addNewConditionRow = () => {
    setAddNewAlert({
      ...addNewAlert,
      conditions: [...addNewAlert.conditions, ...defaultConditions],
    });
  };
  const deleteNewConditionRow = (index) => {
    const _condtions = [...addNewAlert.conditions];
    setAddNewAlert({
      ...addNewAlert,
      conditions: [..._condtions.filter((i, _i) => _i !== index)],
    });
  };

  return (
    <div className={classes.notificationAlertsContainer}>
      <div className={classes.addNotificationForm}>
        <div>
          <TextField
            label="Ticker"
            variant="standard"
            value={addNewAlert.ticker}
            classes={{
              root: classes.textFieldRoot,
            }}
          />
        </div>
        <div>
          {addNewAlert.conditions.map(({ condition, price }, index) => {
            return (
              <div>
                <div style={{ display: "flex" }}>
                  <Select
                    value={condition}
                    options={CONDITION_OPTIONS}
                    onChange={condtionOnChange}
                    label="Condition"
                    classes={{
                      root: classes.selectRoot,
                    }}
                  />
                  <TextField
                    label="Price"
                    variant="standard"
                    value={price}
                    classes={{
                      root: classes.textFieldRoot,
                    }}
                  />
                  <div className={classes.addNewConditionIconContainer}>
                    {index === addNewAlert.conditions.length - 1 ? (
                      <AddIcon onClick={() => addNewConditionRow()} />
                    ) : (
                      <CloseIcon onClick={() => deleteNewConditionRow(index)} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className={classes.buttonsContainer}>
          <Button variant="contained" color="primary" onClick={() => {}}>
            Save
          </Button>
          <Button color="primary" onClick={() => {}}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddNotificationAlert;
