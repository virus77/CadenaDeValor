import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { sp } from '@pnp/sp';
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import Principal from './componentes/Principal';
import Encabezado from './componentes/Encabezado';
import Generico from './componentes/Generico';
import Modal from './componentes/Ventana';
import 'bootstrap/dist/css/bootstrap.min.css';
import _ from 'lodash';

class App extends Component {
  state ={
    idTerreno: 285,
    ventana:4,
    datosTerreno: [],
    datosActividades: [],
    modal:[{
      showModal: false,
      encabezado: '',
      terreno: ''
    }],
    veg:[{
      columnas: [{titulo:''},{titulo:'Responsable'}, {titulo:'Asignado a'}],
      datos: []
    }],
    v:[{
      columnas: [
                  {titulo:''},
                  {titulo:'Responsable'},
                  {titulo:'Asignado a'},
                  {titulo:'Linea base'},
                  {titulo:'F. estimada'},
                  {titulo:'Estatus'},
                  {titulo:'Adjunto'},
                  {titulo:'Detalle'}
                ],
      datos: []
    }]
  }


  onOpenModal = ventana => {  
    this.setState({ modal: [{ showModal: true, encabezado: ventana, terreno: this.state.datosTerreno.NombredelTerreno2 }] });
  };

  onCloseModal = () => {
    this.setState({ modal: [{ showModal: false, encabezado: '', terreno: '' }] });
  };

  async componentDidMount(){
    var currentItem = await sp.web.lists.getByTitle('Terrenos').items.getById(this.state.idTerreno).get();
    var actividades = await sp.web.lists.getByTitle('Flujo Tareas').items.filter('(IdProyectoInversion/ID eq ' + currentItem.IdProyectoInversionId + ') or (IdTerreno/ID eq ' + this.state.idTerreno + ')').select('ID','Title','IdProyectoInversion/ID','IdProyectoInversion/Title', 'IdTerreno/ID','IdTerreno/Title', 'Nivel/ID', 'IdTarea/ID', 'IdTarea/TxtCluster', 'IdTarea/TxtVentana','EstatusId').expand('IdProyectoInversion', 'IdTerreno', 'Nivel', 'IdTarea').getAll();
    var RFSEnviado=false;
    var datosEG = [{
      columnas: [{titulo:''},{titulo:'Responsable'}, {titulo:'Asignado a'}],
      datos: []
    }];
    actividades.sort(function(a, b){
      if (a.IdTarea.ID === 24){
        if(a.EstatusId===3){
          RFSEnviado = true;
        }
      }
      if (a.IdTarea.TxtCluster > b.IdTarea.TxtCluster)
            return 1;
        if (a.IdTarea.TxtCluster < b.IdTarea.TxtCluster)
            return -1;

        return 0;
    });

    if(!RFSEnviado){
      datosEG[0].datos = await sp.web.lists.getByTitle('Tareas').items.filter('DetonacionInicial eq 1').select('ID','Title','Cluster','Grupo/NombreCortoGantt').expand('Grupo').orderBy('Orden', true).get();
    }

    this.setState({datosTerreno: currentItem, datosActividades: actividades, veg: datosEG});
  }

  render(){
    const { datosTerreno, modal, veg } = this.state;
    return (
      <div className="App">
        <Principal />
        <Encabezado terreno = {datosTerreno} abrirModal={this.onOpenModal} />
        <Generico ventanaEg = {veg[0]} />
        <Modal open = {modal} cerrar={this.onCloseModal} />
      </div>
    );
  }
}

export default App;