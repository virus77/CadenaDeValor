import React, { Component } from 'react';
import './App.css';
import { sp } from '@pnp/sp';
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import Principal from './componentes/Principal';
import Generico from './componentes/Generico';
import 'bootstrap/dist/css/bootstrap.min.css';

const currentWeb = Web(window.location.protocol + '//' + window.location.host + "/CompraDeTerreno/")

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
    ventana:4,
    nombreTerreno: ''
  }

  //función utilizada para seleccionar el terreno y abrir los clusters
  onSeleccionTerreno = async (IdTerreno, IdProyecto, TxtTerreno, maco, rfs, TerrenoId, IdProyInv) => {

    if (window.confirm('¿Está seguro que desea abrir el detalle del terreno ' + TxtTerreno + "?")) {
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
    var listItemsT = await currentWeb.lists.getByTitle("Terrenos").items
      .select("ID", "Title", "Modified", "NombredelTerreno", "NombredelTerreno2", "IdProyectoInversion/ID",
        "IdProyectoInversion/NombreProyectoInversion", "IdProyectoInversion/Title", "MACO")
      .expand("IdProyectoInversion")
      .filter("(Empadronamiento eq null) and (IdProyectoInversion/ID ne null)")
      .orderBy("NombredelTerreno2", true)
      .top(1000)
      .get();

    var listItemsPI = await currentWeb.lists.getByTitle("Proyecto Inversion").items
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