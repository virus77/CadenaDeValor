import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { sp } from '@pnp/sp';
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import Principal from './componentes/Principal';
//import Encabezado from './componentes/Encabezado';
import Generico from './componentes/Generico';
//import Modal from './componentes/Ventana';
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
    Maco: "",
    RFS: false,
    //idProyecto:135,
    //idTerreno: 285,
    ventana: 4,
    nombreTerreno: '',
    modal: [{
      showModal: false,
      id: 0,
      encabezado: '',
      terreno: '',
      esTarea: false
    }],
    veg: [],
    v: [],
    clustersVentana: [],
    contadorAdministracion: 0,
    contadorNormativo: 0,
    contadorProyectos: 0,
  }

  //función utilizada para seleccionar el terreno y abrir los clusters
  onSeleccionTerreno = async (IdTerreno, IdProyecto, TxtTerreno, maco, rfs) => {

    if (window.confirm('¿Está seguro que desea abrir el detalle del terreno ' + TxtTerreno + "?")) {
      //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversión
      /*var actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
      .filter('(IdProyectoInversionId eq ' + IdProyecto + ') or (IdTerrenoId eq ' + IdTerreno + ')')
      .select('IdTarea/TxtVentana')
      .expand('IdTarea').getAll();

      var RFSEnviado = false;
      var datosEG = [{
        columnas: [{ titulo: '', estilo: 'col-sm' }, { titulo: 'Responsable', estilo: 'col-sm' }, { titulo: 'Asignado a', estilo: 'col-sm' }],
        datos: []
      }];

      var ventanas = [actividades.reduce((a,c) => (a[c.IdTarea.TxtVentana]=(a[c.IdTarea.TxtVentana]||[]).concat(c),a) ,{})];

      if (!RFSEnviado) {
        datosEG[0].datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
        .filter('ProyectoInversionId eq ' + IdProyecto)
        .select('ID','ProyectoInversion/ID','Terreno/ID','Tarea/ID','Tarea/Title','Tarea/TxtCluster','Tarea/TxtVentana','Tarea/OrdenEG','Tarea/Checkable','GrupoResponsable/ID','GrupoResponsable/NombreCortoGantt','Seleccionado', 'IdFlujoTareasId')
        .expand('ProyectoInversion', 'Terreno', 'Tarea','GrupoResponsable').orderBy('Tarea/OrdenEG',true).get();

        var result = [];
        result = Array.from(new Set(datosEG[0].datos.map(s=> s.Tarea.TxtCluster)))
        .map(currentCluster=>{
            return{
              cluster: datosEG[0].datos.find(s=> s.Tarea.TxtCluster === currentCluster).Tarea
            };
        });

        result = result.filter(x=> x.cluster !== undefined);
      }*/
      this.setState({
        isInActive: false, isActive: true, idTerreno: IdTerreno, idProyecto: IdProyecto, nombreTerreno: TxtTerreno,
        Maco: maco, RFS: rfs
      });
    }
    else {
      this.setState({ isActive: false, idTerreno: IdTerreno, idProyecto: IdProyecto, nombreTerreno: '', Maco: maco, 
      RFS: rfs })
    }
  }

  onOpenModal = (id, esTarea) => {
    this.setState({ modal: [{ showModal: true, id: id, esTarea: esTarea, terreno: this.state.nombreTerreno }] });
  };

  onCloseModal = () => {
    this.setState({ modal: [{ showModal: false, id: 0, encabezado: '', terreno: '' }] });
  };

  onSelectWindow = async idVentana => {
    const { idProyecto, idTerreno } = this.state
    //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversión
    var actividades = [];

    var result = [];
    if (idVentana === 4) {
      var datosEG = [{
        columnas: [{ titulo: '', estilo: 'col-sm' }, { titulo: 'Responsable', estilo: 'col-sm' }, { titulo: 'Asignado a', estilo: 'col-sm' }],
        datos: []
      }];

      datosEG[0].datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
        .filter('ProyectoInversionId eq ' + idProyecto)
        .select('ID', 'ProyectoInversion/ID', 'Terreno/ID', 'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/OrdenEG', 'Tarea/Checkable', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId')
        .expand('ProyectoInversion', 'Terreno', 'Tarea', 'GrupoResponsable')
        .orderBy('Tarea/OrdenEG', true)
        .get();

      result = Array.from(new Set(datosEG[0].datos.map(s => s.Tarea.TxtCluster)))
        .map(currentCluster => {
          return {
            cluster: datosEG[0].datos.find(s => s.Tarea.TxtCluster === currentCluster).Tarea
          };
        });

      result = result.filter(x => x.cluster !== undefined);
      this.setState({ ventana: idVentana, clustersVentana: result, veg: datosEG });
    } else {
      //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversión
      actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
        .filter('(IdProyectoInversionId eq ' + idProyecto + ') or (IdTerrenoId eq ' + idTerreno + ')')
        .select('ID', 'Title', 'IdProyectoInversion/ID', 'IdProyectoInversion/Title', 'IdTerreno/ID', 'IdTerreno/Title',
          'Nivel/ID', 'Nivel/Title', 'IdTarea/ID', 'IdTarea/Title', 'IdTarea/TxtCluster', 'IdTarea/TxtVentana', 'IdTarea/Orden',
          'IdTarea/Checkable', 'Estatus/ID', 'Estatus/Title', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt',
          'AsignadoA/ID', 'AsignadoA/Name', 'LineaBase', 'FechaEstimada')
        .expand('IdProyectoInversion', 'IdTerreno', 'Nivel', 'IdTarea', 'Estatus', 'GrupoResponsable', 'AsignadoA')
        .getAll();

      actividades.sort(function (a, b) {
        if (a.IdTarea.Orden > b.IdTarea.Orden)
          return 1;
        if (a.IdTarea.Orden < b.IdTarea.Orden)
          return -1;
        return 0;
      });
      var ventanas = [actividades.reduce((a, c) => (a[c.IdTarea.TxtVentana] = (a[c.IdTarea.TxtVentana] || []).concat(c), a), {})];
      var datosActs = [{
        columnas: [
          { titulo: '', estilo: 'col-sm-5' },
          { titulo: 'Responsable', estilo: 'col-sm-1' },
          { titulo: 'Asignado a', estilo: 'col-sm-1' },
          { titulo: 'Linea base', estilo: 'col-sm-1' },
          { titulo: 'F. estimada', estilo: 'col-sm-1' },
          { titulo: 'Estatus', estilo: 'col-sm-1' },
          { titulo: 'Adjunto', estilo: 'col-sm-1' },
          { titulo: 'Detalle', estilo: 'col-sm-1' }
        ],
        datos: actividades
      }]

      result = Array.from(new Set(datosActs[0].datos.map(s => s.IdTarea.TxtCluster)))
        .map(currentCluster => {
          return {
            cluster: datosActs[0].datos.find(s => s.IdTarea.TxtCluster === currentCluster && (parseFloat(s.IdTarea.Orden) > parseFloat(idVentana) && parseFloat(s.IdTarea.Orden) < parseFloat(idVentana + 1)))
          };
        });

      result = result.filter(x => x.cluster !== undefined);
      this.setState({ ventana: idVentana, clustersVentana: result, v: datosActs, contadorAdministracion: ventanas[0].Administración.length, contadorNormativo: ventanas[0].Normativo.length, contadorProyectos: ventanas[0].Proyectos.length });
    }
  }

  async componentDidMount() {
    var listItemsT = await sp.web.lists.getByTitle("Terrenos").items
      .select("ID", "Title", "MACO", "Modified", "NombredelTerreno2", "IdProyectoInversion/ID",
        "IdProyectoInversion/NombreProyectoInversion")
      .expand("IdProyectoInversion")
      .filter("(Empadronamiento eq null) and (IdProyectoInversion/ID ne null)")
      .orderBy("NombredelTerreno2", true)
      .top(1000)
      .get();

    var listItemsPI = await sp.web.lists.getByTitle("Proyecto Inversion").items
      .select("ID", "NombreProyectoInversion")
      .orderBy("NombreProyectoInversion", true)
      .top(1000)
      .get();

    this.setState({ itemsT: listItemsT, itemsPI: listItemsPI });
  }

  render() {
    const { itemsT, itemsPI, idProyecto, idTerreno, nombreTerreno, modal, veg, v, contadorAdministracion,
      contadorNormativo, contadorProyectos, Maco } = this.state;
    return (
      <div className="App">
        {this.state.isInActive ? <Principal selecciontereno={this.onSeleccionTerreno} itemsT={itemsT} itemsPI={itemsPI} /> : null}
        {/*this.state.isActive ? <Encabezado terreno = {header} idVentana = {this.state.ventana} abrirModal={this.onOpenModal} cambiarVentana={this.onSelectWindow} totalAdmin = {contadorAdministracion} totalNorm = {contadorNormativo} totalProy = {contadorProyectos}  /> : null*/}
        {/*this.state.isActive ? <Generico idProyecto = {idProyecto} idTerreno = {idTerreno} terreno = {header} clusters = {this.state.clustersVentana} datosVentana = {this.state.ventana === 4 ? veg[0] : v[0]} idVentana = {this.state.ventana} abrirModal={this.onOpenModal} /> : null*/}
        {this.state.isActive ? <Generico idProyecto={idProyecto} idTerreno={idTerreno} terreno={nombreTerreno} idVentana={this.state.ventana} maco={Maco} /> : null}
        {/*this.state.isActive ? <Modal open = {modal} cerrar={this.onCloseModal} /> : null*/}
      </div>
    );
  }
}

export default App;