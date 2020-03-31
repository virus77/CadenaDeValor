import React, { Component } from 'react';
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
    TerrenoId: "",
    IdProyInv: "",
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
  onSeleccionTerreno = async (IdTerreno, IdProyecto, TxtTerreno, maco, rfs, TerrenoId, IdProyInv) => {

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
        Maco: maco, RFS: rfs, TerrenoId, IdProyInv
      });
    }
    else {
      this.setState({
        isActive: false, idTerreno: IdTerreno, idProyecto: IdProyecto, nombreTerreno: '', Maco: maco,
        RFS: rfs, TerrenoId, IdProyInv
      })
    }
  }

  onOpenModal = (id, esTarea) => {
    this.setState({ modal: [{ showModal: true, id: id, esTarea: esTarea, terreno: this.state.nombreTerreno }] });
  };

  onCloseModal = () => {
    this.setState({ modal: [{ showModal: false, id: 0, encabezado: '', terreno: '' }] });
  };

  async componentDidMount() {
    var listItemsT = await sp.web.lists.getByTitle("Terrenos").items
      .select("ID", "Title", "Modified", "NombredelTerreno2", "IdProyectoInversion/ID",
        "IdProyectoInversion/NombreProyectoInversion", "IdProyectoInversion/Title", "MACO")
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

  render(){
    const { itemsT, itemsPI, idProyecto, idTerreno, nombreTerreno, Maco, RFS, TerrenoId, IdProyInv } = this.state;
    return (
      <div className="App">
        {this.state.isInActive ? <Principal selecciontereno={this.onSeleccionTerreno} itemsT={itemsT} itemsPI={itemsPI} /> : null}
        {this.state.isActive ? <Generico rfs = {RFS} idProyecto = {idProyecto} idTerreno = {idTerreno} terreno = {nombreTerreno} idVentana = {this.state.ventana} maco = {Maco} TerrenoId={TerrenoId} IdProyInv={IdProyInv} /> : null}
      </div>
    );
  }
}

export default App;