import React from "react";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";

export default function BasicSelect({
  options = [],
  onChange,
  value,
  label,
  showLabel = true,
  classes = {},
}) {
  return (
    <FormControl>
      {showLabel && (
        <InputLabel id="demo-simple-select-label">{label}</InputLabel>
      )}
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={value}
        label={label}
        onChange={onChange}
        classes={classes}
      >
        {options.map(({ label, value }) => (
          <MenuItem value={value}> {label} </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
