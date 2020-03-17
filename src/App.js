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
  state = {
    itemsT: [],
    itemsPI: [],
    isActive: false,
    isInActive: true,
    idProyecto: 0,
    idTerreno: 0,
    ventana: 4,
    datosTerreno: [],
    datosActividades: [],
    modal: [{
      showModal: false,
      encabezado: '',
      terreno: ''
    }],
    veg: [{
      columnas: [{ titulo: '' }, { titulo: 'Grupo responsable' }, { titulo: 'Asignado a' }],
      datos: []
    }]
  }

  //función utilizada para seleccionar el terreno y abrir los clusters
  onSeleccionTereno = (IdTerreno, IdProyecto, TxtTerreno) => {
    this.setState({ idTerreno: IdTerreno, idProyecto: IdProyecto })

    if (window.confirm('Esta seguro que sesea abrir el detalle del terreno ' + TxtTerreno + "?"))
      this.setState({ isInActive: false, isActive: true })
    else
      this.setState({ isActive: false })
  }

  onOpenModal = ventana => {
    this.setState({ modal: [{ showModal: true, encabezado: ventana, terreno: this.state.datosTerreno.NombredelTerreno2 }] });
  };

  onCloseModal = () => {
    this.setState({ modal: [{ showModal: false, encabezado: '', terreno: '' }] });
  };

  async componentDidMount() {

    var listItemsT = await sp.web.lists.getByTitle("Terrenos").items
      .select("ID", "Title", "Modified", "NombredelTerreno2", "IdProyectoInversion/ID", "IdProyectoInversion/NombreProyectoInversion")
      .expand("IdProyectoInversion")
      .filter("(Empadronamiento eq null) and (IdProyectoInversion/ID ne null)")
      .orderBy("ID", false)
      .getAll();

    listItemsT.sort(function (a, b) {
      if (a.NombredelTerreno2 > b.NombredelTerreno2)
        return 1;
      if (a.NombredelTerreno2 < b.NombredelTerreno2)
        return -1;

      return 0;
    });

    var listItemsPI = await sp.web.lists.getByTitle("Proyecto Inversion").items
      .select("ID", "NombreProyectoInversion")
      .orderBy("ID", false)
      .getAll();

    listItemsPI.sort(function (a, b) {
      if (a.NombreProyectoInversion > b.NombreProyectoInversion)
        return 1;
      if (a.NombreProyectoInversion < b.NombreProyectoInversion)
        return -1;

      return 0;
    });

    /*
     /*var listItemsT = await sp.web.lists.getByTitle("Flujo Tareas").views.getbytitle('MyView').items
      var listItemsT = await sp.web.lists.getByTitle("Flujo Tareas").items
      .select("ID", "Modified", "IdProyectoInversion/ID", "IdProyectoInversion/NombreProyectoInversion",
        "IdTerreno/ID", "IdTerreno/NombredelTerreno", "IdTarea/ID", "IdTarea/Title", "Estatus/Title",
        "Editor/Title")
      .expand("IdProyectoInversion", "IdTerreno", "IdTarea", "Estatus", "Editor")
      .filter("(IdTerreno/Empadronamiento eq null) and (IdTerreno/ID ne null)")
      .orderBy("IdTarea/ID", true)
      .getAll();
    var currentItem = await sp.web.lists.getByTitle('Terrenos').items.getById(this.state.idTerreno).get();
    var actividades = await sp.web.lists.getByTitle('Flujo Tareas').items.filter('(IdProyectoInversion/ID eq ' + currentItem.IdProyectoInversionId + ') or (IdTerreno/ID eq ' + this.state.idTerreno + ')').select('ID', 'Title', 'IdProyectoInversion/ID', 'IdProyectoInversion/Title', 'IdTerreno/ID', 'IdTerreno/Title', 'Nivel/ID', 'IdTarea/ID', 'IdTarea/TxtCluster', 'IdTarea/TxtVentana').expand('IdProyectoInversion', 'IdTerreno', 'Nivel', 'IdTarea').getAll();

    const actsCluster = actividades.sort((a, b) =>
      a.IdTarea.TxtCluster - b.IdTarea.TxtCluster);
    var datosEG = [];

    this.setState({ itemsT: listItemsT, itemsPI: listItemsPI, datosTerreno: currentItem, datosActividades: actividades });*/

    this.setState({ itemsT: listItemsT, itemsPI: listItemsPI });
  }

  render() {
    const { itemsT, itemsPI, datosTerreno, modal, veg } = this.state;
    return (
      <div className="App">
        {this.state.isInActive ? <Principal selecciontereno={this.onSeleccionTereno} itemsT={itemsT} itemsPI={itemsPI} /> : null}
        {this.state.isActive ? <Encabezado terreno={datosTerreno} abrirModal={this.onOpenModal} /> : null}
        {this.state.isActive ? <Generico ventanaEg={veg[0]} fetchmoredata={this.fetchMoreData} /> : null}
        <Modal open={modal} cerrar={this.onCloseModal} />
      </div>
    );
  }
}

export default App;