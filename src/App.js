//#region Componentes
import React, { Component } from 'react';
import Principal from './componentes/Principal';
import Generico from './componentes/Generico';
//#endregion
//#region Librerías externas
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
//#endregion
//#region Estilos
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
//#endregion

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
    nombreTerreno: '',
    enDashboard: false,
    webs: {}
  }

  //función utilizada para seleccionar el terreno y abrir los clusters
  onSeleccionTerreno = (IdTerreno, IdProyecto, TxtTerreno, maco, rfs, TerrenoId, IdProyInv, enDashboard) => {
    this.setState({
      isInActive: false, isActive: true, idTerreno: IdTerreno, idProyecto: IdProyecto, nombreTerreno: TxtTerreno,
      Maco: maco, RFS: rfs, TerrenoId, IdProyInv, enDashboard: enDashboard
    });
  }

  onOpenModal = (id, esTarea) => {
    this.setState({ modal: [{ showModal: true, id: id, esTarea: esTarea, terreno: this.state.nombreTerreno }] });
  };

  onCloseModal = () => {
    this.setState({ modal: [{ showModal: false, id: 0, encabezado: '', terreno: '' }] });
  };

  async componentDidMount() {
    //Objeto Web del sitio raíz
    //Descomentar la linea inferior cuando se vaya a generar el build para los 3 ambientes
    const webCdV = Web(window.location.protocol + '//' + window.location.host)
    //Descomentar la linea inferior cuando se esté modificando el código en desarrollo
    //const webCdV = Web('http://con.quierocasa.com.mx:21520')
    //Subsitios del Objeto Web del sitio raíz
    const websCdV = await webCdV.webs()
    //Objeto Web del sitio de versionado
    let webBdTV = websCdV.find(x=> x.Title === 'Busqueda Terreno Versionado')
    const urlWebBdTV = webBdTV.Url
    webBdTV = Web(urlWebBdTV)
    webBdTV.Url = urlWebBdTV
    //Objeto Web del sitio de compra
    let webCdT = websCdV.find(x=> x.Title === 'Compra de terreno')
    const urlWebCdT = webCdT.Url
    webCdT = Web(urlWebCdT)
    webCdT.Url = urlWebCdT
    //Objeto Web del sitio de Bitácoras
    let webBitacoras = websCdV.find(x=> x.Title === 'Sistema de Bitácoras')
    const urlWebBitacoras = webBitacoras.Url
    webBitacoras = Web(urlWebBitacoras)
    webBitacoras.Url = urlWebBitacoras

    const listItemsT = await webCdT.lists.getByTitle("Terrenos").items
    .select("ID", "Title", "Modified", "NombredelTerreno", "NombredelTerreno2", "IdProyectoInversion/ID",
      "IdProyectoInversion/NombreProyectoInversion", "IdProyectoInversion/Title", "MACO", "EnDashboard")
    .expand("IdProyectoInversion")
    .filter("(Empadronamiento eq null) and (IdProyectoInversion/ID ne null)")
    .orderBy("NombredelTerreno2", true)
    .top(1000)
    .get()

    const listItemsPI = await webCdT.lists.getByTitle("Proyecto Inversion").items
    .select("ID", "NombreProyectoInversion")
    .orderBy("NombreProyectoInversion", true)
    .top(1000)
    .get();

    this.setState({ itemsT: listItemsT, itemsPI: listItemsPI, webs: {cdv: webCdV, bdtv: webBdTV, cdt: webCdT, bitacoras: webBitacoras }});
  }

  render(){
    const { itemsT, itemsPI, idProyecto, idTerreno, nombreTerreno, Maco, RFS, TerrenoId, IdProyInv, enDashboard, webs } = this.state;
    return (
      <div className="App">
        {this.state.isInActive && <Principal selecciontereno={this.onSeleccionTerreno} itemsT={itemsT} itemsPI={itemsPI} />}
        {this.state.isActive && <Generico enDashboard={enDashboard} rfs = {RFS} idProyecto = {idProyecto} idTerreno = {idTerreno} terreno = {nombreTerreno} idVentana = {this.state.ventana} maco = {Maco} TerrenoId={TerrenoId} IdProyInv={IdProyInv} webs={webs} />}
      </div>
    );
  }
}

export default App;