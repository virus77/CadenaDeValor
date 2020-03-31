import React, { Component } from 'react';
import Encabezado from '../componentes/Encabezado';
import Modal from '../componentes/Ventana';
import Backdrop from '../componentes/Backdrop';
import arrow_down_icon from '../imagenes/arrow_down_icon.png';
import attach_icon from '../imagenes/attach_icon.png';
import more_details_icon from '../imagenes/more_details_icon.png';
import assignedTo_icon from '../imagenes/assignedTo_icon.png';
import plus_icon from '../imagenes/plus_icon.png';
import egupload_icon from '../imagenes/egupload_icon.png';
import '../estilos/generico.css';
//import {onSave} from '../js/eg.js';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { InputLabel, Select, MenuItem } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import update from 'immutability-helper';

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

var checkedItems = [];
const useStyles = makeStyles(theme => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
        textAlign: "left",
    },
}));

class Generico extends Component {
    constructor(props) {
        super(props)
        this.inialState = {
            cargado: false,
            idProyecto: props.idProyecto,
            idTerreno: props.idTerreno,
            idVentana: 4,
            totalAdmin: 0,
            totalNorm: 0,
            totalProy: 0,
            idVentanaAnterior: 3,
            datosVentanaEG: [],
            datosVentana: [],
            Star: false,
            Gantt: false,
            User: false,
            disabled: true,
            clustersVentana: [],
            MACO: props.maco,
            datos: {
                campo: '',
                valor: ''
            },
            modal: {
                abierto: false,
                id: 0,
                terreno: '',
                esTarea: false,
                filaSeleccionada: {}
            },
            backdrop: {
                cargado: false,
                mensaje: 'Cargando contenido...'
            },
        }
        this.state = this.inialState;
    }

    onHandleChange = async (event) => {

        var actividades = [];
        var result = [];
        var tittle = event.target.name.split("|")[0];
        var tipo = event.target.name.split("|")[1];
        if (tipo === "EG") {
            var actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                .filter('(IdProyectoInversionId eq ' + this.props.idProyecto + ') or (IdTerrenoId eq ' + this.props.idTerreno + ')')
                .select('IdTarea/TxtVentana')
                .expand('IdTarea')
                .getAll();

            var filter = "";

            switch (tittle) {
                case 'Responsable':
                    filter = "(GrupoResponsable/ID eq " + event.target.value + ") and "
                    break;

                default:
                    filter = "(AsignadoA/ID eq " + event.target.value + ") and ";
                    break;
            }

            var datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
                .filter(filter + '(ProyectoInversionId eq ' + this.props.idProyecto + ')')
                .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/OrdenEG',
                    'Tarea/Checkable', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId', 'AsignadoA/ID',
                    'AsignadoA/Title')
                .expand('ProyectoInversion', 'Terreno', 'Tarea', 'GrupoResponsable', 'AsignadoA')
                .orderBy('Tarea/OrdenEG', true)
                .get();

            var RFSEnviado = false;
            var datosEG = {
                columnas: [
                    { titulo: '', interN: '', Arreglo: datos, estilo: 'col-sm-6' },
                    { titulo: 'Responsable', interN: 'GrupoResponsable', value: 'NombreCortoGantt', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-2' },
                    { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-2' },
                    { titulo: 'E. de G. autorizada', Arreglo: datos, estilo: 'col-sm-2' }
                ],
                datos: []
            };

            var ventanas = [actividades.reduce((a, c) => (a[c.IdTarea.TxtVentana] = (a[c.IdTarea.TxtVentana] || []).concat(c), a), {})];
            if (!RFSEnviado) {
                datosEG.datos = datos;
                var result = [];
                result = Array.from(new Set(datosEG.datos.map(s => s.Tarea.TxtCluster)))
                    .map(currentCluster => {
                        return {
                            cluster: datosEG.datos.find(s => s.Tarea.TxtCluster === currentCluster).Tarea
                        };
                    });

                result = result.filter(x => x.cluster !== undefined);
            }
            this.setState({
                backdrop: { cargado: true, mensaje: '' }, datosVentanaEG: datosEG, clustersVentana: result, totalAdmin: ventanas[0].Administración.length,
                totalNorm: ventanas[0].Normativo.length, totalProy: ventanas[0].Proyectos.length, idVentanaAnterior: this.state.idVentanaAnterior
            });
        }
        else {
            //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversiÃ³n
            actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                .filter('(IdProyectoInversionId eq ' + this.state.idProyecto + ') or (IdTerrenoId eq ' + this.state.idTerreno + ')')
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

            switch (tittle) {
                case 'LineaBase':
                    actividades = actividades.filter(x => x.LineaBase === event.target.value);
                    break;
                case 'FechaEstimada':
                    actividades = actividades.filter(x => x.FechaEstimada === event.target.value);
                    break;
                case 'Estatus':
                    actividades = actividades.filter(x => x.Estatus.ID === event.target.value);
                    break;
                case 'Responsable':
                    actividades = actividades.filter(x => x.GrupoResponsable.ID === event.target.value);
                    break;
                default:
                    actividades = actividades.filter(x => x.AsignadoA.ID === event.target.value);
                    break;
            }

            var ventanas = [actividades.reduce((a, c) => (a[c.IdTarea.TxtVentana] = (a[c.IdTarea.TxtVentana] || []).concat(c), a), {})];
            var datosActs = {
                columnas: [
                    { titulo: '', interN: '', value: '', Arreglo: '', estilo: 'col-sm-5' },
                    { titulo: 'Responsable', interN: 'GrupoResponsable', Tipo: "Act", value: 'NombreCortoGantt', Arreglo: actividades, estilo: 'col-sm-1' },
                    { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                    { titulo: 'Linea base', interN: 'LineaBase', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                    { titulo: 'F. estimada', interN: 'FechaEstimada', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                    { titulo: 'Estatus', interN: 'Estatus', value: 'Title', Tipo: "Estatus", Arreglo: actividades, estilo: 'col-sm-1' },
                    { titulo: 'Adjunto', interN: 'Adjunto', value: 'Adjunto', Arreglo: actividades, estilo: 'col-sm-1' },
                    { titulo: 'Detalle', interN: 'Detalle', value: 'Detalle', Arreglo: actividades, estilo: 'col-sm-1' }
                ],
                datos: actividades
            }
            var result = [];
            result = Array.from(new Set(datosActs.datos.map(s => s.IdTarea.TxtCluster)))
                .map(currentCluster => {
                    return {
                        cluster: datosActs.datos.find(s => s.IdTarea.TxtCluster === currentCluster && (parseFloat(s.IdTarea.Orden) > parseFloat(this.state.idVentanaAnterior) && parseFloat(s.IdTarea.Orden) < parseFloat(this.state.idVentanaAnterior + 1)))
                    };
                });

            result = result.filter(x => x.cluster !== undefined);
            if (result.length > 0) {
                this.setState({
                    idVentana: this.state.idVentanaAnterior, clustersVentana: result, datosVentana: datosActs, totalAdmin: this.state.totalAdmin,
                    totalNorm: this.state.totalNorm, totalProy: this.state.totalProy, idVentanaAnterior: this.state.idVentanaAnterior,
                    AdministracionAnterior: this.state.AdministracionAnterior, NormativoAnterior: this.state.NormativoAnterior,
                    ProyectosAnterior: this.state.ProyectosAnterior, disabled: false, backdrop: { cargado: true, mensaje: '' }
                });
            }
            else {
                alert("No encontramos datos que coinsidan con el filtro seleccionado, de favor intente nuevamente")
            }
        }
    }


    onCambiarVentana = async (idVentanaSeleccionada, mensaje) => {
        const { idProyecto, idTerreno } = this.state

        var result = [];
        var actividades = [];


        switch (idVentanaSeleccionada) {
            case 4:
                var datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
                    .filter('ProyectoInversionId eq ' + idProyecto)
                    .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/OrdenEG',
                        'Tarea/Checkable', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId', 'AsignadoA/ID',
                        'AsignadoA/Title')
                    .expand('ProyectoInversion', 'Terreno', 'Tarea', 'GrupoResponsable', 'AsignadoA')
                    .orderBy('Tarea/OrdenEG', true)
                    .get();

                var datosEG = {
                    columnas: [
                        { titulo: '', interN: '', Arreglo: datos, estilo: 'col-sm-6' },
                        { titulo: 'Responsable', interN: 'GrupoResponsable', value: 'NombreCortoGantt', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-2' },
                        { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-2' },
                        { titulo: 'E. de G. autorizada', Arreglo: datos, estilo: 'col-sm-2' }
                    ],
                    datos: []
                };

                datosEG.datos = datos;

                result = Array.from(new Set(datosEG.datos.map(s => s.Tarea.TxtCluster)))
                    .map(currentCluster => {
                        return {
                            cluster: datosEG.datos.find(s => s.Tarea.TxtCluster === currentCluster).Tarea
                        };
                    });

                result = result.filter(x => x.cluster !== undefined);
                this.setState({
                    backdrop: { cargado: true, mensaje: '' }, idVentana: idVentanaSeleccionada, clustersVentana: result, datosVentanaEG: datosEG, disabled: true,
                    Star: false, Gantt: false, User: false
                });
                break;
            case 1:
            case 2:
            case 3:
                //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversiÃ³n
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
                        { titulo: '', interN: '', value: '', Arreglo: '', estilo: 'col-sm-5' },
                        { titulo: 'Responsable', interN: 'GrupoResponsable', Tipo: "Act", value: 'NombreCortoGantt', Arreglo: actividades, estilo: 'col-sm-1' },
                        { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                        { titulo: 'Linea base', interN: 'LineaBase', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                        { titulo: 'F. estimada', interN: 'FechaEstimada', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                        { titulo: 'Estatus', interN: 'Estatus', value: 'Title', Tipo: "Estatus", Arreglo: actividades, estilo: 'col-sm-1' },
                        { titulo: 'Adjunto', interN: 'Adjunto', value: 'Adjunto', Arreglo: actividades, estilo: 'col-sm-1' },
                        { titulo: 'Detalle', interN: 'Detalle', value: 'Detalle', Arreglo: actividades, estilo: 'col-sm-1' }
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
                    ProyectosAnterior: ventanas[0].Proyectos.length, disabled: false, backdrop: { cargado: true, mensaje: '' }
                });
                break;

            //Filtro de favoritos
            case 5:
            case 6:
            case 7:
                if (this.state.disabled === false) {
                    var filterGantt = "";
                    var expandGantt = "";
                    var selectGantt = "";
                    var filterStar = "";
                    var selectStar = "";
                    switch (idVentanaSeleccionada) {
                        case 5:
                            filterStar = ' (Favoritos ne 0) and ';
                            selectStar = ', ' + 'Favoritos';

                            if (this.state.Gantt === true && this.state.User === true) {
                                filterGantt = " (IdLocalizacionActividades/ID ne null) and ";
                                selectGantt = ', ' + 'IdLocalizacionActividades/ID';
                                expandGantt = ', ' + 'IdLocalizacionActividades';
                            }
                            else if (this.state.Gantt === true) {
                                filterGantt = " (IdLocalizacionActividades/ID ne null) and ";
                                selectGantt = ', ' + 'IdLocalizacionActividades/ID';
                                expandGantt = ', ' + 'IdLocalizacionActividades';
                            }
                            else if (this.state.User === true) {
                            }

                            this.state.Star = true;
                            break;

                        case 6:
                            filterGantt = " (IdLocalizacionActividades/ID ne null) and ";
                            selectGantt = ', ' + 'IdLocalizacionActividades/ID';
                            expandGantt = ', ' + 'IdLocalizacionActividades';

                            if (this.state.Star === true && this.state.User === true) {
                                filterStar = '(Favoritos ne 0) and ';
                                selectStar = ', ' + 'Favoritos';
                            }
                            else if (this.state.Star === true) {
                                filterStar = '(Favoritos ne 0) and ';
                                selectStar = ', ' + 'Favoritos';
                            }
                            else if (this.state.User === true) {
                            }

                            this.state.Gantt = true;
                            break;

                        case 7:
                            if (this.state.Gantt === true && this.state.Star === true) {
                                filterGantt = " (IdLocalizacionActividades/ID ne null) and ";
                                selectGantt = ', ' + 'IdLocalizacionActividades/ID';
                                expandGantt = ', ' + 'IdLocalizacionActividades';
                                filterStar = '(Favoritos ne 0) and ';
                                selectStar = ', ' + 'Favoritos';
                            }
                            else if (this.state.Gantt === true) {
                                filterGantt = " (IdLocalizacionActividades/ID ne null) and ";
                                selectGantt = ', ' + 'IdLocalizacionActividades/ID';
                                expandGantt = ', ' + 'IdLocalizacionActividades';
                            }
                            else if (this.state.Star === true) {
                                filterStar = '(Favoritos ne 0) and ';
                                selectStar = ', ' + 'Favoritos';
                            }

                            this.state.User = true;
                            break;
                        default:
                            break;
                    }

                    actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                        .filter(filterStar + filterGantt + '(IdProyectoInversionId eq ' + idProyecto + ') or (IdTerrenoId eq ' + idTerreno + ')')
                        .select('ID', 'Title' + selectStar, 'IdProyectoInversion/ID', 'IdProyectoInversion/Title', 'IdTerreno/ID',
                            'IdTerreno/Title', 'Nivel/ID', 'Nivel/Title', 'IdTarea/ID', 'IdTarea/Title', 'IdTarea/TxtCluster',
                            'IdTarea/TxtVentana', 'IdTarea/Orden', 'IdTarea/Checkable', 'Estatus/ID', 'Estatus/Title', 'GrupoResponsable/ID',
                            'GrupoResponsable/NombreCortoGantt', 'AsignadoA/ID', 'AsignadoA/Name', 'LineaBase', 'FechaEstimada' + selectGantt)
                        .expand('IdProyectoInversion', 'IdTerreno', 'Nivel', 'IdTarea', 'Estatus', 'GrupoResponsable', 'AsignadoA' + expandGantt)
                        .getAll();

                    //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversiÃ³n
                    idVentanaSeleccionada = this.state.idVentanaAnterior;

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
                            { titulo: '', interN: '', value: '', Arreglo: '', estilo: 'col-sm-5' },
                            { titulo: 'Responsable', interN: 'GrupoResponsable', Tipo: "Act", value: 'NombreCortoGantt', Arreglo: actividades, estilo: 'col-sm-1' },
                            { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                            { titulo: 'Linea base', interN: 'LineaBase', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                            { titulo: 'F. estimada', interN: 'FechaEstimada', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                            { titulo: 'Estatus', interN: 'Estatus', value: 'Title', Tipo: "Estatus", Arreglo: actividades, estilo: 'col-sm-1' },
                            { titulo: 'Adjunto', interN: 'Adjunto', value: 'Adjunto', Arreglo: actividades, estilo: 'col-sm-1' },
                            { titulo: 'Detalle', interN: 'Detalle', value: 'Detalle', Arreglo: actividades, estilo: 'col-sm-1' }
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
                        this.setState({
                            idVentana: idVentanaSeleccionada, clustersVentana: result, datosVentana: datosActs, totalAdmin: this.state.totalAdmin,
                            totalNorm: this.state.totalNorm, totalProy: this.state.totalProy, idVentanaAnterior: idVentanaSeleccionada,
                            disabled: false, Star: this.state.Star, Gantt: this.state.Gantt, User: this.state.User, backdrop: { cargado: true, mensaje: '' }
                        });
                    }
                    else {
                        alert("No encontramos datos que coinsidan con el filtro seleccionado, de favor intente nuevamente")
                    }
                }
                break;
            case 8:
                var dato = this.props.rfs === true ? this.props.IdProyInv : this.props.TerrenoId;
                window.open("http://con.quierocasa.com.mx:21520/CompraDeTerreno/sitepages/gantt.aspx?Valor=" + dato, "_blank");
                break;
            default:
                break;
        }
    }

    onCambiarMaco = maco => {
        this.setState({ MACO: maco })
    }

    onAbrirModal = (terreno, id, esTarea, campo, valor, fila) => {
        this.setState({
            modal: { abierto: true, id: id, terreno: terreno, esTarea: esTarea, filaSeleccionada: fila },
            datos: { campo: campo, valor: valor }
        })
    }

    onCerrarModal = () => {
        this.setState({ modal: this.inialState.modal })
    };

    establecerContador = (contadores, ventana, tipo) => {
        switch (ventana) {
            case "AdministraciÃ³n":
                if (tipo === 1) { contadores.admin += 1 }
                else { contadores.admin -= 1 }
                break;
            case "Normativo":
                if (tipo === 1) { contadores.norm += 1 }
                else { contadores.norm -= 1 }
                break;
            case "Proyectos":
                if (tipo === 1) { contadores.proy += 1 }
                else { contadores.proy -= 1 }
                break;
            default:
                break;
        }
    }

    onSeleccionarItem = (event, idElemento) => {
        const indice = checkedItems.findIndex((obj => obj.datos.ID === idElemento));
        if (indice !== -1) {
            checkedItems[indice].datos.Seleccionado = event.target.checked;
            checkedItems[indice].cambio = !checkedItems[indice].cambio;
        }
    }

    onSave = async elementos => {
        var contadores = {
            admin: 0,
            norm: 0,
            proy: 0
        }
        elementos.forEach(async elemento => {
            if (elemento.cambio) {
                if (elemento.datos.IdFlujoTareasId === null) {
                    this.establecerContador(contadores, elemento.datos.Tarea.TxtVentana, 1)
                    //Crea la tarea en flujo tareas
                    /*await sp.web.lists.getByTitle("Flujo Tareas").items.add({
                        IdProyectoInversionId: elemento.datos.ProyectoInversion.ID,
                        IdTareaId: elemento.datos.Tarea.ID,
                        IdTerrenoId: elemento.datos.Terreno.ID,
                        NivelId: 2,
                        GrupoResponsableId: elemento.datos.GrupoResponsable.ID,
                        AsignadoAId: elemento.datos.AsignadoA !== undefined ? elemento.datos.AsignadoA : { results: [] },
                        EstatusId: 1,
                        Visible: true
                    }).then(async a=>{
                        this.establecerContador(contadores, elemento.datos.Tarea.TxtVentana)
                        //Actualiza la informaciÃ³n del registro en la lista de Estrategia de gestiÃ³n
                        await sp.web.lists.getByTitle("EstrategiaGestion").items.getById(elemento.datos.ID).update({
                            Seleccionado: elemento.datos.Seleccionado,
                            IdFlujoTareasId: a.data.Id
                        }).then(u=>{
                            //Asigna el ID de elemento generado en flujo tareas al objeto en memoria del item seleccionado
                            //en la vetana de la EG
                            const indice = checkedItems.findIndex((obj => obj.datos.ID === elemento.datos.ID));
                            if (indice !== -1) {
                                checkedItems[indice].datos.IdFlujoTareasId = a.data.Id
                            }
                        });
                    });*/
                } else {
                    //Actualiza la tarea en flujo tareas
                    this.establecerContador(contadores, elemento.datos.Tarea.TxtVentana, elemento.datos.Seleccionado ? 1 : 2)
                    /*await sp.web.lists.getByTitle("Flujo Tareas").items.getById(elemento.datos.IdFlujoTareasId).update({
                        AsignadoA: elemento.datos.AsignadoA !== undefined ? elemento.datos.AsignadoA : {results: []},
                        Visible: elemento.datos.Seleccionado
                    }).then(async u => {
                        //Establece como seleccionado en la lista de EG
                        await sp.web.lists.getByTitle("EstrategiaGestion").items.getById(elemento.datos.ID).update({
                            Seleccionado: elemento.datos.Seleccionado
                        });
                    });*/
                }
            }
        });
    }

    async componentWillMount() {
        var actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
            .filter('(IdProyectoInversionId eq ' + this.props.idProyecto + ') or (IdTerrenoId eq ' + this.props.idTerreno + ')')
            .select('IdTarea/TxtVentana')
            .expand('IdTarea')
            .getAll();

        var datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
            .filter('ProyectoInversionId eq ' + this.props.idProyecto)
            .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/OrdenEG',
                'Tarea/Checkable', 'AsignadoA/ID', 'AsignadoA/Title', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId')

            .expand('ProyectoInversion', 'Terreno', 'Tarea', 'AsignadoA', 'GrupoResponsable')
            .orderBy('Tarea/OrdenEG', true)
            .get();

        var RFSEnviado = false;
        var datosEG = {
            columnas: [
                { titulo: '', interN: '', Arreglo: datos, estilo: 'col-sm-6' },
                { titulo: 'Responsable', interN: 'GrupoResponsable', value: 'NombreCortoGantt', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-2' },
                { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-2' },
                { titulo: 'E. de G. autorizada', Arreglo: datos, estilo: 'col-sm-2' }
            ],
            datos: []
        };

        var ventanas = [actividades.reduce((a, c) => (a[c.IdTarea.TxtVentana] = (a[c.IdTarea.TxtVentana] || []).concat(c), a), {})];

        if (!RFSEnviado) {
            datosEG.datos = datos;
            var result = [];
            result = Array.from(new Set(datosEG.datos.map(s => s.Tarea.TxtCluster)))
                .map(currentCluster => {
                    return {
                        cluster: datosEG.datos.find(s => s.Tarea.TxtCluster === currentCluster).Tarea
                    };
                });

            result = result.filter(x => x.cluster !== undefined);
        }
        this.setState({
            cargado: true, datosVentanaEG: datosEG, datosVentana: this.state.datosVentana.datos, clustersVentana: result, totalAdmin: ventanas[0].Administración.length,
            totalNorm: ventanas[0].Normativo.length, totalProy: ventanas[0].Proyectos.length, idVentanaAnterior: this.state.idVentanaSeleccionada,
            backdrop: { cargado: true, mensaje: '' }
        });
    }

    obtenerAsignados = campo => {
        var usuarios = campo.map((registro) => {
            var a = registro.Title;
            return (registro.Title)
        })
        return usuarios
    }

    onActualizarDatos = async arregloDatos => {
        if (this.state.idVentana === 4) {
            //Si el evento viene desde un modal que no es tarea
            if (arregloDatos.tarea === 0) {
                const filaEGIndice = this.state.datosVentanaEG.datos.findIndex(datosEG => datosEG.ID === this.state.modal.filaSeleccionada.ID)
                let newData = this.state.datosVentanaEG.datos[filaEGIndice]
                newData.AsignadoA = arregloDatos.datos
                let datosActualizados = {
                    columnas: [
                        { titulo: '', interN: '', Arreglo: "", estilo: 'col-sm-6' },
                        { titulo: 'Responsable', interN: 'GrupoResponsable', value: 'NombreCortoGantt', Tipo: "EG", Arreglo: this.state.datosVentanaEG.datos, estilo: 'col-sm-2' },
                        { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "EG", Arreglo: this.state.datosVentanaEG.datos, estilo: 'col-sm-2' },
                        { titulo: 'E. de G. autorizada', Arreglo: "", estilo: 'col-sm-2' }
                    ],
                    datos: []
                };
                datosActualizados.datos = update(this.state.datosVentanaEG.datos, { $splice: [[filaEGIndice, 1, newData]] })
                this.setState({ datosVentanaEG: datosActualizados })
            } else {
                //Si el evento viene desde un modal que sÃ­ es tarea
                switch (arregloDatos.tarea) {
                    case 24:
                        //Si se definiÃ³ RFSN como 'Ninguno' y ya hay MACO definida...
                        if (arregloDatos.dato && this.state.MACO !== null) {
                            //Establece el spinner mientras se generan los datos de la EG
                            this.setState({ backdrop: { cargado: false, mensaje: 'Generando estrategia de gestiÃ³n. Esto podrÃ­a tardar unos minutos...' } })

                            const terrenosPI = await sp.web.lists.getByTitle('Terrenos').items.filter('IdProyectoInversionId eq ' + this.state.idProyecto + ' and Empadronamiento eq null').get()
                            const nuevasTareasEG = await sp.web.lists.getByTitle("Tareas").items.filter("((OrdenEG ge 4 and OrdenEG le 5) and (DetonacionInicial eq 0) and (MACO eq 'X' or MACO eq '" + this.state.MACO + "'))").get();

                            const generarEG = async () => {
                                await asyncForEach(terrenosPI, async terrenoPI => {
                                    await asyncForEach(nuevasTareasEG, async nuevaTarea => {
                                        //Crea el elemento en la estrategia de gestiÃ³n por cada terreno
                                        await sp.web.lists.getByTitle("EstrategiaGestion").items.add({
                                            ProyectoInversionId: terrenoPI.IdProyectoInversionId,
                                            TerrenoId: terrenoPI.ID,
                                            TareaId: nuevaTarea.ID,
                                            GrupoResponsableId: nuevaTarea.GrupoId,
                                            Seleccionado: false
                                        }).then()
                                            .catch(error => {
                                                console.warn('Error al generar la EG: ' + error)
                                            })
                                    });
                                });
                                //Establece el spinner mientras se cargan los datos generados anteriormente
                                this.onCambiarVentana(4, 'Cargando contenido generado...')
                            }
                            generarEG();
                        } else {
                            //Establece el spinner mientras para cargar la nueva tarea generada a partir del RFS
                            this.onCambiarVentana(4, 'Cargando contenido generado...')
                        }
                        break;
                    default:
                        break;
                }
            }
        } else {
            const filaIndice = this.state.datosVentana.datos.findIndex(datos => datos.ID === this.state.modal.filaSeleccionada.ID)
            let newData = this.state.datosVentana.datos[filaIndice]
            newData.AsignadoA = arregloDatos.dato
            let datosActualizados = {
                columnas: [
                    { titulo: '', interN: '', value: '', Arreglo: '', estilo: 'col-sm-5' },
                    { titulo: 'Responsable', interN: 'GrupoResponsable', Tipo: "Act", value: 'NombreCortoGantt', Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                    { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "Act", Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                    { titulo: 'Linea base', interN: 'LineaBase', value: 'Title', Tipo: "Act", Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                    { titulo: 'F. estimada', interN: 'FechaEstimada', value: 'Title', Tipo: "Act", Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                    { titulo: 'Estatus', interN: 'Estatus', value: 'Title', Tipo: "Estatus", Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                    { titulo: 'Adjunto', interN: 'Adjunto', value: 'Adjunto', Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                    { titulo: 'Detalle', interN: 'Detalle', value: 'Detalle', Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' }
                ],
                datos: []
            };
            datosActualizados.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice, 1, newData]] })
            this.setState({ datosVentana: datosActualizados })
        }
    }

    render() {
        const Cluster = (props) => {
            if (props.titulos.length > 0) {
                if (props.idVentana !== 4) {
                    //Otras ventanas
                    const filaCluster = props.titulos.map((fila) => {
                        return (
                            <div key={fila.cluster.IdTarea.Orden} className='titulo col-sm-12'>
                                <p>
                                    <img id='expandir' src={arrow_down_icon} alt='arrow_down_icon'></img>
                                    {fila.cluster.IdTarea.TxtCluster}
                                </p>
                                <Body datos={props.datos} idCluster={fila.cluster.IdTarea.Orden} />
                                <div className='row item-personal col-sm-12' onDoubleClick={() => { this.onAbrirModal('Nueva actividad personal') }}>Agregar nueva actividad personal</div>
                                <div className='row empty-space'></div>
                            </div>
                        )
                    });
                    return <div key={0} className="row">{filaCluster}</div>
                } else {
                    //Ventana de estrategia de gestiÃ³n
                    const filaCluster = props.titulos.map((fila) => {
                        return (
                            <div key={fila.cluster.OrdenEG} className='titulo col-sm-12'>
                                <p>
                                    {fila.cluster.Checkable === '1' ? <input type='checkbox' className='checkBox' ></input> : null}
                                    <img id='expandir' src={arrow_down_icon} alt='arrow_down_icon'></img>
                                    {fila.cluster.TxtCluster}
                                </p>
                                <Body datos={props.datos} idCluster={fila.cluster.OrdenEG} esCheckable={fila.cluster.Checkable} />
                                <div className='row item-personal col-sm-12' onDoubleClick={() => { this.onAbrirModal('Nueva actividad personal') }}>Agregar nueva actividad personal</div>
                                <div className='row empty-space' ></div>
                            </div>
                        )
                    });
                    //return <div key={0} className="row justify-content-end">{filaCluster}<input type='button' value='OK' className='btn btn-primary' onClick={()=>onSave(checkedItems)} /></div>
                    return <div key={0} className="row justify-content-end">{filaCluster}<input type='button' value='OK' className='btn btn-primary' onClick={() => this.onSave(checkedItems)} /></div>
                }
            } else {
                return null
            }
        }

        const Columna = (props) => {
            //Si abre el modal cuando se da doble clic
            if (props.editable) {
                return (
                    <div className={props.estilo} onDoubleClick={() => { this.onAbrirModal(props.terreno, props.idElemento, props.esTarea, null, null, props.datos) }} >{props.titulo}</div>
                );
            } else {
                return (
                    <div className={props.estilo} >{props.titulo}</div>
                );
            }
        }

        const Header = (props) => {
            const classes = useStyles();
            const filaHeader = props.datosVentana.map((fila, index) => {
                switch (fila.titulo) {
                    case "":
                    case "Adjunto":
                    case "Detalle":
                        return (
                            <div key={index} className={fila.estilo} >
                                <p style={{ marginTop: "30px", textAlign: "center" }}>
                                    {fila.titulo}
                                </p>
                            </div>
                        )
                        break;
                    case 'E. de G. autorizada':
                        return (
                            <div key={index} className={fila.estilo} >
                                <p style={{ marginTop: "30px", textAlign: "right" }}>
                                    <img style={{ marginRight: "5px" }} id='CargaEG' src={egupload_icon} alt='egupload_icon' onClick={() => { this.onAbrirModal(this.props.terreno, 269, false) }}></img>
                                    {fila.titulo}
                                </p>
                            </div>
                        )
                        break;
                    case 'Asignado a':
                        const uniqueTagsA = [];
                        fila.Arreglo.sort((a, b) => a.AsignadoA - b.AsignadoA).sort((a, b) => a.Title - b.Title);
                        return (
                            <div key={index} className={fila.estilo}>
                                <FormControl className={classes.formControl}>
                                    <InputLabel id={"lbl" + fila.interN}>{fila.titulo}</InputLabel>
                                    <Select key={index} labelId="lblAsignado" id={"cmb" + fila.interN} name={fila.titulo + "|" + fila.Tipo} onChange={this.onHandleChange}>
                                        {fila.Arreglo.sort().map((element, index) => (
                                            element[fila.interN] != undefined ?
                                                uniqueTagsA.indexOf(element[fila.interN][index][fila.value]) === -1 ?
                                                    <MenuItem key={element[fila.interN][index]["ID"]} value={element[fila.interN][index]["ID"]}>
                                                        <InputLabel style={{ display: "none" }} id="label">{uniqueTagsA.push(element[fila.interN][fila.value])}</InputLabel>
                                                        <InputLabel id={"lbl" + fila.interN}> {element[fila.interN][index][fila.value]}</InputLabel>
                                                    </MenuItem>
                                                    : null
                                                : null
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        )
                        break;
                    case 'Responsable':
                    case 'Estatus':
                        const uniqueTagsE = [];
                        return (
                            <div key={index} className={fila.estilo}>
                                <FormControl className={classes.formControl}>
                                    <InputLabel id={"lbl" + fila.interN}>{fila.titulo}</InputLabel>
                                    <Select key={index} labelId={"lbl" + fila.interN} id={"cmb" + fila.interN} name={fila.titulo + "|" + fila.Tipo} onChange={this.onHandleChange}>
                                        {fila.Arreglo.map(element => (
                                            element[fila.interN] != null ?
                                                uniqueTagsE.indexOf(element[fila.interN][fila.value]) === -1 ?
                                                    <MenuItem key={element[fila.interN]["ID"]} value={element[fila.interN]["ID"]}>
                                                        <InputLabel style={{ display: "none" }} id="label">{uniqueTagsE.push(element[fila.interN][fila.value])}</InputLabel>
                                                        <InputLabel id={"lbl" + fila.interN}>{element[fila.interN][fila.value]}</InputLabel>
                                                    </MenuItem>
                                                    : null
                                                : null
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        )
                        break;
                    default:
                        const uniqueTagsAll = [];
                        return (
                            <div key={index} className={fila.estilo}>
                                <FormControl className={classes.formControl}>
                                    <InputLabel id={"lbl" + fila.interN}>{fila.titulo}</InputLabel>
                                    <Select key={index} labelId={"lbl" + fila.interN} id={"cmb" + fila.interN} name={fila.titulo + "|" + fila.Tipo} onChange={this.onHandleChange}>
                                        {fila.Arreglo.map(element => (
                                            element[fila.interN] != null ?
                                                uniqueTagsAll.indexOf(element[fila.interN]) === -1 ?
                                                    <MenuItem key={element["ID"]} value={element[fila.interN]}>
                                                        <InputLabel style={{ display: "none" }} id="label">{uniqueTagsAll.push(element[fila.interN])}</InputLabel>
                                                        <InputLabel id={"lbl" + fila.interN}>{element[fila.interN]}</InputLabel>
                                                    </MenuItem>
                                                    : null
                                                : null
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        )
                        break;
                }
            });

            return <div key={0} className="row"> {filaHeader} </div>
        }

        const Body = (props) => {
            if (props.idCluster >= 4) {
                //Estrategia de gestiÃ³n
                const filaBody = props.datos.map((fila) => {
                    if (fila.Tarea.OrdenEG === props.idCluster) {
                        if (props.esCheckable) {
                            checkedItems = checkedItems.concat({ datos: fila, cambio: false })
                        }
                        return (
                            <div key={fila.ID} className="row item">
                                {props.esCheckable === '1' ? <input type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e) => this.onSeleccionarItem(e, fila.ID)} ></input> : <input style={{ visibility: "hidden" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>}
                                <Columna key={fila.Tarea.ID} titulo={fila.Tarea.Title} estilo='col-sm-6' editable={props.esCheckable === '1' ? false : true} idElemento={props.esCheckable === '1' ? fila.Tarea.ID : fila.IdFlujoTareasId} esTarea={props.esCheckable === '1' ? false : true} terreno={this.props.terreno} datos={props.esCheckable === '1' ? null : fila} />
                                <Columna titulo={fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                                <Columna titulo={<p style={{ textAlign: "center" }}><img title={fila.AsignadoA !== undefined ? this.obtenerAsignados(fila.AsignadoA) : 'Sin asignar'} src={fila.AsignadoA !== undefined ? assignedTo_icon : plus_icon} alt='assignedTo_icon' onClick={() => { this.onAbrirModal(this.props.terreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila) }} /></p>} estilo='col-sm-3' editable={false} />
                                <Columna estilo='col-sm-2' />
                            </div>
                        )
                    } else {
                        return null
                    }
                });
                return filaBody
            } else {
                //Otras ventanas
                const filaBody = props.datos.map((fila) => {
                    if (fila.IdTarea.Orden === props.idCluster) {
                        return (
                            <div key={fila.ID} className="row item">
                                <Columna titulo={fila.IdTarea.Title} estilo='col-sm-5' editable={true} idElemento={fila.IdFlujoTareasId} esTarea={true} terreno={this.props.terreno} datos={props.esCheckable === '1' ? null : fila} />
                                <Columna titulo={fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                                <Columna titulo={<p style={{ textAlign: "center" }}><img title={fila.AsignadoA !== undefined ? this.obtenerAsignados(fila.AsignadoA) : 'Sin asignar'} src={fila.AsignadoA !== undefined ? assignedTo_icon : plus_icon} alt='assignedTo_icon' onClick={() => { this.onAbrirModal(this.props.terreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila) }} /></p>} estilo='col-sm' editable={false} />
                                <Columna titulo={fila.LineaBase !== null ? fila.LineaBase : <p style={{ textAlign: "center" }}><img title='Agregar' src={plus_icon} alt='plus_icon' /></p>} estilo='col-sm-1' editable={false} />
                                <Columna titulo={fila.FechaEstimada !== null ? fila.FechaEstimada : <p style={{ textAlign: "center" }}><img title='Agregar' src={plus_icon} alt='plus_icon' /></p>} estilo='col-sm-1' editable={true} />
                                <Columna titulo={fila.Estatus.Title} estilo='col-sm-1' editable={false} />
                                <Columna titulo={<p style={{ textAlign: "center" }}><img src={attach_icon} alt='attach_icon' /></p>} estilo='col-sm-1' editable={false} />
                                <Columna titulo={<p style={{ textAlign: "center" }}><img src={more_details_icon} alt='more_details_icon' onClick={() => { this.onAbrirModal(this.props.terreno, 270, false) }} /></p>} estilo='col-sm-1' editable={false} />
                            </div>
                        )
                    } else {
                        return null
                    }
                });
                return filaBody
            }
        }
        const { idVentana, totalAdmin, totalNorm, totalProy, MACO } = this.state
        return (
            <div>
                <Backdrop abierto={!this.state.backdrop.cargado} mensaje={this.state.backdrop.mensaje} />
                <Encabezado rfs={this.props.rfs} idPITerr={!this.props.rfs ? this.props.idProyecto : this.props.idTerreno} terreno={this.props.terreno}
                    maco={MACO} idVentana={this.state.idVentana} disabled={this.state.disabled} cambiarVentana={this.onCambiarVentana} totalAdmin={totalAdmin}
                    totalNorm={totalNorm} totalProy={totalProy} cambioMaco={this.onCambiarMaco} />

                {this.state.cargado ?
                    <div className='container-fluid'>
                        <Header datosVentana={idVentana === 4 ? this.state.datosVentanaEG.columnas : this.state.datosVentana.columnas} />
                        <Cluster titulos={this.state.clustersVentana} idVentana={idVentana} datos={idVentana === 4 ? this.state.datosVentanaEG.datos : this.state.datosVentana.datos} />
                        {this.state.modal.abierto ? <Modal abrir={this.state.modal} cerrar={this.onCerrarModal} evento={this.onActualizarDatos} datos={this.state.datos} /> : null}
                    </div>
                    : null
                }
            </div>
        );
    }
}

export default Generico;