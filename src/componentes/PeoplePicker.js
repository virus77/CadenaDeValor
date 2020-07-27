import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

export default function ComboBox(props) {

  return (
    <Autocomplete
        id={props.id}
        options={props.usuarios}
        getOptionLabel={option => option.Title !== undefined ? option.Title : ''}
        defaultValue={props.itemsSeleccionados}
        disabled = {props.disabled}
        size="small"
        onChange = {function(event,value,reason){
          if(value !== null){
            value.idCampo = props.id
            value.nulo = false
            props.seleccionarItems(value)
          }else{
            const emptyValue = {nulo: true, idCampo: props.id }
            props.seleccionarItems(emptyValue)
          }
        }}
        renderInput={(params) => <TextField {...params} variant="outlined" />}
        multiple
      />
  );
}