import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

export default function ComboBox(props) {

  return (
    <Autocomplete
        id="combo-box-demo"
        options={props.usuarios}
        disabled = {props.disabled}
        defaultValue={props.itemsSeleccionados}
        size="small"
        onChange = {function(event,value,reason){
            props.seleccionarItems(value)
          }
        }
        getOptionLabel={option => option.Title}
        multiple
        freeSolo
        renderInput={params => <TextField {...params} variant="outlined" />}
      />
  );
}