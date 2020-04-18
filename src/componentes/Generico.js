import React, { Component } from 'react';
import Encabezado from '../componentes/Encabezado';
import Modal from '../componentes/Ventana';
import Backdrop from '../componentes/Backdrop';
import { makeStyles } from '@material-ui/core/styles';
import { InputLabel, Select, MenuItem } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import update from 'immutability-helper';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import TextField from '@material-ui/core/TextField';
import arrow_down_icon from '../imagenes/arrow_down_icon.png';
import arrow_up_icon from '../imagenes/arrow_up_icon.png';
import attach_icon from '../imagenes/attach_icon.png';
import more_details_icon from '../imagenes/more_details_icon.png';
import assignedTo_icon from '../imagenes/assignedTo_icon.png';
import plus_icon from '../imagenes/plus_icon.png';
import egupload_icon from '../imagenes/egupload_icon.png';
import clear_icon from '../imagenes/clear.png';
import disk from '../imagenes/disk.png';

import { sp } from "@pnp/sp";
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import util from '../js/util'
//import {onSave} from '../js/eg.js';
import { es, ca } from 'date-fns/locale';
import moment from 'moment'

var checkedItems = []
var webUrl = ''
var webCdT = ''
var usuarioActual
var gruposUsuarioActual
const useStyles = makeStyles(theme => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
        textAlign: "left",
    },
}));

const web = Web(window.location.protocol + '//' + window.location.host + "/CompraDeTerreno/");

class Generico extends Component {
    constructor(props) {
        super(props)
        this.inialState = {
            cargado: false,
            idProyecto: props.idProyecto,
            proyectoTitulo: props.IdProyInv,
            idTerreno: props.idTerreno,
            terrenoTitulo: props.TerrenoId,
            nombreTerreno: props.terreno,
            idVentana: 4,
            totalAdmin: 0,
            totalNorm: 0,
            totalProy: 0,
            idVentanaAnterior: 3,
            datosOriginalVentanaEG: [],
            datosVentanaEG: [],
            datosOriginalVentana: [],
            datosVentana: [],
            Star: false,
            Gantt: false,
            User: false,
            disabled: true,
            clustersVentana: [],
            MACO: this.props.maco,
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
            terrenos: [],
            filtrosEncabezado: [],
            filtrosTabla: {
                eg: [],
                acts: [],
                responsable: '',
                asignadoa: '',
                lineabase: '',
                festimada: '',
                estatus: ''
            }
        }
        this.state = this.inialState;
    }
    //Realiza la carga de datos iniciales al seleccionar un terreno o el reinicio de datos cuando se hace una fusión
    cargarDatosIniciales = async (esRFS, idProyecto, idTerreno, terrenoTitulo, tipo) => {
        if (tipo !== 'TR' && tipo !== 'TS') {
            let actividades = []
            let datos = []
            let terrenos = []
            //Si es terreno(s) original(es)
            if (!esRFS) {
                actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                    .filter('(IdProyectoInversionId eq ' + idProyecto + ')')
                    .select('IdTarea/TxtVentana', 'IdTerreno/ID', 'IdTerreno/Title', 'IdTerreno/NombredelTerreno2')
                    .expand('IdTarea', 'IdTerreno')
                    .get();

                terrenos = [...new Set(actividades.map(x => (x.IdTerreno !== undefined ? x.IdTerreno.Title : '')))]

                datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
                    .filter('(ProyectoInversionId eq ' + idProyecto + ')')
                    .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Terreno/Title', 'Terreno/NombredelTerreno2', 'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/OrdenEG',
                        'Tarea/Checkable', 'Tarea/ExisteEnGantt', 'AsignadoA/ID', 'AsignadoA/Title', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId', 'EstatusId')
                    .expand('ProyectoInversion', 'Terreno', 'Tarea', 'AsignadoA', 'GrupoResponsable')
                    .orderBy('Tarea/OrdenEG', true)
                    .get();
            } else {
                //Si es terreno RFS
                actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                    .filter("((IdProyectoInversionId eq " + idProyecto + ") and ((IdTerrenoId eq " + idTerreno + ") or (IdTerrenoId eq null) or (substringof('T-', IdTerreno/Title))) and (IdTarea/Desactivable eq 0))")
                    .select('IdTarea/TxtVentana', 'IdTerreno/ID', 'IdTerreno/Title', 'IdTerreno/NombredelTerreno2')
                    .expand('IdTarea', 'IdTerreno')
                    .getAll();

                terrenos = [...new Set(actividades.map(x => (x.IdTerreno !== undefined ? x.IdTerreno.Title : '')))]

                datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
                    .filter("(ProyectoInversionId eq " + idProyecto + ") and ((TerrenoId eq " + idTerreno + ") or (TerrenoId eq null) or (substringof('T-', TerrenoId/Title)))")
                    .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Terreno/Title', 'Terreno/NombredelTerreno2', 'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/OrdenEG',
                        'Tarea/Checkable', 'Tarea/ExisteEnGantt', 'AsignadoA/ID', 'AsignadoA/Title', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId', 'EstatusId')
                    .expand('ProyectoInversion', 'Terreno', 'Tarea', 'AsignadoA', 'GrupoResponsable')
                    .orderBy('Tarea/OrdenEG', true)
                    .get();
            }

            let datosEG = util.inicializarArregloDatos(4, datos)

            let ventanas = [actividades.reduce((a, c) => (a[c.IdTarea.TxtVentana] = (a[c.IdTarea.TxtVentana] || []).concat(c), a), {})];

            datosEG.datos = datos;
            let result = [];
            result = Array.from(new Set(datosEG.datos.map(s => s.Tarea.TxtCluster)))
                .map(currentCluster => {
                    return {
                        cluster: datosEG.datos.find(s => s.Tarea.TxtCluster === currentCluster).Tarea
                    };
                });

            result = result.filter(x => x.cluster !== undefined);

            this.setState({
                cargado: true, datosOriginalVentanaEG: datosEG, datosVentanaEG: datosEG, clustersVentana: result,
                totalAdmin: ventanas[0].Administración.length, totalNorm: ventanas[0].Normativo.length,
                totalProy: ventanas[0].Proyectos.length, idVentanaAnterior: this.state.idVentanaSeleccionada,
                terrenos: terrenos, terrenoTitulo: terrenoTitulo, backdrop: { cargado: true, mensaje: '' }
            });
        } else {
            this.setState({ backdrop: { cargado: false, mensaje: 'Completo' } });
            alert('Se crearon los terrenos nuevos y su estrategia de gestión. Vuelva al menú principal para continuar.')
        }
    }

    //Realiza la acción generica del filtrado del encabezado en base a un datasource de entrada
    filtrarEncabezado = (filtrosEncabezado, datosOriginales) => {
        let datosFiltrados = datosOriginales.datos
        filtrosEncabezado.forEach(filtroActual => {
            switch (filtroActual) {
                case 'favs':
                    datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                        return datoFiltrado.Favoritos !== undefined ?
                            (datoFiltrado.Favoritos.some(x => x.ID === usuarioActual.Id) ? datoFiltrado : null)
                            : null
                    })
                    break;
                case 'gantt':
                    datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                        return this.state.idVentana === 4 ? (datoFiltrado.Tarea.ExisteEnGantt === '1' ? datoFiltrado : null) : datoFiltrado.IdTarea.ExisteEnGantt === '1' ? datoFiltrado : null
                    })
                    break;
                case 'ver':
                    break;
                default:
                    break;
            }
        });
        let nuevosDatos = []
        nuevosDatos.columnas = datosOriginales.columnas
        nuevosDatos.datos = datosFiltrados.datos === undefined ? datosFiltrados : datosFiltrados.datos

        return nuevosDatos
    }

    //#region Métodos de modal
    onAbrirModal = (terreno, id, esTarea, campo, valor, fila, ventana, size, padding) => {
        //Si el evento viene de la ventana de E.G.
        if (ventana === 4) {
            if (fila.Tarea.ID === 24 && this.state.MACO === null) {
                alert('No puedes generar RFSN hasta definir el tipo de MACO. Hazlo en el botón superior, junto al nombre del proyecto.')
            } else {
                this.setState({
                    modal: { abierto: true, id: id, terreno: terreno, esTarea: esTarea, filaSeleccionada: fila, size: size, padding: padding },
                    datos: { campo: campo, valor: valor }
                })
            }
        } else {
            this.setState({
                modal: { abierto: true, id: id, terreno: terreno, esTarea: esTarea, filaSeleccionada: fila, size: size, padding: padding },
                datos: { campo: campo, valor: valor }
            })
        }
    }

    onCerrarModal = () => {
        this.setState({ modal: this.inialState.modal })
    };
    //#endregion				   

    onHandleChange = async (event) => {
        let { filtrosTabla, datosOriginalVentanaEG, datosOriginalVentana } = this.state
        var columnaFiltro = event.target.name.split("|")[0];
        var tipo = event.target.name.split("|")[1];

        const datosOriginales = this.state.idVentana === 4 ? datosOriginalVentanaEG : datosOriginalVentana
        if (tipo === "EG") {
            let dataSource = this.filtrarEncabezado(this.state.filtrosEncabezado, datosOriginales)

            columnaFiltro = columnaFiltro.toLowerCase().trim().replace('.', '').replace(' ', '')
            if (event.target.value !== '') {
                let filtroIndice = filtrosTabla.eg.findIndex(x => x.col === columnaFiltro)
                if (filtroIndice === -1) {
                    filtrosTabla.eg.push({ col: columnaFiltro, value: event.target.value })
                    filtrosTabla[columnaFiltro] = event.target.value
                }
                else {
                    filtrosTabla.eg[filtroIndice].value = event.target.value
                    filtrosTabla[columnaFiltro] = event.target.value
                }
            } else {
                filtrosTabla.eg = filtrosTabla.eg.filter((x => { return x.col !== columnaFiltro }))
                filtrosTabla[columnaFiltro] = ''
            }
            let datosFiltrados = dataSource.datos
            let valores = []
            filtrosTabla.eg.forEach(filtroActual => {
                switch (filtroActual.col) {
                    case 'responsable':
                        datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                            return datoFiltrado.GrupoResponsable.NombreCortoGantt === filtroActual.value
                        })
                        break;
                    case 'asignadoa':
                        datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                            return datoFiltrado.AsignadoA !== undefined ? datoFiltrado.AsignadoA.filter((x) => { return x.Title.includes(filtroActual.value) ? valores.push(datoFiltrado) : null }) : null
                        })
                        datosFiltrados = valores
                        break;
                    default:
                        break;
                }
            })

            let nuevosDatos = []
            nuevosDatos.columnas = datosOriginales.columnas
            nuevosDatos.datos = datosFiltrados.datos === undefined ? datosFiltrados : datosFiltrados.datos

            this.setState({ datosVentanaEG: nuevosDatos, filtrosTabla: filtrosTabla })
        }
        else {
            let dataSource = this.filtrarEncabezado(this.state.filtrosEncabezado, datosOriginales)

            columnaFiltro = columnaFiltro.toLowerCase().trim().replace('.', '').replace(' ', '')
            if (event.target.value !== '') {
                let filtroIndice = filtrosTabla.acts.findIndex(x => x.col === columnaFiltro)
                if (filtroIndice === -1) {
                    filtrosTabla.acts.push({ col: columnaFiltro, value: event.target.value })
                    filtrosTabla[columnaFiltro] = event.target.value
                }
                else {
                    filtrosTabla.acts[filtroIndice].value = event.target.value
                    filtrosTabla[columnaFiltro] = event.target.value
                }
            } else {
                filtrosTabla.acts = filtrosTabla.acts.filter((x => { return x.col !== columnaFiltro }))
                filtrosTabla[columnaFiltro] = ''
            }
            let datosFiltrados = dataSource.datos
            let valores = []
            filtrosTabla.acts.forEach(filtroActual => {
                switch (filtroActual.col) {
                    case 'responsable':
                        datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                            return datoFiltrado.GrupoResponsable.NombreCortoGantt === filtroActual.value
                        })
                        break;
                    case 'asignadoa':
                        datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                            return datoFiltrado.AsignadoA !== undefined ? datoFiltrado.AsignadoA.filter((x) => { return x.Title.includes(filtroActual.value) ? valores.push(datoFiltrado) : null }) : null
                        })
                        datosFiltrados = valores
                        break;
                    case 'lineabase':
                        datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                            return datoFiltrado.LineaBase !== null ? util.spDate(datoFiltrado.LineaBase) === filtroActual.value : null
                        })
                        break;
                    case 'festimada':
                        datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                            return datoFiltrado.FechaEstimada !== null ? util.spDate(datoFiltrado.FechaEstimada) === filtroActual.value : null
                        })
                        break;
                    case 'estatus':
                        datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                            return datoFiltrado.Estatus.Title === filtroActual.value
                        })
                        break;
                    default:
                        break;
                }
            })

            let nuevosDatos = []
            nuevosDatos.columnas = datosOriginales.columnas
            nuevosDatos.datos = datosFiltrados.datos === undefined ? datosFiltrados : datosFiltrados.datos

            this.setState({ datosVentana: nuevosDatos, filtrosTabla: filtrosTabla })
        }
    }

    onCambiarVentana = async (idVentanaSeleccionada, mensaje, name, style, tipoRFS, nuevoTerreno) => {
        const { idProyecto, idTerreno, proyectoTitulo, terrenoTitulo } = this.state
        const filtrosTabla = util.limpiarFiltrosTabla()
        let { filtrosEncabezado } = this.state
        const datosOriginalesVEG = this.state.datosOriginalVentanaEG
        const datosOriginalesV = this.state.datosOriginalVentana
        var result = [];
        var actividades = [];

        if (tipoRFS === '' || tipoRFS === 'TF') {
            switch (idVentanaSeleccionada) {
                case 4:
                    //#region
                    { util.styleLinkGen(name, style) }
                    let datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
                        .filter('(ProyectoInversionId eq ' + idProyecto + ') or (TerrenoId eq ' + (nuevoTerreno !== '' ? nuevoTerreno.Id : idTerreno) + ')')
                        .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Terreno/Title',
                            'Terreno/NombredelTerreno2', 'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/OrdenEG',
                            'Tarea/Checkable', 'Tarea/ExisteEnGantt', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId',
                            'AsignadoA/ID', 'AsignadoA/Title', 'EstatusId')
                        .expand('ProyectoInversion', 'Terreno', 'Tarea', 'GrupoResponsable', 'AsignadoA')
                        .orderBy('Tarea/OrdenEG', true)
                        .get();

                    let datosEG = util.inicializarArregloDatos(4, datos)
                    datosEG.datos = datos;

                    result = Array.from(new Set(datosEG.datos.map(s => s.Tarea.TxtCluster)))
                        .map(currentCluster => {
                            return {
                                cluster: datosEG.datos.find(s => s.Tarea.TxtCluster === currentCluster).Tarea
                            };
                        });

                    result = result.filter(x => x.cluster !== undefined);

                    this.setState({
                        backdrop: { cargado: true, mensaje: '' }, idVentana: idVentanaSeleccionada, clustersVentana: result,
                        datosOriginalVentanaEG: datosEG, datosVentanaEG: datosEG, disabled: true, Star: false, Gantt: false, User: false,
                        idTerreno: nuevoTerreno !== '' ? nuevoTerreno.Id : idTerreno, MACO: nuevoTerreno !== '' ? nuevoTerreno.MACO : this.state.MACO,
                        terrenoTitulo: nuevoTerreno !== '' ? nuevoTerreno.Title : this.state.terrenoTitulo
                    });
                    //#endregion
                    break;
                case 1:
                case 2:
                case 3:
                    //#region
                    { util.styleLinkGen(name, style) }
                    //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversión
                    const complemento = !terrenoTitulo.startsWith('T-') ? ' and (IdTarea/Desactivable eq 0)' : ''
                    //.filter("(IdProyectoInversionId eq " + idProyecto + ") and ((IdTerrenoId eq " + idTerreno + ") or (IdTerrenoId eq null) or (substringof('T-', IdTerreno/Title)))")
                    actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                        .filter("((IdProyectoInversionId eq " + idProyecto + ") and ((IdTerrenoId eq " + idTerreno + ") or (IdTerrenoId eq null) or (substringof('T-', IdTerreno/Title)))" + complemento + ")")
                        .select('ID', 'Title', 'IdProyectoInversion/ID', 'IdProyectoInversion/Title', 'IdTerreno/ID',
                            'IdTerreno/Title', 'IdTerreno/NombredelTerreno2', 'Nivel/ID', 'Nivel/Title', 'IdTarea/ID', 'IdTarea/Title', 'IdTarea/TxtCluster',
                            'IdTarea/TxtVentana', 'IdTarea/Orden', 'IdTarea/Checkable', 'IdTarea/ExisteEnGantt', 'Estatus/ID', 'Estatus/Title', 'GrupoResponsable/ID',
                            'GrupoResponsable/NombreCortoGantt', 'AsignadoA/ID', 'AsignadoA/Title', 'LineaBase', 'FechaEstimada', 'Favoritos/ID',
                            'Favoritos/Name', 'UrlDocumentos', 'UrlTarea', 'EstatusAnterior/ID', 'EstatusAnterior/Title',
                            'Created/ID', 'Modified', 'Editor/ID', 'Editor/Title', 'LineaBaseModifico/ID', 'LineaBaseModifico/Title')
                        .expand('IdProyectoInversion', 'IdTerreno', 'Nivel', 'IdTarea', 'Estatus', 'EstatusAnterior', 'GrupoResponsable',
                            'AsignadoA', 'Favoritos', 'Editor', 'LineaBaseModifico')
                        .getAll();

                    actividades.sort(function (a, b) {
                        if (a.IdTarea.Orden > b.IdTarea.Orden)
                            return 1;
                        if (a.IdTarea.Orden < b.IdTarea.Orden)
                            return -1;
                        return 0;
                    });

                    var ventanas = [actividades.reduce((a, c) => (a[c.IdTarea.TxtVentana] = (a[c.IdTarea.TxtVentana] || []).concat(c), a), {})];
                    var datosActs = util.inicializarArregloDatos(0, actividades)
                    datosActs.datos = actividades

                    result = Array.from(new Set(datosActs.datos.map(s => s.IdTarea.TxtCluster)))
                        .map(currentCluster => {
                            return {
                                cluster: datosActs.datos.find(s => s.IdTarea.TxtCluster === currentCluster && (parseFloat(s.IdTarea.Orden) > parseFloat(idVentanaSeleccionada) && parseFloat(s.IdTarea.Orden) < parseFloat(idVentanaSeleccionada + 1)))
                            };
                        });

                    result = result.filter(x => x.cluster !== undefined);
                    this.setState({
                        idVentana: idVentanaSeleccionada, clustersVentana: result, datosVentana: datosActs, datosOriginalVentana: datosActs,
                        totalAdmin: ventanas[0].Administración.length, totalNorm: ventanas[0].Normativo.length, totalProy: ventanas[0].Proyectos.length,
                        idVentanaAnterior: idVentanaSeleccionada, AdministracionAnterior: ventanas[0].Administración.length, NormativoAnterior: ventanas[0].Normativo.length,
                        ProyectosAnterior: ventanas[0].Proyectos.length, disabled: false, backdrop: { cargado: true, mensaje: '' },
                        Gantt: false, Star: false, User: false, filtrosTabla: filtrosTabla
                    });
                    //#endregion
                    break;

                //Filtro de favoritos, existe en gantt y ver todos
                case 5:
                case 6:
                case 7:
                    if (mensaje === false) {
                        switch (idVentanaSeleccionada) {
                            case 5:
                                //Se hizo clic en el filtro de Favoritos
                                {
                                    if (!filtrosEncabezado.includes('favs'))
                                        filtrosEncabezado.push('favs')
                                    else
                                        filtrosEncabezado = filtrosEncabezado.filter(x => x !== 'favs')

                                    const datosOriginales = this.state.idVentana === 4 ? datosOriginalesVEG : datosOriginalesV
                                    let datosFiltrados = this.filtrarEncabezado(filtrosEncabezado, datosOriginales)

                                    if (this.state.idVentana === 4) {
                                        this.setState({ datosVentanaEG: datosFiltrados, filtrosEncabezado: filtrosEncabezado })
                                    } else {
                                        this.setState({ datosVentana: datosFiltrados, filtrosEncabezado: filtrosEncabezado })
                                    }
                                }
                                break;

                            case 6:
                                //Se hizo clic en el filtro de Tareas de Gantt
                                {
                                    if (!filtrosEncabezado.includes('gantt'))
                                        filtrosEncabezado.push('gantt')
                                    else
                                        filtrosEncabezado = filtrosEncabezado.filter(x => x !== 'gantt')

                                    const datosOriginales = this.state.idVentana === 4 ? datosOriginalesVEG : datosOriginalesV
                                    let datosFiltrados = this.filtrarEncabezado(filtrosEncabezado, datosOriginales)

                                    if (this.state.idVentana === 4)
                                        this.setState({ datosVentanaEG: datosFiltrados, filtrosEncabezado: filtrosEncabezado })
                                    else
                                        this.setState({ datosVentana: datosFiltrados, filtrosEncabezado: filtrosEncabezado })
                                }
                                break;

                            case 7:
                                //Se hizo clic en el filtro de Ver todos
                                {
                                    if (!filtrosEncabezado.includes('ver'))
                                        filtrosEncabezado.push('ver')
                                    else
                                        filtrosEncabezado = filtrosEncabezado.filter(x => x !== 'ver')

                                    const datosOriginales = this.state.idVentana === 4 ? datosOriginalesVEG : datosOriginalesV
                                    let datosFiltrados = this.filtrarEncabezado(filtrosEncabezado, datosOriginales)

                                    if (this.state.idVentana === 4)
                                        this.setState({ datosVentanaEG: datosFiltrados, filtrosEncabezado: filtrosEncabezado })
                                    else
                                        this.setState({ datosVentana: datosFiltrados, filtrosEncabezado: filtrosEncabezado })
                                }

                                break;
                            default:
                                break;
                        }
                    }
                    break;
                case 8:
                    //Se hizo clic en el icono de redirección a Gantt
                    var dato = this.props.rfs === false ? proyectoTitulo : terrenoTitulo
                    window.open(webCdT + "/sitepages/gantt.aspx?Valor=" + dato, "_blank");
                    break;
                default:
                    break;
            }
        }
        else {
            this.setState({ backdrop: { cargado: true, mensaje: '' } });
            alert('Se crearon los terrenos nuevos y su estrategia de gestión. Vuelva al menú principal para consultarlos.')
        }
    }

    onCambiarMaco = maco => {
        this.setState({ MACO: maco.dato })
    }

    //Función utilizada para establecer o quitar favoritos
    onEstablecerFavorito = async (fila) => {
        let val = { results: [] }
        let favoritos = []
        const user = usuarioActual
        if (util.IsNullOrEmpty(fila.Favoritos) === false) {
            const exists = fila.Favoritos.filter(x => x.ID === user.Id)
            if (exists.length === 0) {
                fila.Favoritos.map((favorito) => {
                    val.results.push(favorito.ID)
                    favoritos.push({ ID: favorito.ID, Name: favorito.Name })
                })
                val.results.push(user.Id)
                favoritos.push({ ID: user.Id, Name: user.LoginName })
            } else {
                fila.Favoritos.filter((favorito) => {
                    if (favorito.ID !== user.Id) {
                        val.results.push(favorito.ID)
                        favoritos.push({ ID: favorito.ID, Name: favorito.Name })
                    }
                })
            }
        } else {
            val.results.push(user.Id)
            favoritos.push({ ID: user.Id, Name: user.LoginName })
        }

        await sp.web.lists.getByTitle("Flujo Tareas").items.getById(fila.ID).update({
            FavoritosId: val,
        }).then(() => {
            const filaIndice = this.state.datosVentana.datos.findIndex(datos => datos.ID === fila.ID)
            let newData = this.state.datosVentana.datos[filaIndice]
            newData.Favoritos = favoritos;
            let datosActualizados = util.inicializarArregloDatos(0, this.state.datosVentana.datos)
            datosActualizados.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice, 1, newData]] })
            this.setState({ datosVentana: datosActualizados })
            util.onShowStar(fila, usuarioActual);
        })
    }

    //Establece el contador de los cambios por clúster por cada una de las tareas modificadas en la E.G.
    establecerContador = (contadores, ventana, tipo) => {
        switch (ventana) {
            case "Administración":
                if (tipo === '+') { contadores.admin += 1 }
                else { contadores.admin -= 1 }
                break;
            case "Normativo":
                if (tipo === '+') { contadores.norm += 1 }
                else { contadores.norm -= 1 }
                break;
            case "Proyectos":
                if (tipo === '+') { contadores.proy += 1 }
                else { contadores.proy -= 1 }
                break;
            default:
                break;
        }
    }

    //Establece la fecha seleccionada en el campo de Linea base y Fecha estimada
    onSeleccionarFecha = async (fecha, fila, campo) => {
        const filaIndice = this.state.datosVentana.datos.findIndex(datos => datos.ID === fila.ID)
        const filaIndiceO = this.state.datosOriginalVentana.datos.findIndex(datos => datos.ID === fila.ID)
        let newData = this.state.datosVentana.datos[filaIndice]
        let newDataO = this.state.datosOriginalVentana.datos[filaIndiceO]
        switch (campo) {
            case 'LineaBase':
                await sp.web.lists.getByTitle("Flujo Tareas").items.getById(fila.ID).update({
                    LineaBase: fecha,
                    LineaBaseModificoId: usuarioActual.Id
                }).then(() => {
                    newData.LineaBase = moment(fecha).format()
                    newData.LineaBaseModifico = usuarioActual

                    newDataO.LineaBase = moment(fecha).format()
                    newDataO.LineaBaseModifico = usuarioActual
                })
                break;
            case 'FechaEstimada':
                await sp.web.lists.getByTitle("Flujo Tareas").items.getById(fila.ID).update({
                    FechaEstimada: fecha,
                }).then(() => {
                    newData.FechaEstimada = moment(fecha).format()
                    newDataO.FechaEstimada = moment(fecha).format()
                })
                break;
            default:
                break;
        }

        let datosActualizados = util.inicializarArregloDatos(this.state.idVentana, this.state.datosVentana.datos)
        datosActualizados.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice, 1, newData]] })
        let datosActualizadosO = util.inicializarArregloDatos(this.state.idVentana, this.state.datosOriginalVentana.datos)
        datosActualizadosO.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[filaIndiceO, 1, newDataO]] })
        this.setState({ datosVentana: datosActualizados, datosOriginalVentan: datosActualizadosO })
    }

    //Almacena temporalmente los items seleccionados o modificados en la E.G.
    onSeleccionarItem = (event, idElemento) => {
        const indice = checkedItems.findIndex((obj => obj.datos.ID === idElemento));
        if (indice !== -1) {
            if (event !== null) { checkedItems[indice].datos.Seleccionado = event.target.checked; }
            checkedItems[indice].cambio = true
        }
    }

    //Guarda la información capturada en la E.G.
    onSave = async elementos => {
        let contadores = {
            admin: 0,
            norm: 0,
            proy: 0
        }
        elementos.forEach(async elemento => {
            if (elemento.cambio) {
                //Si no tiene ID de elemento asignado, se creará la tarea en Flujo Tareas
                if (elemento.datos.IdFlujoTareasId === null) {
                    this.establecerContador(contadores, elemento.datos.Tarea.TxtVentana, '+')
                    const usuariosAsignados = this.obtenerIdAsignados(elemento.datos.AsignadoA)
                    //Crea la tarea en flujo tareas de la actividad seleccionada
                    await sp.web.lists.getByTitle("Flujo Tareas").items.add({
                        IdProyectoInversionId: elemento.datos.ProyectoInversion.ID,
                        IdTareaId: elemento.datos.Tarea.ID,
                        IdTerrenoId: elemento.datos.Terreno.ID,
                        NivelId: elemento.datos.Terreno.ID === undefined ? 1 : 2,
                        GrupoResponsableId: elemento.datos.GrupoResponsable.ID,
                        AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] },
                        EstatusId: 1,
                        Visible: true
                    }).then(async a => {
                        //Actualiza la información de la actividad seleccionada en la lista de Estrategia de gestión
                        await sp.web.lists.getByTitle("EstrategiaGestion").items.getById(elemento.datos.ID).update({
                            Seleccionado: elemento.datos.Seleccionado,
                            IdFlujoTareasId: a.data.Id,
                            AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] },
                            EstatusId: 3
                        }).then(u => {
                            //Asigna el ID de elemento generado en flujo tareas al objeto en memoria del item seleccionado
                            //en la vetana de la EG
                            const indice = checkedItems.findIndex((obj => obj.datos.ID === elemento.datos.ID));
                            if (indice !== -1) {
                                checkedItems[indice].datos.IdFlujoTareasId = a.data.Id
                            }
                            this.setState({ totalAdmin: this.state.totalAdmin + contadores.admin, totalNorm: this.state.totalNorm + contadores.norm, totalProy: this.state.totalProy + contadores.proy })
                        });
                    });
                } else {
                    //Si ya tiene ID de elemento asignado, se actualizará la tarea en flujo tareas
                    const usuariosAsignados = this.obtenerIdAsignados(elemento.datos.AsignadoA)
                    this.establecerContador(contadores, elemento.datos.Tarea.TxtVentana, elemento.datos.Seleccionado ? '+' : '-')
                    await sp.web.lists.getByTitle("Flujo Tareas").items.getById(elemento.datos.IdFlujoTareasId).update({
                        AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] },
                        Visible: elemento.datos.Seleccionado
                    }).then(async u => {
                        //Establece como seleccionado en la lista de EG
                        await sp.web.lists.getByTitle("EstrategiaGestion").items.getById(elemento.datos.ID).update({
                            AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] },
                            Seleccionado: elemento.datos.Seleccionado
                        });
                    });
                }
            }
        });
    }

    //#region Métodos de ciclo de vida
    async componentWillMount() {
        { util.styleLinkGen("genericoEG.css", "../estilos/genericoEG.css") }

        webUrl = await sp.web()
        webCdT = webUrl.Url
        webUrl = webUrl.Url.replace('/CompraDeTerreno', '')
        //Obtiene los datos del usuario actual
        usuarioActual = await sp.web.currentUser.get();
        //Obtiene los grupos en los que está registrado el usuario actual en la lista de GanttPersonColab
        gruposUsuarioActual = await sp.web.lists.getByTitle('GanttPersonColab').items
            .filter('AdminAreaGanttId eq ' + usuarioActual.Id + ' or RespAreaGanttId eq ' + usuarioActual.Id)
            .get()

        this.cargarDatosIniciales(this.props.rfs, this.props.idProyecto, this.props.idTerreno, this.props.TerrenoId, '')
    }

    //#endregion
    obtenerAsignados = campo => {
        var usuarios = campo.map((registro) => {
            return (registro.Title)
        })
        return usuarios
    }

    obtenerIdAsignados = campo => {
        let val = { results: [] }
        if (campo !== undefined) {
            campo.map((registro) => {
                val.results.push((registro.Id || registro.ID))
            })
        }
        return val
    }

    onActualizarDatos = async arregloDatos => {
        const { idVentana, MACO, idProyecto, tipo } = this.state
        if (idVentana === 4) {
            //Si el evento viene desde un modal que no es tarea
            if (arregloDatos.tarea === 0) {
                //#region ventana EG
                const filaEGIndice = this.state.datosVentanaEG.datos.findIndex(datosEG => datosEG.ID === this.state.modal.filaSeleccionada.ID)
                const filaEGIndiceO = this.state.datosOriginalVentanaEG.datos.findIndex(datosEG => datosEG.ID === this.state.modal.filaSeleccionada.ID)
                let newData = this.state.datosVentanaEG.datos[filaEGIndice]
                let newDataO = this.state.datosOriginalVentanaEG.datos[filaEGIndiceO]

                if (newData.IdFlujoTareasId !== null)
                    this.onSeleccionarItem(null, newData.ID);

                if (newDataO.IdFlujoTareasId !== null)
                    this.onSeleccionarItem(null, newDataO.ID);

                if (newDataO.IdFlujoTareasId !== null)
                    this.onSeleccionarItem(null, newDataO.ID)

                newData.AsignadoA = arregloDatos.dato
                newDataO.AsignadoA = arregloDatos.dato
                let datosActualizados = util.inicializarArregloDatos(4, this.state.datosVentanaEG.datos)
                let datosActualizadosO = util.inicializarArregloDatos(4, this.state.datosOriginalVentanaEG.datos)
                datosActualizados.datos = update(this.state.datosVentanaEG.datos, { $splice: [[filaEGIndice, 1, newData]] })
                datosActualizadosO.datos = update(this.state.datosOriginalVentanaEG.datos, { $splice: [[filaEGIndiceO, 1, newDataO]] })
                this.setState({ datosVentanaEG: datosActualizados, datosOriginalVentanaEG: datosActualizadosO })

            } else {
                //Si el evento viene desde un modal que sí­ es tarea
                switch (arregloDatos.tarea) {
                    case 24:
                        //Si se definió RFSN como 'Ninguno' y ya hay MACO definida...
                        if (arregloDatos.dato && MACO !== null) {
                            //Establece el spinner mientras se generan los datos de la EG
                            this.setState({ backdrop: { cargado: false, mensaje: 'Generando estrategia de gestión. Esto podrí­a tardar unos minutos...' } })
                            const terrenosPI = await sp.web.lists.getByTitle('Terrenos').items.filter('IdProyectoInversionId eq ' + idProyecto + ' and Empadronamiento eq null').get()

                            const nuevasTareasEG = await sp.web.lists.getByTitle("Tareas").items.filter("((DetonacionInicial eq 0) and (MACO eq 'X' or MACO eq '" + MACO + "') and (CrearConRFS eq 0))").get();
                            const generarEG = async () => {
                                await util.asyncForEach(terrenosPI, async terrenoPI => {
                                    await util.asyncForEach(nuevasTareasEG, async nuevaTarea => {
                                        let tareaEG = 0
                                        if (nuevaTarea.OrdenEG === null && nuevaTarea.ID !== 244) {

                                            //Crea el elemento en la lista de Flujo Tareas 
                                            tareaEG = await sp.web.lists.getByTitle("Flujo Tareas").items.add({
                                                IdProyectoInversionId: terrenoPI.IdProyectoInversionId,
                                                IdTareaId: nuevaTarea.ID,
                                                NivelId: 2,
                                                IdTerrenoId: terrenoPI.Id,
                                                GrupoResponsableId: nuevaTarea.GrupoId,
                                                EstatusId: 1,
                                                Visible: true
                                            }).catch(error => {
                                                alert('Error al generar la tarea de EG en flujo tareas: ' + error)
                                            })
                                        }
                                        if (nuevaTarea.EnEG) {
                                            //Crea el elemento en la estrategia de gestión del terreno resultante actual
                                            await sp.web.lists.getByTitle("EstrategiaGestion").items.add({
                                                ProyectoInversionId: terrenoPI.IdProyectoInversionId,
                                                TerrenoId: terrenoPI.ID,
                                                TareaId: nuevaTarea.ID,
                                                GrupoResponsableId: nuevaTarea.GrupoId,
                                                Seleccionado: false,
                                                IdFlujoTareasId: tareaEG.data !== undefined ? tareaEG.data.ID : tareaEG,
                                                EstatusId: 1
                                            }).catch(error => {
                                                alert('Error al generar la EG: ' + error)
                                            })
                                        }
                                    });
                                });
                                //Establece el spinner mientras se cargan los datos generados anteriormente
                                this.cargarDatosIniciales(true, terrenosPI[0].IdProyectoInversionId, terrenosPI[0].ID, terrenosPI[0].Title, '')
                            }
                            generarEG();
                        } else {
                            //Establece el spinner mientras para cargar la nueva tarea generada a partir del RFS
                            this.onCambiarVentana(4, 'Cargando contenido generado...', "genericoEG.css", "../estilos/genericoEG.css", "", '')
                        }
                        break;
                    case 25:
                    case 30:
                    case 35:
                        this.setState({ backdrop: { cargado: false, mensaje: 'Generando estrategia de gestión. Esto podrí­a tardar unos minutos...' } })
                        const unionMetrajes = arregloDatos.dato.metrajesTr.map((metraje) => {
                            return metraje.valor
                        }).join(',')

                        //Deshabilita las tareas a nivel PI que ya no son necesarias después de hacer un RFS
                        const tareasDeshabilitar = await sp.web.lists.getByTitle("Tareas").items
                            .filter('Desactivable eq 1')
                            .select('ID')
                            .get()

                        await util.asyncForEach(tareasDeshabilitar, async (tareaDeshabilitar) => {
                            await sp.web.lists.getByTitle("Flujo Tareas").items
                                .filter('IdProyectoInversionId eq ' + idProyecto + ' and IdTareaId eq ' + tareaDeshabilitar.ID)
                                .get()
                                .then(async (ft) => {
                                    if (ft.length > 0) {
                                        await sp.web.lists.getByTitle("Flujo Tareas").items.getById(ft[0].Id).update({
                                            EstatusId: 3
                                        }).catch(error => {
                                            alert('Error al deshabilitar la tarea: ' + error)
                                        })
                                    }
                                })
                                .catch(error => {
                                    alert('Error al obtener la tareas a deshabilitar: ' + error)
                                })
                        }).then(async () => {
                            const rootweb = await sp.web.getParentWeb()
                            let websCdV = await rootweb.web.webs()
                            let weBdTVersionado = websCdV[0]
                            weBdTVersionado = await sp.site.openWebById(weBdTVersionado.Id)

                            const terrenosVersionadoPI = await weBdTVersionado.web.lists.getByTitle("Terrenos").items
                                .filter("IdPredio/IdPredio eq '" + arregloDatos.dato.tituloPI + "'")
                                .select('ID', 'Title', 'Metraje', 'IdPredio/ID', 'IdPredio/Title', 'IdPredio/IdPredio', 'Calle', 'Colonia', 'CodigoPostal', 'NoExterior', 'Municipio')
                                .expand('IdPredio').orderBy('ID', false).get()

                            //Guarda la información de los terrenos seleccionados en la terea en la lista de RFS
                            await util.asyncForEach(arregloDatos.dato.terrenos, async (terrenoActual) => {
                                await sp.web.lists.getByTitle('RFSN').items.add({
                                    IdProyectoInversionId: idProyecto,
                                    FRSN: arregloDatos.dato.tipo === 'TS' ? 'Subdivisión' : (tipo === 'TR' ? 'Relotificación' : 'Fusión'),
                                    IdFlujoId: arregloDatos.dato.idFlujoTareas,
                                    IdTerrenoId: terrenoActual.ID,
                                    CantidadTerrenos: arregloDatos.dato.cantidadTerrenos,
                                    Metrajes: unionMetrajes
                                }).catch(error => {
                                    alert('Error al agregar datos en RFS: ' + error)
                                })
                            }).then(async () => {
                                //Establece la tarea como Enviada
                                await sp.web.lists.getByTitle("Flujo Tareas").items.getById(arregloDatos.dato.idFlujoTareas).update({
                                    EstatusId: 3
                                }).then(async () => {
                                    //Establece el empadronamiento a los terrenos seleccionados en la tarea
                                    await util.asyncForEach(arregloDatos.dato.terrenos, async (terrenoActual) => {
                                        await sp.web.lists.getByTitle("Terrenos").items.getById(terrenoActual.ID).update({
                                            Empadronamiento: 'Sí'
                                        }).catch(error => {
                                            alert('Error al establecer el empadronamiento: ' + error)
                                        })
                                    })
                                    let terrenosGenerados = 1
                                    //Crea los terrenos resultantes en la lista de terrenos de Búsqueda de terreno versionado
                                    await util.asyncForEach(arregloDatos.dato.terrenosResultantes, async (terrenoResultante, index) => {
                                        const maxTerrenos = await weBdTVersionado.web.lists.getByTitle("Terrenos").items.select('ID').top(1).orderBy('ID', false).get()
                                        const nuevoTerrenoId = arregloDatos.dato.tipo + '-' + util.padLeft(maxTerrenos[0].Id + 1, 5)
                                        await weBdTVersionado.web.lists.getByTitle('Terrenos').items.add({
                                            IdPredioId: terrenosVersionadoPI[0].IdPredio.ID,
                                            Title: nuevoTerrenoId,
                                            Calle: terrenosVersionadoPI[0].Calle,
                                            Colonia: terrenosVersionadoPI[0].Colonia,
                                            CodigoPostal: terrenosVersionadoPI[0].CodigoPostal,
                                            NoExterior: terrenosVersionadoPI[0].NoExterior,
                                            Municipio: terrenosVersionadoPI[0].Municipio,
                                            Metraje: arregloDatos.dato.metrajesTr[index].valor
                                        }).then(async () => {
                                            //Crea los terrenos resultantes en la lista de terrenos de Compra de terreno
                                            await sp.web.lists.getByTitle('Terrenos').items.add({
                                                IdProyectoInversionId: idProyecto,
                                                Title: nuevoTerrenoId,
                                                NombredelTerreno: arregloDatos.dato.tipo === 'TS' ? 'Subdivisión' : (arregloDatos.dato.tipo === 'TF' ? 'Fusión' : 'Relotificación'),
                                                NombredelTerreno2: arregloDatos.dato.tipo === 'TS' ? 'Subdivisión' : (arregloDatos.dato.tipo === 'TF' ? 'Fusión' : 'Relotificación'),
                                                MACO: terrenoResultante.MACO,
                                                Calle: terrenosVersionadoPI[0].Calle,
                                                Colonia: terrenosVersionadoPI[0].Colonia,
                                                CodigoPostal: terrenosVersionadoPI[0].CodigoPostal,
                                                NoExterior: terrenosVersionadoPI[0].NoExterior,
                                                Delegacion: terrenosVersionadoPI[0].Municipio,
                                                Metraje: arregloDatos.dato.metrajesTr[index].valor
                                            }).then(async (terr) => {
                                                //const nuevasTareasEG = await sp.web.lists.getByTitle("Tareas").items.filter("((OrdenEG ge 4 and OrdenEG le 5) and (DetonacionInicial eq 0) and (MACO eq 'X' or MACO eq '" + arregloDatos.dato.tipo + "' or MACO eq '" + terrenoResultante.MACO + "'))").get();
                                                const nuevasTareasEG = await sp.web.lists.getByTitle("Tareas").items.filter("((DetonacionInicial eq 0) and (MACO eq 'X' or MACO eq '" + arregloDatos.dato.tipo + "' or MACO eq '" + terrenoResultante.MACO + "'))").get();

                                                const generarEG = async () => {
                                                    await util.asyncForEach(nuevasTareasEG, async nuevaTarea => {
                                                        let tareaEG = 0
                                                        if (nuevaTarea.MACO === arregloDatos.dato.tipo || (nuevaTarea.OrdenEG === null && nuevaTarea.ID !== 244)) {
                                                            //Crea el elemento en la lista de Flujo Tareas 
                                                            tareaEG = await sp.web.lists.getByTitle("Flujo Tareas").items.add({
                                                                IdProyectoInversionId: idProyecto,
                                                                IdTareaId: nuevaTarea.ID,
                                                                NivelId: 2,
                                                                IdTerrenoId: terr.data.Id,
                                                                GrupoResponsableId: nuevaTarea.GrupoId,
                                                                EstatusId: 1,
                                                                Visible: true
                                                            }).catch(error => {
                                                                alert('Error al generar la tarea de EG en flujo tareas: ' + error)
                                                            })
                                                        }
                                                        if (nuevaTarea.EnEG) {
                                                            //Crea el elemento en la estrategia de gestión del terreno resultante actual
                                                            await sp.web.lists.getByTitle("EstrategiaGestion").items.add({
                                                                ProyectoInversionId: idProyecto,
                                                                TerrenoId: terr.data.Id,
                                                                TareaId: nuevaTarea.ID,
                                                                GrupoResponsableId: nuevaTarea.GrupoId,
                                                                Seleccionado: false,
                                                                IdFlujoTareasId: tareaEG.data !== undefined ? tareaEG.data.ID : tareaEG,
                                                                EstatusId: 1
                                                            }).catch(error => {
                                                                alert('Error al generar la EG: ' + error)
                                                            })
                                                        }
                                                    });
                                                    if (terrenosGenerados === arregloDatos.dato.terrenosResultantes.length) {
                                                        this.cargarDatosIniciales(true, idProyecto, terr.data.Id, terr.data.Title, arregloDatos.dato.tipo)
                                                    } else {
                                                        terrenosGenerados += 1
                                                    }
                                                }
                                                generarEG();
                                            }).catch(error => {
                                                alert('Error al crear el terreno resultante: ' + error)
                                            })
                                        }).catch(error => {
                                            alert('Error al guardar en Terrenos versionado: ' + error)
                                        })
                                    });
                                }).catch(error => {
                                    alert('Error al guardar en Flujo Tareas: ' + error)
                                })

                            }).catch(error => {
                                alert('Error al guardar en RFS: ' + error)
                            })
                        })
                        break;
                    default:
                        break;
                }
            }
            //#endregion
        } else {
            //#region Otras ventanas
            if (arregloDatos.tarea === 0) {
                //Si la ventana donde sucede el evento es Normativo, Proyectos o Administración
                const usuariosAsignados = this.obtenerIdAsignados(arregloDatos.dato)
                const idElemento = this.state.modal.filaSeleccionada.ID
                const filtroEG = this.state.modal.filaSeleccionada.Nivel.ID === 1 ?
                    'ProyectoInversionId eq ' + this.state.modal.filaSeleccionada.IdProyectoInversion.ID + ' and TareaId eq ' + this.state.modal.filaSeleccionada.IdTarea.ID
                    : 'ProyectoInversionId eq ' + this.state.modal.filaSeleccionada.IdProyectoInversion.ID + ' and TerrenoId eq ' + this.state.modal.filaSeleccionada.IdTerreno.ID + ' and TareaId eq ' + this.state.modal.filaSeleccionada.IdTarea.ID
                await sp.web.lists.getByTitle("Flujo Tareas").items.getById(idElemento).update({
                    AsignadoAId: usuariosAsignados
                }).then(async () => {
                    const itemEG = await sp.web.lists.getByTitle("EstrategiaGestion").items.filter(filtroEG).get()
                    if (itemEG.length > 0) {
                        await sp.web.lists.getByTitle("EstrategiaGestion").items.getById(itemEG[0].Id).update({
                            AsignadoAId: usuariosAsignados
                        })
                    }
                    const filaIndice = this.state.datosVentana.datos.findIndex(datos => datos.ID === idElemento)
                    const filaIndiceO = this.state.datosOriginalVentana.datos.findIndex(datos => datos.ID === idElemento)
                    let newData = this.state.datosVentana.datos[filaIndice]
                    let newDataO = this.state.datosOriginalVentana.datos[filaIndiceO]
                    newData.AsignadoA = arregloDatos.dato
                    newDataO.AsignadoA = arregloDatos.dato

                    let datosActualizados = util.inicializarArregloDatos(0, this.state.datosVentana.datos)
                    let datosActualizadosO = util.inicializarArregloDatos(0, this.state.datosOriginalVentana.datos)

                    datosActualizados.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice, 1, newData]] })
                    datosActualizadosO.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[filaIndiceO, 1, newDataO]] })
                    this.setState({ datosVentana: datosActualizados, datosOriginalVentana: datosActualizadosO })
                }).catch(error => {
                    alert(error)
                })
            } else if (arregloDatos.tarea === 272) {
                const filaIndice = this.state.datosVentana.datos.findIndex(datos => datos.ID === arregloDatos.dato.idElemento)
                const filaIndiceO = this.state.datosOriginalVentana.datos.findIndex(datos => datos.ID === arregloDatos.dato.idElemento)
                let newData = this.state.datosVentana.datos[filaIndice]
                let newDataO = this.state.datosOriginalVentana.datos[filaIndiceO]
                newData.Estatus = arregloDatos.dato.estatus
                newDataO.Estatus = arregloDatos.dato.estatus

                let datosActualizados = util.inicializarArregloDatos(0, this.state.datosVentana.datos)
                let datosActualizadosO = util.inicializarArregloDatos(0, this.state.datosOriginalVentana.datos)

                datosActualizados.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice, 1, newData]] })
                datosActualizadosO.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[filaIndiceO, 1, newDataO]] })
                this.setState({ datosVentana: datosActualizados, datosOriginalVentana: datosActualizadosO })
            }
            //#endregion
        }
    }

    render() {
        const { idVentana, totalAdmin, totalNorm, totalProy, MACO, filtrosTabla, idTerreno, idProyecto, nombreTerreno } = this.state
        const Cluster = (props) => {
            if (props.titulos.length > 0) {
                if (props.idVentana !== 4) {
                    //Otras ventanas
                    const filaCluster = props.titulos.map((fila) => {
                        var idcluster = fila.cluster.ID * 0.16;
                        var id = "body" + idcluster;
                        var arrow = "expandir" + idcluster
                        var average = util.average(props, fila.cluster.IdTarea.Orden);
                        var existeFila = "";
                        return (
                            <div key={fila.cluster.IdTarea.Orden} style={{ width: "98%" }}>
                                <div className="row" >
                                    {<input style={{ paddingLeft: "5px", marginTop: "13px", visibility: "hidden" }} type='checkbox' className='checkBox'></input>}
                                    <div className='titulo'>
                                        <div onClick={() => util.toggle(id, arrow, 4)} className="row" >
                                            <div className="col-sm-10">
                                                <p style={{ paddingLeft: "14px" }}>
                                                    <img style={{ paddingRight: "1%" }} id={arrow} src={arrow_up_icon} alt='arrow_up_icon'></img>
                                                    {fila.cluster.IdTarea.TxtCluster}
                                                </p>
                                            </div>
                                            {fila.cluster.IdTarea.TxtCluster === "Marketing" ?
                                                <div className="col-sm-1" style={{ paddingLeft: "30px" }}>
                                                    <p className="numberCircle pad100"><img src={disk} alt='disk_icon'></img></p>
                                                </div> :
                                                <div className="col-sm-1" style={{ paddingLeft: "30px" }}>
                                                    <p className="numberCircleEG pad"><img src={attach_icon} alt='attach_icon'></img></p>
                                                </div>
                                            }
                                            <div className="col-sm-1">
                                                {average === 100 ? <p className="numberCircle pad100">{average}%</p> : <p className="numberCircle pad">{average}%</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {this.state.terrenos.map((terr) => {
                                    return util.bodyFunAll(terr, props, fila).length > 0 ?
                                        <div key={idcluster}>
                                            {terr !== "" ?
                                                util.bodyFunAll(terr, props, fila).length > 2 ?
                                                    <div id={id.substring(0, 4) + idcluster++} tag={id.substring(0, 4) + idcluster++}
                                                        style={{ display: "block", paddingLeft: "3%", width: "97%" }} >
                                                        <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.IdTarea.Orden} />
                                                    </div> :
                                                    <div id={id} style={{ display: "block", paddingLeft: "3%", width: "97%" }} >
                                                        <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.IdTarea.Orden} />
                                                    </div> :
                                                <div className={id} id={id + "*"} style={{ display: "block", paddingLeft: "3%", width: "97%" }} >
                                                    <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.IdTarea.Orden} />
                                                </div>
                                            }
                                            <div className='row empty-space' ></div>
                                        </div>
                                        : <div>
                                            <div key={idcluster + 1} style={{ display: "block", paddingLeft: "3%", width: "97%" }} >
                                                <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.IdTarea.Orden} />
                                            </div>
                                        </div>
                                })}
                            </div >
                        )
                    });
                    return <div key={0} className="row justify-content-end">{filaCluster}</div>
                } else {
                    //Ventana de estrategia de gestión
                    const filaCluster = props.titulos.map((fila) => {
                        var average = 0;
                        var idcluster = fila.cluster.ID * 0.16;
                        var idEG = "bodyEg" + idcluster;
                        var arrow = "expandirEG" + idcluster;
                        return (
                            <div key={fila.cluster.OrdenEG} style={{ width: "98%" }}>
                                <div className="row" >
                                    {fila.cluster.Checkable === '1' ?
                                        <input id={fila.cluster.OrdenEG} onClick={() => util.toggleCheck(fila.cluster.OrdenEG, props.datos)} style={{ paddingLeft: "5px", marginTop: "13px" }} type='checkbox' className='checkBox'></input> :
                                        <input style={{ paddingLeft: "5px", marginTop: "13px", visibility: "hidden" }}  style={{ visibility: "none" }} type='checkbox' className='checkBox'></input>}
                                    <div className='titulo'>
                                        <div onClick={() => util.toggle(idEG, arrow, 6)} className="row" >
                                            <div className="col-sm-10">
                                                <p style={{ paddingLeft: "14px" }}>
                                                    <img style={{ paddingRight: "1%" }} id={arrow} src={arrow_up_icon} alt='arrow_up_icon'></img>
                                                    {fila.cluster.TxtCluster}
                                                </p>
                                            </div>
                                            <div className="col-sm-1" style={{ paddingLeft: "30px" }}>
                                                <p className="numberCircleEG pad"><img src={attach_icon} alt='attach_icon'></img></p>
                                            </div>
                                            <div className="col-sm-1">
                                                {average === 100 ? <p className="numberCircleEG pad100">{average}%</p> : <p className="numberCircleEG pad">{average}%</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {this.state.terrenos.map((terr) => {
                                    return (util.bodyFunEG(terr, props, fila).length > 0 ?
                                        <div key={idcluster}>
                                            {terr !== "" ?
                                                util.bodyFunEG(terr, props, fila).length > 2 ?
                                                    <div id={idEG.substring(0, 6) + idcluster++} tag={idEG.substring(0, 6) + idcluster++}
                                                        style={{ display: "block", paddingLeft: "3%", width: "97%" }} >
                                                        <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.OrdenEG} esCheckable={fila.cluster.Checkable} />
                                                    </div> :
                                                    <div id={idEG} style={{ display: "block", paddingLeft: "3%", width: "97%" }} >
                                                        <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.OrdenEG} esCheckable={fila.cluster.Checkable} />
                                                    </div> :
                                                <div className={idEG} id={idEG + "*"} style={{ display: "block", paddingLeft: "3%", width: "97%" }} >
                                                    <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.OrdenEG} esCheckable={fila.cluster.Checkable} />
                                                </div>
                                            }
                                            <div className='row empty-space' ></div>
                                        </div>
                                        : <div>
                                            <div key={idcluster + 1} style={{ display: "block", paddingLeft: "3%", width: "97%" }} >
                                                <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.OrdenEG} esCheckable={fila.cluster.Checkable} />
                                            </div>
                                        </div>
                                    )
                                })
                                }
                            </div >
                        )
                    });
                    return <div key={0} className="row justify-content-end">
                        {filaCluster}
                        <div style={{ paddingRight: "2.5%" }}  >
                            <input style={{ borderRadius: "10%", width: "90px", backgroundColor: "#75E7BC" }} type='button' value='OK' className='btn btn-info' onClick={() => this.onSave(checkedItems)} />
                        </div>
                    </div>
                }
            } else {
                return null
            }
        }

        const Columna = (props) => {
            //Si abre el modal cuando se da clic
            if (props.editable) {
                if (props.titulo.length <= 20) {
                    if (util.contains(props.titulo, "RFS")) {
                        return (
                            <div className={props.estilo} onClick={() => { this.onAbrirModal(props.terreno, props.idElemento, props.esTarea, null, null, props.datos, this.state.idVentana, "", "255px") }} >{props.titulo}</div>
                        );
                    }
                    else {
                        return (
                            <div className={props.estilo} onClick={() => { this.onAbrirModal(props.terreno, props.idElemento, props.esTarea, null, null, props.datos, this.state.idVentana, "lg", "550px") }} >{props.titulo}</div>
                        );
                    }
                }
                else {
                    return (
                        <div className={props.estilo} onClick={() => { this.onAbrirModal(props.terreno, props.idElemento, props.esTarea, null, null, props.datos, this.state.idVentana, "lg", "380px") }} >{props.titulo}</div>
                    );
                }
            } else {
                return (
                    <div className={props.estilo}>{props.titulo}</div>
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
                    case "Favoritos":
                        if (fila.titulo === "Favoritos") {
                            this.state.Star = false;
                            this.state.Gantt = false;
                            this.state.User = false;
                            return (
                                <div key={index} className={fila.estilo} >
                                    <p style={{ marginTop: "26px", paddingRight: "30px", textAlign: "center" }}>
                                        {this.state.idVentana === 1 ?
                                            <img src={clear_icon} alt='clear_icon_icon' onClick={() => { this.onCambiarVentana(this.state.idVentana, 'limpiando filtros...', "genericoAdmin.css", "../estilos/genericoAdmin.css", "", "") }} />
                                            : this.state.idVentana === 2 ?
                                                <img src={clear_icon} alt='clear_icon_icon' onClick={() => { this.onCambiarVentana(this.state.idVentana, 'limpiando filtros...', "genericoNorm.css", "../estilos/genericoNorm.css", "", "") }} />
                                                : this.state.idVentana === 3 ?
                                                    <img src={clear_icon} alt='clear_icon_icon' onClick={() => { this.onCambiarVentana(this.state.idVentana, 'limpiando filtros...', "genericoProy.css", "../estilos/genericoProy.css", "", "") }} />
                                                    : this.state.idVentana === 4 ?
                                                        <img src={clear_icon} alt='clear_icon_icon' onClick={() => { this.onCambiarVentana(this.state.idVentana, 'limpiando filtros...', "genericoEG.css", "../estilos/genericoEG.css", "", "") }} />
                                                        : null}

                                    </p>
                                </div>
                            )
                        }
                        else {
                            return (
                                <div key={index} className={fila.estilo} >
                                    <p style={{ marginTop: "30px", textAlign: "center" }}>
                                        {fila.titulo}
                                    </p>
                                </div>
                            )
                        }
                    case 'E. de G. autorizada':
                        return (
                            <div key={index} className={fila.estilo} >
                                <p style={{ marginTop: "30px", textAlign: "center" }}>
                                    <img style={{ marginRight: "5px" }} id='CargaEG' src={egupload_icon} alt='egupload_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 269, false, null, null, { Tarea: { ID: 269 } }, null, "", "115px") }}></img>
                                    {fila.titulo}
                                </p>
                            </div>
                        )
                    case 'Asignado a':
                        let valores = []
                        fila.Arreglo.sort((a, b) => a.AsignadoA - b.AsignadoA).sort((a, b) => a.Title - b.Title);
                        let valoreAsignadoA = fila.Arreglo.map((valor) => {
                            return idVentana === 4 ?
                                (valor.AsignadoA !== undefined ? valor.AsignadoA.map((x) => { valores.push(x.Title) }) : null)
                                :
                                (valor.IdTarea !== undefined ?
                                    (valor.IdTarea.Orden >= idVentana && valor.IdTarea.Orden <= idVentana + 1 ?
                                        (valor.AsignadoA !== undefined ? valor.AsignadoA.map((x) => { valores.push(x.Title) }) : null)
                                        : null) : null
                                )
                        })
                        valoreAsignadoA = [...new Set(valores)]
                        return (
                            <div key={index} className={fila.estilo}>
                                <FormControl className={classes.formControl}>
                                    <InputLabel id={"lbl" + fila.interN}>{fila.titulo}</InputLabel>
                                    <Select key={index} labelId="lblAsignado" id={"cmb" + fila.interN} name={fila.titulo + "|" + fila.Tipo}
                                        value={filtrosTabla[fila.titulo.toLowerCase().trim().replace('.', '').replace(' ', '')]}
                                        onChange={this.onHandleChange}>
                                        <MenuItem value=''><em>Ninguno</em></MenuItem>
                                        {valoreAsignadoA.sort().map((valor, i) => {
                                            return <MenuItem key={i} value={valor}>{valor}</MenuItem>
                                        })}
                                    </Select>
                                </FormControl>
                            </div>
                        )
                    case 'Responsable':
                    case 'Estatus':
                    case 'Linea base':
                    case 'F. estimada':
                        let valoresRespEst = fila.Arreglo.map((valor) => {
                            return idVentana === 4 ?
                                fila.titulo === 'Responsable' ? valor.GrupoResponsable.NombreCortoGantt
                                    : (fila.titulo === 'Estatus' ? valor.Estatus.Title
                                        : (fila.titulo === 'Linea base' ? util.spDate(valor.LineaBase)
                                            : (fila.titulo === 'F. estimada' ? util.spDate(valor.FechaEstimada) : null)
                                        )
                                    )
                                :
                                (valor.IdTarea !== undefined ?
                                    (valor.IdTarea.Orden >= idVentana && valor.IdTarea.Orden <= idVentana + 1 ?
                                        fila.titulo === 'Responsable' ? valor.GrupoResponsable.NombreCortoGantt
                                            : (fila.titulo === 'Estatus' ? valor.Estatus.Title
                                                : (fila.titulo === 'Linea base' ? util.spDate(valor.LineaBase)
                                                    : (fila.titulo === 'F. estimada' ? util.spDate(valor.FechaEstimada) : null)
                                                )
                                            ) : null) : null
                                )
                        })
                        valoresRespEst = valoresRespEst.filter(x => x !== null && x !== undefined)
                        valoresRespEst = [...new Set(valoresRespEst)]
                        return (
                            <div key={index} className={fila.estilo}>
                                <FormControl className={classes.formControl}>
                                    <InputLabel id={"lbl" + fila.interN}>{fila.titulo}</InputLabel>
                                    <Select key={index} labelId={"lbl" + fila.interN}
                                        id={"cmb" + fila.interN}
                                        value={filtrosTabla[fila.titulo.toLowerCase().trim().replace('.', '').replace(' ', '')]}
                                        name={fila.titulo + "|" + fila.Tipo} onChange={this.onHandleChange}>
                                        <MenuItem value=''><em>Ninguno</em></MenuItem>
                                        {valoresRespEst.sort().map((valor, i) => {
                                            return <MenuItem key={i} value={valor}>{valor}</MenuItem>
                                        })}
                                    </Select>
                                </FormControl>
                            </div>
                        )
                    default:
                        break;
                }
            });

            return (
                <div key={0} className="row justify-content-end">
                    <div style={{ padding: "8px", width: "98%" }}>
                        <div style={{ paddingLeft: "3%", width: "97%" }}>
                            <div>
                                <div className="row">
                                    {filaHeader}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        const Body = (props) => {
            if (props.idCluster >= 4) {
                //Estrategia de gestión
                let nombreTerreno = ''
                let filaBody = props.datos.map((fila) => {
                    if (fila.Terreno !== undefined) {
                        if (fila.Terreno.Title === props.tituloTerreno) {
                            nombreTerreno = fila.Terreno.NombredelTerreno2
                            if (fila.Tarea.OrdenEG === props.idCluster) {
                                if (props.esCheckable) {
                                    //Agrega al arreglo los datos de la fila que tiene un check
                                    checkedItems = checkedItems.concat({ datos: fila, cambio: false })
                                }
                                return (
                                    <div key={fila.ID} style={{ paddingLeft: "20px", width: "98%" }}>
                                        <div className="row" >
                                            {props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ?
                                                <input id={props.idCluster + fila.ID} style={{ marginRight: "1%" }} type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e) => this.onSeleccionarItem(e, fila.ID)} ></input> :
                                                <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>}
                                            <div className="item row" >
                                                <Columna titulo={fila.Tarea.ID + ':' + fila.Tarea.Title} estilo='col-sm-5' editable={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? false : true} idElemento={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? fila.Tarea.ID : fila.IdFlujoTareasId} esTarea={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? false : true} terreno={nombreTerreno} datos={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? null : fila} />
                                                <Columna titulo={fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                                                <Columna titulo={<p style={{ textAlign: "center" }}><img title={fila.AsignadoA === undefined ? 'Sin asignar' : (fila.AsignadoA.length > 0 ? this.obtenerAsignados(fila.AsignadoA) : 'Sin asignar')} src={fila.AsignadoA === undefined ? plus_icon : (fila.AsignadoA.length > 0 ? assignedTo_icon : plus_icon)} alt='assignedTo_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila, 4, "lg", "550px") }} /></p>} estilo='col-sm-3' editable={false} />
                                                <Columna estilo='col-sm-3' />
                                            </div>
                                        </div>
                                    </div>
                                )
                            } else {
                                return null
                            }
                        }
                    } else {
                        if (props.tituloTerreno === '') {
                            if (fila.Tarea.OrdenEG === props.idCluster) {
                                if (props.esCheckable) {
                                    //Agrega al arreglo los datos de la fila que tiene un check
                                    checkedItems = checkedItems.concat({ datos: fila, cambio: false })
                                }
                                return (
                                    <div key={fila.ID} style={{ paddingLeft: "20px", width: "98%" }}>
                                        <div className="row" >
                                            {props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ?
                                                <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e) => this.onSeleccionarItem(e, fila.ID)} ></input> :
                                                <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>}
                                            <div className="item row" >
                                                <Columna titulo={fila.Tarea.ID + ':' + fila.Tarea.Title} estilo='col-sm-5' editable={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? false : true} idElemento={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? fila.Tarea.ID : fila.IdFlujoTareasId} esTarea={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? false : true} terreno={nombreTerreno} datos={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? null : fila} />
                                                <Columna titulo={fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                                                <Columna titulo={<p style={{ textAlign: "center" }}><img title={fila.AsignadoA === undefined ? 'Sin asignar' : (fila.AsignadoA.length > 0 ? this.obtenerAsignados(fila.AsignadoA) : 'Sin asignar')} src={fila.AsignadoA === undefined ? plus_icon : (fila.AsignadoA.length > 0 ? assignedTo_icon : plus_icon)} alt='assignedTo_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila, 4, "lg", "550px") }} /></p>} estilo='col-sm-3' editable={false} />
                                                <Columna estilo='col-sm-3' />
                                            </div>
                                        </div>
                                    </div>
                                )
                            } else {
                                return null
                            }
                        }
                    }
                });
                filaBody = filaBody.filter(x => x !== undefined && x !== null);
                return filaBody.length > 0 ?
                    (props.tituloTerreno !== '' ?
                        <div><div className='terreno'>{props.tituloTerreno + ': ' + nombreTerreno}
                        </div> {filaBody}
                            <div key={filaBody.length} style={{ paddingLeft: "20px", width: "98%" }} onClick={() => { this.onAbrirModal(nombreTerreno, 271, false, null, null, { Tarea: { ID: 271 } }, this.state.idVentana, "lg", "550px") }} >
                                <div className="row" >
                                    {<input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>}
                                    <div className="row item-personal" style={{ width: "99%", backgroundColor: "#F8F8F8" }} >
                                        +  Agregar nueva actividad personal
                                    </div>
                                </div>
                            </div>
                        </div>
                        : <div> {filaBody}
                            <div key={0} style={{ paddingLeft: "20px", width: "98%" }} onClick={() => { this.onAbrirModal(nombreTerreno, 271, false, null, null, { Tarea: { ID: 271 } }, this.state.idVentana, "lg", "550px") }} >
                                <div className="row" >
                                    {<input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>}
                                    <div className="row item-personal" style={{ width: "99%", backgroundColor: "#F8F8F8" }} >
                                        +  Agregar nueva actividad personal
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null

            } else {
                //Otras ventanas
                let nombreTerreno = ''
                let filaBody = props.datos.map((fila) => {
                    let urlLink = fila.UrlDocumentos !== null && fila.UrlDocumentos !== undefined ? fila.UrlDocumentos.substring(fila.UrlDocumentos.indexOf('<a')) : ''
                    urlLink = urlLink.replace('<a href="', '').replace(' target="_blank">Ver Documentos</a><a></a></div>', '').replace('"', '').replace(' target="_blank">Ver Documentos', '').replace('"', '')
                    const parseResultDocto = new DOMParser().parseFromString(urlLink, "text/html")
                    var urlDescargarDocto = parseResultDocto.documentElement.textContent
                    let urlTarea = fila.UrlTarea !== null && fila.UrlTarea !== undefined ? fila.UrlTarea.substring(fila.UrlTarea.indexOf('<a')) : ''
                    urlTarea = urlTarea.replace('<a href="', '').replace(' target="_blank">Ver Tarea</a><a></a></div>', '').replace('"', '').replace(' target="_blank">Ver Documentos', '').replace('"', '')
                    const parseResult = new DOMParser().parseFromString(urlTarea, "text/html")
                    const urlAbrirTarea = parseResult.documentElement.textContent

                    if (fila.IdTerreno !== undefined) {
                        if (fila.IdTerreno.Title === props.tituloTerreno) {
                            nombreTerreno = fila.IdTerreno !== undefined ? fila.IdTerreno.NombredelTerreno2 : ''
                            if (fila.IdTarea.Orden === props.idCluster) {
                                return (
                                    <div key={fila.ID} style={{ paddingLeft: "20px", width: "98%" }}>
                                        <div className="row" >
                                            {<input id={fila.ID} style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>}
                                            <div className="item row" >
                                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={es}>
                                                    <Columna titulo={fila.IdTarea.ID + ':' + fila.IdTarea.Title} estilo='col-sm-4' editable={true} idElemento={fila.ID} esTarea={true} terreno={nombreTerreno} datos={fila} />
                                                    <Columna titulo={fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                                                    <Columna titulo={<p><img title={fila.AsignadoA === undefined ? 'Sin asignar' : (fila.AsignadoA.length > 0 ? this.obtenerAsignados(fila.AsignadoA) : 'Sin asignar')} src={fila.AsignadoA === undefined ? plus_icon : (fila.AsignadoA.length > 0 ? assignedTo_icon : plus_icon)} alt='assignedTo_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila, this.state.idVentana, "lg", "550px") }} /></p>} estilo='col-sm-1' editable={false} />
                                                    <Columna titulo={util.spDate(fila.LineaBase)} estilo='col-sm-1' editable={false} />
                                                    <Columna titulo={util.spDate(fila.FechaEstimada)} estilo='col-sm-1' editable={false} />
                                                    {/*<Columna titulo={<DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={fila.LineaBase} onChange={fecha => this.onSeleccionarFecha(fecha, fila, 'LineaBase')} />} estilo='col-sm-1' editable={false} />
                                                    <Columna titulo={<DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={fila.FechaEstimada} onChange={fecha => this.onSeleccionarFecha(fecha, fila, 'FechaEstimada')} />} estilo='col-sm-1' editable={false} />*/}
                                                    <Columna titulo={<span className={fila.Estatus.Title.toLowerCase().replace(' ', '-') + ' badge badge-pill'}>{fila.Estatus.Title}</span>} estilo='col-sm-1' editable={false} />
                                                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={attach_icon} alt='attach_icon' onClick={() => window.open(webUrl + urlDescargarDocto)} /></p>} estilo='col-sm-1' editable={false} />
                                                    <Columna titulo={<p style={{ textAlign: "center", paddingLeft: "10px" }}><img src={more_details_icon} alt='more_details_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 272, false, null, null, { Tarea: { ID: 272 }, info: fila }, this.state.idVentana, "lg", "550px") }} /></p>} estilo='col-sm-1' editable={false} />
                                                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={util.onShowStar(fila, usuarioActual)} alt='favoritos_icon' onClick={(e) => { this.onEstablecerFavorito(fila) }} /></p>} estilo='col-sm-1' editable={false} />
                                                </MuiPickersUtilsProvider>
                                            </div>
                                        </div>
                                    </div>
                                )
                            } else {
                                return null
                            }
                        }
                    } else {
                        if (props.tituloTerreno === '') {
                            if (fila.IdTarea.Orden === props.idCluster) {
                                return (
                                    <div key={fila.ID} style={{ paddingLeft: "20px", width: "98%" }}>
                                        <div className="row" >
                                            {<input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>}
                                            <div className="item row" >
                                                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={es}>
                                                    <Columna id={fila.ID} titulo={fila.IdTarea.ID + ':' + fila.IdTarea.Title} estilo='col-sm-4' editable={true} idElemento={fila.ID} esTarea={true} terreno={nombreTerreno} datos={fila} />
                                                    <Columna titulo={fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                                                    <Columna titulo={<p><img title={fila.AsignadoA === undefined ? 'Sin asignar' : (fila.AsignadoA.length > 0 ? this.obtenerAsignados(fila.AsignadoA) : 'Sin asignar')} src={fila.AsignadoA === undefined ? plus_icon : (fila.AsignadoA.length > 0 ? assignedTo_icon : plus_icon)} alt='assignedTo_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila, this.state.idVentana, "lg", "550px") }} /></p>} estilo='col-sm-1' editable={false} />
                                                    <Columna titulo={util.spDate(fila.LineaBase)} estilo='col-sm-1' editable={false} />
                                                    <Columna titulo={util.spDate(fila.FechaEstimada)} estilo='col-sm-1' editable={false} />
                                                    {/*<Columna titulo={<DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={fila.LineaBase} onChange={fecha => this.onSeleccionarFecha(fecha, fila, 'LineaBase')} />} estilo='col-sm-1' editable={false} />
                                                    <Columna titulo={<DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={fila.FechaEstimada} onChange={fecha => this.onSeleccionarFecha(fecha, fila, 'FechaEstimada')} />} estilo='col-sm-1' editable={false} />*/}
                                                    <Columna titulo={<span className={fila.Estatus.Title.toLowerCase().replace(' ', '-') + ' badge badge-pill'}>{fila.Estatus.Title}</span>} estilo='col-sm-1' editable={false} />
                                                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={attach_icon} alt='attach_icon' onClick={() => window.open(webUrl + urlDescargarDocto)} /></p>} estilo='col-sm-1' editable={false} />
                                                    <Columna titulo={<p style={{ textAlign: "center", paddingLeft: "10px" }}><img src={more_details_icon} alt='more_details_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 272, false, null, null, { Tarea: { ID: 272 }, info: fila }, this.state.idVentana, "lg", "550px") }} /></p>} estilo='col-sm-1' editable={false} />
                                                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={util.onShowStar(fila, usuarioActual)} alt='favoritos_icon' onClick={(e) => { this.onEstablecerFavorito(fila) }} /></p>} estilo='col-sm-1' editable={false} />
                                                </MuiPickersUtilsProvider>
                                            </div>
                                        </div>
                                    </div>
                                )
                            } else {
                                return null
                            }
                        }
                    }
                });
                filaBody = filaBody.filter(x => x !== undefined && x !== null);
                return filaBody.length > 0 ?
                    (props.tituloTerreno !== '' ?
                        <div>
                            <div className='terreno'>{props.tituloTerreno + ': ' + nombreTerreno}
                            </div> {filaBody}
                            <div key={filaBody.length} style={{ paddingLeft: "20px", width: "98%" }} onClick={() => { this.onAbrirModal(nombreTerreno, 271, false, null, null, { Tarea: { ID: 271 } }, this.state.idVentana, "lg", "500px") }}>
                                <div className="row" >
                                    {<input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>}
                                    <div className="row item-personal" style={{ width: "99%", backgroundColor: "#F8F8F8" }} >
                                        +  Agregar nueva actividad personal
                                    </div>
                                </div>
                            </div>
                        </div> :

                        <div> {filaBody}
                            <div key={0} style={{ paddingLeft: "20px", width: "98%" }} onClick={() => { this.onAbrirModal(nombreTerreno, 271, false, null, null, { Tarea: { ID: 271 } }, this.state.idVentana, "lg", "500px") }}>
                                <div className="row" >
                                    {<input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>}
                                    <div className="row item-personal" style={{ width: "99%", backgroundColor: "#F8F8F8" }} >
                                        +  Agregar nueva actividad personal
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null
            }
        }

        return (
            <div>
                <div className='col-sm-12'>
                    <Backdrop abierto={!this.state.backdrop.cargado} mensaje={this.state.backdrop.mensaje} />
                    {this.state.cargado ?
                        <div className='container-fluid'>
                            <Encabezado rfs={this.props.rfs} idPITerr={!this.props.rfs ? idProyecto : idTerreno} terreno={nombreTerreno}
                                maco={MACO} idVentana={this.state.idVentana} disabled={this.state.disabled} cambiarVentana={this.onCambiarVentana} totalAdmin={totalAdmin}
                                totalNorm={totalNorm} totalProy={totalProy} cambioMaco={this.onCambiarMaco} />
                            <Header datosVentana={idVentana === 4 ? this.state.datosVentanaEG.columnas : this.state.datosVentana.columnas} />
                            <Cluster titulos={this.state.clustersVentana} idVentana={idVentana} datos={idVentana === 4 ? this.state.datosVentanaEG.datos : this.state.datosVentana.datos} />
                            {this.state.modal.abierto ? <Modal abrir={this.state.modal} cerrar={this.onCerrarModal} evento={this.onActualizarDatos} datos={this.state.datos} /> : null}
                        </div>
                        : null
                    }
                </div>
            </div >
        );
    }
}

export default Generico;