import React, { Component } from 'react';
import Encabezado from '../componentes/Encabezado';
import Modal from '../componentes/Ventana';
import Backdrop from '../componentes/Backdrop';
import arrow_down_icon from '../imagenes/arrow_down_icon.png';
import attach_icon from '../imagenes/attach_icon.png';
import more_details_icon from '../imagenes/more_details_icon.png';
import assignedTo_icon from '../imagenes/assignedTo_icon.png';
import plus_icon from '../imagenes/plus_icon.png';
import '../estilos/generico.css';
//import {onSave} from '../js/eg.js';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
var idVentanaAnterior = 0;
var checkedItems = [];
class Generico extends Component{
    constructor(props){
        super(props)
        this.inialState = {
            cargado: false,
            idProyecto:props.idProyecto,
            idTerreno: props.idTerreno,
            MACO: props.maco,
            idVentana: 4,
            totalAdmin: 0,
            totalNorm: 0,
            totalProy: 0,
            idVentanaAnterior: 3,
            datosVentanaEG:[],
            datosVentana:[],
            datosStarGanttUser: [],
            clustersVentana: [],
            modal:{
                abierto: false,
                id: 0,
                terreno: '',
                esTarea:false
            },
            datos:{
                campo: '',
                valor:''
            },
        }
        this.state = this.inialState;
    }

    onCambiarVentana = async idVentanaSeleccionada =>{
        const {idProyecto, idTerreno} = this.state
        var actividades = [];
    
        var result = [];
        switch (idVentanaSeleccionada) {
            case 4:
                var datosEG = {
                    columnas: [{ titulo: '', estilo: 'col-sm' }, { titulo: 'Responsable', estilo: 'col-sm' }, { titulo: 'Asignado a', estilo: 'col-sm' }],
                    datos: []
                };

                datosEG.datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
                datosEG.datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
                    .filter('ProyectoInversionId eq ' + idProyecto)
                    .select('ID', 'ProyectoInversion/ID', 'Terreno/ID', 'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/OrdenEG', 'Tarea/Checkable', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId')
                    .expand('ProyectoInversion', 'Terreno', 'Tarea', 'GrupoResponsable')
                    .orderBy('Tarea/OrdenEG', true)
                    .get();

                result = Array.from(new Set(datosEG.datos.map(s => s.Tarea.TxtCluster)))
                    .map(currentCluster => {
                        return {
                            cluster: datosEG.datos.find(s => s.Tarea.TxtCluster === currentCluster).Tarea
                        };
                    });

                result = result.filter(x => x.cluster !== undefined);
                this.setState({ idVentana: idVentanaSeleccionada, clustersVentana: result, datosVentanaEG: datosEG, disabled: true });
                break;
            case 1:
            case 2:
            case 3:
                //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversión
                actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                    .filter('(IdProyectoInversionId eq ' + idProyecto + ') or (IdTerrenoId eq ' + idTerreno + ')')
                    .select('ID', 'Title', 'Favoritos', 'IdProyectoInversion/ID', 'IdProyectoInversion/Title', 'IdTerreno/ID',
                        'IdTerreno/Title', 'Nivel/ID', 'Nivel/Title', 'IdTarea/ID', 'IdTarea/Title', 'IdTarea/TxtCluster',
                        'IdTarea/TxtVentana', 'IdTarea/Orden', 'IdTarea/Checkable', 'Estatus/ID', 'Estatus/Title', 'GrupoResponsable/ID',
                        'GrupoResponsable/NombreCortoGantt', 'AsignadoA/ID', 'AsignadoA/Name', 'LineaBase', 'FechaEstimada')
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
                var datosActs = {
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
                }

                result = Array.from(new Set(datosActs.datos.map(s => s.IdTarea.TxtCluster)))
                    .map(currentCluster => {
                        return {
                            cluster: datosActs.datos.find(s => s.IdTarea.TxtCluster === currentCluster && (parseFloat(s.IdTarea.Orden) > parseFloat(idVentanaSeleccionada) && parseFloat(s.IdTarea.Orden) < parseFloat(idVentanaSeleccionada + 1)))
                        };
                    });

                result = result.filter(x => x.cluster !== undefined);
                this.setState({
                    idVentana: idVentanaSeleccionada, clustersVentana: result, datosVentana: datosActs, totalAdmin: ventanas[0].Administración.length,
                    totalNorm: ventanas[0].Normativo.length, totalProy: ventanas[0].Proyectos.length, idVentanaAnterior: idVentanaSeleccionada,
                    AdministracionAnterior: ventanas[0].Administración.length, NormativoAnterior: ventanas[0].Normativo.length,
                    ProyectosAnterior: ventanas[0].Proyectos.length, disabled: false
                });
                break;

            //Filtro de favoritos
            case 5:
                //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversión
                idVentanaSeleccionada = this.state.idVentanaAnterior;

                actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                    .filter('(Favoritos ne 0) and (IdProyectoInversionId eq ' + idProyecto + ') or (IdTerrenoId eq ' + idTerreno + ')')
                    .select('ID', 'Title', 'Favoritos', 'IdProyectoInversion/ID', 'IdProyectoInversion/Title', 'IdTerreno/ID',
                        'IdTerreno/Title', 'Nivel/ID', 'Nivel/Title', 'IdTarea/ID', 'IdTarea/Title', 'IdTarea/TxtCluster',
                        'IdTarea/TxtVentana', 'IdTarea/Orden', 'IdTarea/Checkable', 'Estatus/ID', 'Estatus/Title', 'GrupoResponsable/ID',
                        'GrupoResponsable/NombreCortoGantt', 'AsignadoA/ID', 'AsignadoA/Name', 'LineaBase', 'FechaEstimada')
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
                var datosActs = {
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
                }

                result = Array.from(new Set(datosActs.datos.map(s => s.IdTarea.TxtCluster)))
                    .map(currentCluster => {
                        return {
                            cluster: datosActs.datos.find(s => s.IdTarea.TxtCluster === currentCluster && (parseFloat(s.IdTarea.Orden) > parseFloat(idVentanaSeleccionada) && parseFloat(s.IdTarea.Orden) < parseFloat(idVentanaSeleccionada + 1)))
                        };
                    });

                result = result.filter(x => x.cluster !== undefined);
                if (result.length > 0) {
                    var Proyectos = ventanas[0].Proyectos != undefined ? ventanas[0].Proyectos.length : 0;
                    this.setState({
                        idVentana: idVentanaSeleccionada, clustersVentana: result, datosVentana: datosActs, totalAdmin: this.state.totalAdmin,
                        totalNorm: this.state.totalNorm, totalProy: this.state.totalProy, idVentanaAnterior: idVentanaSeleccionada,
                        disabled: false
                    });
                }
                else {
                    alert("No contamos con datos para filtrar, de favor intente de nuevo");
                }

                break;
            //Filtro de gantt
            case 6:
                //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversión
                idVentanaSeleccionada = this.state.idVentanaAnterior;
                actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                    .filter('(IdLocalizacionActividades/ID ne null) and (IdProyectoInversionId eq ' + idProyecto + ') or (IdTerrenoId eq ' + idTerreno + ')')
                    .select('ID', 'Title', 'Favoritos', 'IdProyectoInversion/ID', 'IdProyectoInversion/Title', 'IdTerreno/ID',
                        'IdTerreno/Title', 'Nivel/ID', 'Nivel/Title', 'IdTarea/ID', 'IdTarea/Title', 'IdTarea/TxtCluster',
                        'IdTarea/TxtVentana', 'IdTarea/Orden', 'IdTarea/Checkable', 'Estatus/ID', 'Estatus/Title', 'GrupoResponsable/ID',
                        'GrupoResponsable/NombreCortoGantt', 'AsignadoA/ID', 'AsignadoA/Name', 'LineaBase', 'FechaEstimada',
                        'IdLocalizacionActividades/ID')
                    .expand('IdProyectoInversion', 'IdTerreno', 'Nivel', 'IdTarea', 'Estatus', 'GrupoResponsable', 'AsignadoA',
                        'IdLocalizacionActividades')
                    .getAll();

                actividades.sort(function (a, b) {
                    if (a.IdTarea.Orden > b.IdTarea.Orden)
                        return 1;
                    if (a.IdTarea.Orden < b.IdTarea.Orden)
                        return -1;
                    return 0;
                });

                var ventanas = [actividades.reduce((a, c) => (a[c.IdTarea.TxtVentana] = (a[c.IdTarea.TxtVentana] || []).concat(c), a), {})];
                var datosActs = {
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
                }

                result = Array.from(new Set(datosActs.datos.map(s => s.IdTarea.TxtCluster)))
                    .map(currentCluster => {
                        return {
                            cluster: datosActs.datos.find(s => s.IdTarea.TxtCluster === currentCluster && (parseFloat(s.IdTarea.Orden) > parseFloat(idVentanaSeleccionada) && parseFloat(s.IdTarea.Orden) < parseFloat(idVentanaSeleccionada + 1)))
                        };
                    });

                result = result.filter(x => x.cluster !== undefined);
                if (result.length > 0) {
                    var Proyectos = ventanas[0].Proyectos != undefined ? ventanas[0].Proyectos.length : 0;
                    var Normativo = ventanas[0].Normativo != undefined ? ventanas[0].Normativo.length : 0;
                    var Administracion = ventanas[0].Administración != undefined ? ventanas[0].Administración.length : 0;
                    this.setState({
                        idVentana: idVentanaSeleccionada, clustersVentana: result, datosVentana: datosActs, totalAdmin: this.state.totalAdmin,
                        totalNorm: this.state.totalNorm, totalProy: this.state.totalProy, idVentanaAnterior: idVentanaSeleccionada,
                        disabled: false
                    });
                }
                else {
                    alert("No contamos con datos para filtrar, de favor intente de nuevo");
                }
                break;
            //Filtro de usuario
            case 7:
                //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversión
                idVentanaSeleccionada = this.state.idVentanaAnterior;
                actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                    .filter('(IdProyectoInversionId eq ' + idProyecto + ') or (IdTerrenoId eq ' + idTerreno + ')')
                    .select('ID', 'Title', 'Favoritos', 'IdProyectoInversion/ID', 'IdProyectoInversion/Title', 'IdTerreno/ID',
                        'IdTerreno/Title', 'Nivel/ID', 'Nivel/Title', 'IdTarea/ID', 'IdTarea/Title', 'IdTarea/TxtCluster',
                        'IdTarea/TxtVentana', 'IdTarea/Orden', 'IdTarea/Checkable', 'Estatus/ID', 'Estatus/Title', 'GrupoResponsable/ID',
                        'GrupoResponsable/NombreCortoGantt', 'AsignadoA/ID', 'AsignadoA/Name', 'LineaBase', 'FechaEstimada')
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
                var datosActs = {
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
                }

                result = Array.from(new Set(datosActs.datos.map(s => s.IdTarea.TxtCluster)))
                    .map(currentCluster => {
                        return {
                            cluster: datosActs.datos.find(s => s.IdTarea.TxtCluster === currentCluster && (parseFloat(s.IdTarea.Orden) > parseFloat(idVentanaSeleccionada) && parseFloat(s.IdTarea.Orden) < parseFloat(idVentanaSeleccionada + 1)))
                        };
                    });

                result = result.filter(x => x.cluster !== undefined);
                if (result.length > 0) {
                    var Proyectos = ventanas[0].Proyectos != undefined ? ventanas[0].Proyectos.length : 0;
                    var Normativo = ventanas[0].Normativo != undefined ? ventanas[0].Normativo.length : 0;
                    var Administracion = ventanas[0].Administración != undefined ? ventanas[0].Administración.length : 0;
                    this.setState({
                        idVentana: idVentanaSeleccionada, clustersVentana: result, datosVentana: datosActs, totalAdmin: this.state.totalAdmin,
                        totalNorm: this.state.totalNorm, totalProy: this.state.totalProy, idVentanaAnterior: idVentanaSeleccionada
                    });
                }
                else {
                    alert("No contamos con datos para filtrar, de favor intente de nuevo");
                }
                break;
            default:
                break;
        }
    }

    onAbrirModal = (terreno, id, esTarea, campo, valor)=>{
        this.setState({ modal: { abierto: true, id: id, terreno: terreno, esTarea:esTarea }, datos: {campo: campo, valor: valor} })
    }

    onCerrarModal = () => {
        this.setState({ modal: this.inialState.modal })
    };

    establecerContador =(contadores, ventana, tipo) =>{
        switch(ventana){
            case "Administración":
                if(tipo===1)
                {contadores.admin +=1}
                else
                {contadores.admin -=1}
                break;
            case "Normativo":
                if(tipo===1)
                {contadores.norm +=1}
                else
                {contadores.norm -=1}
                break;
            case "Proyectos":
                if(tipo===1)
                {contadores.proy +=1}
                else
                {contadores.proy -=1}
                break;
            default:
                break;
        }
    }

    onSeleccionarItem = (event, idElemento) =>{
        const indice = checkedItems.findIndex((obj => obj.datos.ID === idElemento));
        if(indice!== -1){
            checkedItems[indice].datos.Seleccionado = event.target.checked;
            checkedItems[indice].cambio = !checkedItems[indice].cambio;
        }
    }

    onSave = async elementos =>{
        var contadores = {
            admin:0,
            norm:0,
            proy:0
        }
        elementos.forEach(async elemento => {
            if(elemento.cambio){
                if(elemento.datos.IdFlujoTareasId === null){
                    this.establecerContador(contadores, elemento.datos.Tarea.TxtVentana, 1)
                    //Crea la tarea en flujo tareas
                    /*await sp.web.lists.getByTitle("Flujo Tareas").items.add({
                        IdProyectoInversionId: elemento.datos.ProyectoInversion.ID,
                        IdTareaId: elemento.datos.Tarea.ID,
                        IdTerrenoId: elemento.datos.Terreno.ID,
                        NivelId: 2,
                        GrupoResponsableId: elemento.datos.GrupoResponsable.ID,
                        AsignadoAId: elemento.datos.AsignadoA !== undefined ? elemento.datos.AsignadoA : {results: []},
                        EstatusId: 1,
                        Visible: true
                    }).then(async a=>{
                        this.establecerContador(contadores, elemento.datos.Tarea.TxtVentana)
                        //Actualiza la información del registro en la lista de Estrategia de gestión
                        await sp.web.lists.getByTitle("EstrategiaGestion").items.getById(elemento.datos.ID).update({
                            Seleccionado: elemento.datos.Seleccionado,
                            IdFlujoTareasId: a.data.Id
                        }).then(u=>{
                            //Asigna el ID de elemento generado en flujo tareas al objeto en memoria del item seleccionado
                            //en la vetana de la EG
                            const indice = checkedItems.findIndex((obj => obj.datos.ID === elemento.datos.ID));
                            if(indice!== -1){
                                checkedItems[indice].datos.IdFlujoTareasId = a.data.Id
                            }
                        });
                    });*/
                }else{
                    //Actualiza la tarea en flujo tareas
                    this.establecerContador(contadores, elemento.datos.Tarea.TxtVentana, elemento.datos.Seleccionado ? 1 : 2)
                    /*await sp.web.lists.getByTitle("Flujo Tareas").items.getById(elemento.datos.IdFlujoTareasId).update({
                        AsignadoA: elemento.datos.AsignadoA !== undefined ? elemento.datos.AsignadoA : {results: []},
                        Visible: elemento.datos.Seleccionado
                    }).then(async u=>{
                        //Establece como seleccionado en la lista de EG
                        await sp.web.lists.getByTitle("EstrategiaGestion").items.getById(elemento.datos.ID).update({
                            Seleccionado: elemento.datos.Seleccionado
                        });
                    });*/
                }
            }
        });
    }

    async componentWillMount(){
        var actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
        .filter('(IdProyectoInversionId eq ' + this.props.idProyecto + ') or (IdTerrenoId eq ' + this.props.idTerreno + ')')
        .select('IdTarea/TxtVentana')
        .expand('IdTarea').getAll();

        var RFSEnviado=false;
        var datosEG = {
            columnas: [{titulo:'', estilo: 'col-sm'},{titulo:'Responsable', estilo: 'col-sm'}, {titulo:'Asignado a', estilo: 'col-sm'}],
            datos: []
        };

        var ventanas = [actividades.reduce((a,c) => (a[c.IdTarea.TxtVentana]=(a[c.IdTarea.TxtVentana]||[]).concat(c),a) ,{})];

        if(!RFSEnviado){
            datosEG.datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
            .filter('ProyectoInversionId eq ' + this.props.idProyecto)
            .select('ID','ProyectoInversion/ID','Terreno/ID','Tarea/ID','Tarea/Title','Tarea/TxtCluster','Tarea/TxtVentana','Tarea/OrdenEG','Tarea/Checkable','AsignadoA/ID','AsignadoA/Title','GrupoResponsable/ID','GrupoResponsable/NombreCortoGantt','Seleccionado', 'IdFlujoTareasId')
            .expand('ProyectoInversion', 'Terreno','Tarea','AsignadoA','GrupoResponsable').orderBy('Tarea/OrdenEG',true).get();

        var result = [];
        result = Array.from(new Set(datosEG.datos.map(s=> s.Tarea.TxtCluster)))
        .map(currentCluster=>{
            return{
              cluster: datosEG.datos.find(s=> s.Tarea.TxtCluster === currentCluster).Tarea
            };
        });

        result = result.filter(x=> x.cluster !== undefined);
      }
      this.setState({cargado: true, datosVentanaEG: datosEG, clustersVentana: result, totalAdmin: ventanas[0].Administración.length, totalNorm: ventanas[0].Normativo.length, totalProy: ventanas[0].Proyectos.length });
    }

    obtenerAsignados = campo =>{
        var usuarios = campo.map((registro)=>{
            var a =registro.Title; 
            return(registro.Title)
        })
        return usuarios
    }
    render(){
        const Cluster = (props) =>{
            if(props.titulos.length > 0){
                if(props.idVentana !== 4){
                    //Otras ventanas
                    const filaCluster = props.titulos.map((fila)=>{
                        return (
                            <div key={fila.cluster.IdTarea.Orden} className= 'titulo col-sm-12'>
                                <p>
                                    <img id='expandir' src={arrow_down_icon} alt='arrow_down_icon'></img>
                                    {fila.cluster.IdTarea.TxtCluster}
                                </p>
                                <Body datos = {props.datos} idCluster = {fila.cluster.IdTarea.Orden} />
                                <div className= 'row item-personal col-sm-12' onDoubleClick={()=>{ this.onAbrirModal('Nueva actividad personal')}}>Agregar nueva actividad personal</div>
                                <div className='row empty-space'></div>
                            </div>
                        )
                    });
                    return <div key={0} className="row">{filaCluster}</div>
                }else{
                    //Ventana de estrategia de gestión
                    const filaCluster = props.titulos.map((fila)=>{
                        return (
                            <div key={fila.cluster.OrdenEG} className= 'titulo col-sm-12'>
                                <p>
                                    {fila.cluster.Checkable === '1' ? <input type='checkbox' className='checkBox' ></input>: null}
                                    <img id='expandir' src={arrow_down_icon} alt='arrow_down_icon'></img>
                                    {fila.cluster.TxtCluster}
                                </p>
                                <Body datos = {props.datos} idCluster = {fila.cluster.OrdenEG} esCheckable = {fila.cluster.Checkable}  />
                                <div className= 'row item-personal col-sm-12' onDoubleClick={()=>{ this.onAbrirModal('Nueva actividad personal')}}>Agregar nueva actividad personal</div>
                                <div className='row empty-space' ></div>
                            </div>
                        )
                    });
                    //return <div key={0} className="row justify-content-end">{filaCluster}<input type='button' value='OK' className='btn btn-primary' onClick={()=>onSave(checkedItems)} /></div>
                    return <div key={0} className="row justify-content-end">{filaCluster}<input type='button' value='OK' className='btn btn-primary' onClick={()=>this.onSave(checkedItems)} /></div>
                }
            }else{
                return null
            }
        }
        const Columna = (props) =>{
            //Si abre el modal cuando se da doble clic
            if(props.editable){
                return(
                    <div className={props.estilo} onDoubleClick={()=>{ this.abrirModal(props.idElemento, props.esTarea )} } >{props.titulo}</div>
                );
            }else{
                return(
                    <div className={props.estilo} >{props.titulo}</div>
                );
            }
        }
        const Header = (props) =>{
            const filaHeader = props.datosVentana.map((fila, index)=>{
                return (
                    <Columna key={index} titulo= {fila.titulo } estilo = {fila.estilo } />
                )
            });
            return <div key={0} className="row">{filaHeader}</div>
        }

        const Body = (props) =>{
            if(props.idCluster >= 4){
                //Estrategia de gestión
                const filaBody = props.datos.map((fila)=>{
                    if(fila.Tarea.OrdenEG === props.idCluster){
                        if(props.esCheckable){
                            checkedItems = checkedItems.concat({datos:fila, cambio: false})
                        }
                        return (
                            <div key ={fila.ID} className="row item">
                                {props.esCheckable === '1' ? <input type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e)=>this.onSeleccionarItem(e, fila.ID)} ></input>: null}
                                <Columna key={fila.Tarea.ID} titulo= {fila.Tarea.Title } estilo = 'col-sm' editable= { props.esCheckable === '1' ? false: true} idElemento = {fila.Tarea.ID} esTarea={props.esCheckable === '1' ? false: true} />
                                <Columna titulo= {fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo = 'col-sm' editable= {false} />
                                <Columna titulo= {<p><img title={fila.AsignadoA !== undefined ? this.obtenerAsignados(fila.AsignadoA) : 'Sin asignar'} src= {fila.AsignadoA !== undefined ? assignedTo_icon : plus_icon} alt='assignedTo_icon' onClick={()=>{ this.onAbrirModal(this.props.terreno, 270, false, 'AsignadoA', fila.AsignadoA )} } /></p> } estilo = 'col-sm' editable= {false} />
                            </div>
                        )
                    }else{
                        return null
                    }
                });
                return filaBody
            }else{
                //Otras ventanas
                const filaBody = props.datos.map((fila)=>{
                    if(fila.IdTarea.Orden === props.idCluster){
                        return (
                            <div key ={fila.ID} className="row item">
                                <Columna titulo= {fila.IdTarea.Title } estilo = 'col-sm-5' editable= {true} idElemento = {fila.ID} esTarea={true} />
                                <Columna titulo= {fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo = 'col-sm-1' editable= {false} />
                                <Columna titulo= {<p><img title={fila.AsignadoA !== undefined ? this.obtenerAsignados(fila.AsignadoA) : 'Sin asignar'} src= {fila.AsignadoA !== undefined ? assignedTo_icon : plus_icon} alt='assignedTo_icon' onClick={()=>{ this.onAbrirModal(this.props.terreno, 270, false, 'AsignadoA', fila.AsignadoA )} } /></p> } estilo = 'col-sm' editable= {false} />
                                <Columna titulo= {fila.LineaBase !== null ? fila.LineaBase : <p><img title='Agregar' src= {plus_icon} alt='plus_icon' /></p>} estilo = 'col-sm-1' editable= {false} />
                                <Columna titulo= {fila.FechaEstimada !== null ? fila.FechaEstimada : <p><img title='Agregar' src= {plus_icon} alt='plus_icon' /></p>} estilo = 'col-sm-1' editable= {true} />
                                <Columna titulo= {fila.Estatus.Title} estilo = 'col-sm-1' editable= {false} />
                                <Columna titulo= {<img src= {attach_icon} alt='attach_icon' />} estilo = 'col-sm-1' editable= {false} />
                                <Columna titulo= {<img src= {more_details_icon} alt='more_details_icon' onClick={()=>{ this.onAbrirModal(this.props.terreno, 270, false )} } />} estilo = 'col-sm-1' editable= {false} />
                            </div>
                        )
                    }else{
                        return null
                    }
                });
                return filaBody
            }
        }
        const {idVentana, totalAdmin, totalNorm, totalProy, MACO} = this.state
        return(
            <div>
                <Backdrop abierto= {!this.state.cargado} />
                <Encabezado rfs = {this.props.rfs} idPITerr = { !this.props.rfs ? this.props.idProyecto : this.props.idTerreno} terreno = {this.props.terreno} maco= {MACO} idVentana = {this.state.idVentana} cambiarVentana={this.onCambiarVentana} totalAdmin = {totalAdmin} totalNorm = {totalNorm} totalProy = {totalProy}  />
                {this.state.cargado ?
                    <div className='container-fluid'>
                        <Header datosVentana= {idVentana === 4 ? this.state.datosVentanaEG.columnas : this.state.datosVentana.columnas} />
                        <Cluster titulos = {this.state.clustersVentana} idVentana = {idVentana} datos = {idVentana === 4 ? this.state.datosVentanaEG.datos : this.state.datosVentana.datos} />
                        {this.state.modal.abierto ? <Modal abrir = {this.state.modal} cerrar={this.onCerrarModal} datos = {this.state.datos} /> : null}
                    </div>
                    :null
                }
            </div>
        );
    }
}

export default Generico;