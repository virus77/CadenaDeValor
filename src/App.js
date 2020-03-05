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
  }

  onOpenModal = ventana => {  
    this.setState({ modal: [{ showModal: true, encabezado: ventana, terreno: this.state.datosTerreno.NombredelTerreno2 }] });
  };

  onCloseModal = () => {
    this.setState({ modal: [{ showModal: false, encabezado: '', terreno: '' }] });
  };

  async componentDidMount(){
    var currentItem = await sp.web.lists.getByTitle('Terrenos').items.getById(this.state.idTerreno).get();
    var actividades = await sp.web.lists.getByTitle('Flujo Tareas').items.filter('(IdProyectoInversion/ID eq ' + currentItem.IdProyectoInversionId + ') or (IdTerreno/ID eq ' + this.state.idTerreno + ')').select('ID','Title','IdProyectoInversion/ID','IdProyectoInversion/Title', 'IdTerreno/ID','IdTerreno/Title', 'Nivel/ID', 'IdTarea/ID').expand('IdProyectoInversion', 'IdTerreno', 'Nivel', 'IdTarea').get();
    this.setState({datosTerreno: currentItem, datosActividades: actividades});
  }

  render(){
    const { datosTerreno, modal } = this.state;
    return (
      <div className="App">
        <Principal />
        <Encabezado terreno = {datosTerreno} abrirModal={this.onOpenModal} />
        <Generico />
        <Modal open = {modal} cerrar={this.onCloseModal} />
      </div>
    );
  }
}

export default App;