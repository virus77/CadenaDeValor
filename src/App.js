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
    idPI:135,
    idTerreno: 285,
    ventana:4,
    datosTerreno: [],
    datosActividades: [],
    modal:[{
      showModal: false,
      id: 0,
      encabezado: '',
      terreno: ''
    }],
    veg:[{
      columnas: [{titulo:'', estilo: 'col-sm'},{titulo:'Responsable', estilo: 'col-sm'}, {titulo:'Asignado a', estilo: 'col-sm'}],
      datos: []
    }],
    v:[{
      columnas: [
                  {titulo:'', estilo: 'col-sm-5'},
                  {titulo:'Responsable', estilo: 'col-sm-1'},
                  {titulo:'Asignado a', estilo: 'col-sm-1'},
                  {titulo:'Linea base', estilo: 'col-sm-1'},
                  {titulo:'F. estimada', estilo: 'col-sm-1'},
                  {titulo:'Estatus', estilo: 'col-sm-1'},
                  {titulo:'Adjunto', estilo: 'col-sm-1'},
                  {titulo:'Detalle', estilo: 'col-sm-1'}
                ],
      datos: []
    }],
    clustersVentana: []
  }


  onOpenModal = idTarea => {  
    this.setState({ modal: [{ showModal: true, id: idTarea, terreno: this.state.datosTerreno.NombredelTerreno2 }] });
  };

  onCloseModal = () => {
    this.setState({ modal: [{ showModal: false, id: 0, encabezado: '', terreno: '' }] });
  };

  onSelectWindow = idVentana =>{
    var result = [];
    if(idVentana === 4){
      result = Array.from(new Set(this.state.veg[0].datos.map(s=> s.Tarea.TxtCluster)))
        .map(currentCluster=>{
            return{
              cluster: this.state.veg[0].datos.find(s=> s.Tarea.TxtCluster === currentCluster)
            };
        });

      result = result.filter(x=> x.cluster !== undefined);
    }else{
      result = Array.from(new Set(this.state.v[0].datos.map(s=> s.IdTarea.TxtCluster)))
        .map(currentCluster=>{
            return{
              cluster: this.state.v[0].datos.find(s=> s.IdTarea.TxtCluster ===currentCluster&& (parseFloat(s.IdTarea.Orden) > parseFloat(idVentana) && parseFloat(s.IdTarea.Orden) < parseFloat(idVentana +1)))
            };
        });
    }
    result = result.filter(x=> x.cluster !== undefined);
    this.setState({ventana: idVentana, clustersVentana: result});
  }

  async componentDidMount(){
    var currentItem = await sp.web.lists.getByTitle('Terrenos').items.getById(this.state.idTerreno).get();
    var actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
    .filter('(IdProyectoInversion/ID eq ' + currentItem.IdProyectoInversionId + ') or (IdTerreno/ID eq ' + this.state.idTerreno + ')')
    .select('ID','Title','IdProyectoInversion/ID','IdProyectoInversion/Title', 'IdTerreno/ID','IdTerreno/Title','Nivel/ID','Nivel/Title','IdTarea/ID','IdTarea/Title','IdTarea/TxtCluster','IdTarea/TxtVentana','IdTarea/Orden','IdTarea/Checkable','Estatus/ID','Estatus/Title','GrupoResponsable/ID','GrupoResponsable/NombreCortoGantt','AsignadoA/ID','AsignadoA/Name','LineaBase','FechaEstimada')
    .expand('IdProyectoInversion', 'IdTerreno', 'Nivel', 'IdTarea', 'Estatus', 'GrupoResponsable','AsignadoA').getAll();

    var RFSEnviado=false;
    var datosEG = [{
      columnas: [{titulo:'', estilo: 'col-sm'},{titulo:'Responsable', estilo: 'col-sm'}, {titulo:'Asignado a', estilo: 'col-sm'}],
      datos: []
    }];

    actividades.sort(function(a, b){
      if (a.IdTarea.ID === 24){
        if(a.EstatusId===3){
          RFSEnviado = true;
        }
      }
      if (a.IdTarea.Orden > b.IdTarea.Orden)
            return 1;
        if (a.IdTarea.Orden < b.IdTarea.Orden)
            return -1;

        return 0;
    });

    var datosActs = [{
      columnas: [
        {titulo:'', estilo: 'col-sm-5'},
        {titulo:'Responsable', estilo: 'col-sm-1'},
        {titulo:'Asignado a', estilo: 'col-sm-1'},
        {titulo:'Linea base', estilo: 'col-sm-1'},
        {titulo:'F. estimada', estilo: 'col-sm-1'},
        {titulo:'Estatus', estilo: 'col-sm-1'},
        {titulo:'Adjunto', estilo: 'col-sm-1'},
        {titulo:'Detalle', estilo: 'col-sm-1'}
      ],
      datos: actividades
    }];

    if(!RFSEnviado){
      datosEG[0].datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
      .filter('ProyectoInversionId eq ' + this.state.idPI)
      .select('ID','ProyectoInversion/ID','Terreno/ID','Tarea/ID','Tarea/Title','Tarea/TxtCluster','Tarea/OrdenEG','Tarea/Checkable','GrupoResponsable/ID','GrupoResponsable/NombreCortoGantt','Seleccionado', 'IdFlujoTareasId')
      .expand('ProyectoInversion', 'Terreno', 'Tarea','GrupoResponsable').orderBy('Tarea/OrdenEG',true).get();

      var result = [];
      result = Array.from(new Set(datosEG[0].datos.map(s=> s.Tarea.TxtCluster)))
        .map(currentCluster=>{
            return{
              cluster: datosEG[0].datos.find(s=> s.Tarea.TxtCluster === currentCluster)
            };
        });

      result = result.filter(x=> x.cluster !== undefined);
    }

    this.setState({datosTerreno: currentItem, datosActividades: actividades, v: datosActs, veg: datosEG, clustersVentana: result});
  }

  render(){
    const { datosTerreno, modal, veg, v } = this.state;
    return (
      <div className="App">
        {/*<Principal />*/}
        <Encabezado terreno = {datosTerreno.NombredelTerreno2} idVentana = {this.state.ventana} abrirModal={this.onOpenModal} cambiarVentana={this.onSelectWindow}  />
        <Generico clusters = {this.state.clustersVentana} datosVentana = {this.state.ventana === 4 ? veg[0] : v[0]} idVentana = {this.state.ventana} abrirModal={this.onOpenModal} />
        <Modal open = {modal} cerrar={this.onCloseModal} />
      </div>
    );
  }
}

export default App;