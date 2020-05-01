import React, { Component } from 'react';
import Encabezado from '../componentes/Encabezado';
import Modal from '../componentes/Ventana';
import Backdrop from '../componentes/Backdrop';
import Skeleton from '@material-ui/lab/Skeleton';
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
import pen from '../imagenes/pen.png';
import hyperlink_icon from '../imagenes/hyperlink_icon.png';

import { sp } from "@pnp/sp";
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import util from '../js/util'
//import {onSave} from '../js/eg.js';
import { es } from 'date-fns/locale';
import moment from 'moment'

var checkedItems = []
var webUrl = ''
var webCdT = ''
var webUrlBit = ''
var usuarioActual
var gruposUsuarioActual
const useStyles = makeStyles(theme => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
        textAlign: "left",
    },
}));

const currentWeb = Web(window.location.protocol + '//' + window.location.host + "/CompraDeTerreno/");

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
            bitacorasInfo: [],
            solucionInfo: [],
            filtrosEncabezado: [],
            Mkt: [],
            filtrosTabla: {
                eg: [],
                acts: [],
                responsable: '',
                asignadoa: '',
                lineabase: '',
                festimada: '',
                estatus: ''
            },
            datosFPT: []
        }
        this.state = this.inialState;
    }
    //Realiza la carga de datos iniciales al seleccionar un terreno o el reinicio de datos cuando se hace una fusión
    cargarDatosIniciales = async (esRFS, idProyecto, idTerreno, terrenoTitulo, tipo, proyectoTitulo) => {
        if (tipo !== 'TR' && tipo !== 'TS') {
            let actividades = []
            let datos = []
            let terrenos = []
            let bitacorasInfo = []
            let solucionInfo = []

            //Si es terreno(s) original(es)
            if (!esRFS) {
                actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                    .filter('(IdProyectoInversionId eq ' + idProyecto + ')')
                    .select('IdTarea/TxtVentana', 'IdTerreno/ID', 'IdTerreno/Title', 'IdTerreno/NombredelTerreno2')
                    .expand('IdTarea', 'IdTerreno')
                    .top(1000)
                    .get();

                terrenos = [...new Set(actividades.map(x => (x.IdTerreno !== undefined ? x.IdTerreno.Title : '')))]

                datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
                    .filter('(ProyectoInversionId eq ' + idProyecto + ')')
                    .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Terreno/Title', 'Terreno/NombredelTerreno2',
                        'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/Orden', 'Tarea/OrdenEG', 'Tarea/Checkable',
                        'Tarea/ExisteEnGantt', 'Tarea/EsCluster', 'Tarea/EsSubcluster', 'AsignadoA/ID', 'AsignadoA/Title',
                        'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId', 'EstatusId',
                        'OrdenEG', 'NombreActividad', 'IdRCDTT/ID', 'IdRCDTT/Title', 'IdRCDTT/TituloInternoDelCampo',
                        'IdRCDTT/IdRTD', 'IdRCDTT/IdTramite', 'IdFPTId')
                    .expand('ProyectoInversion', 'Terreno', 'Tarea', 'AsignadoA', 'GrupoResponsable', 'IdRCDTT')
                    .orderBy('OrdenEG', true)
                    .top(1000)
                    .get();
            } else {
                //Si es terreno RFS
                actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                    .filter("((IdProyectoInversionId eq " + idProyecto + ") and ((IdTerrenoId eq " + idTerreno + ") or (IdTerrenoId eq null) or (IdTerrenoId eq 0) or (substringof('T-', IdTerreno/Title))) and (IdTarea/Desactivable eq 0))")
                    .select('IdTarea/TxtVentana', 'IdTerreno/ID', 'IdTerreno/Title', 'IdTerreno/NombredelTerreno2')
                    .expand('IdTarea', 'IdTerreno')
                    .top(1000)
                    .get();

                terrenos = [...new Set(actividades.map(x => (x.IdTerreno !== undefined ? x.IdTerreno.Title : '')))]

                datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
                    .filter("(ProyectoInversionId eq " + idProyecto + ") and ((TerrenoId eq " + idTerreno + ") or (TerrenoId eq null) or (substringof('T-', TerrenoId/Title)))")
                    .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Terreno/Title', 'Terreno/NombredelTerreno2',
                        'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/Orden', 'Tarea/OrdenEG', 'Tarea/Checkable',
                        'Tarea/ExisteEnGantt', 'Tarea/EsCluster', 'Tarea/EsSubcluster', 'Tarea/Subcluster', 'AsignadoA/ID', 'AsignadoA/Title',
                        'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId', 'EstatusId',
                        'OrdenEG', 'NombreActividad', 'IdRCDTT/ID', 'IdRCDTT/Title', 'IdRCDTT/TituloInternoDelCampo',
                        'IdRCDTT/IdRTD', 'IdRCDTT/IdTramite', 'IdFPTId')
                    .expand('ProyectoInversion', 'Terreno', 'Tarea', 'AsignadoA', 'GrupoResponsable', 'IdRCDTT')
                    .orderBy('OrdenEG', true)
                    .top(1000)
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

            result = result.filter(x => x.cluster !== undefined && x.cluster.TxtCluster !== 'Dummy')
            const rootweb = await sp.web.getParentWeb();
            let websCdV = await rootweb.web.webs();
            let webBitacoras = websCdV[2];
            webBitacoras = await sp.site.openWebById(webBitacoras.Id);

            bitacorasInfo = await webBitacoras.web.lists.getByTitle('Incidencia').items
                .filter("(BitacoraInc/TerrenoBit eq '" + proyectoTitulo + "') or (BitacoraInc/TerrenoBit eq '" + terrenoTitulo + "')")
                .select('ID', 'Title', 'EdoInc', 'MotivoCausaInc/Title', 'BitacoraInc/ID', 'BitacoraInc/Title', 'BitacoraInc/TerrenoBit',
                    'AreaAsignadaInc/NombreCorto', 'AsignadoAInc/Title')
                .expand('MotivoCausaInc', 'BitacoraInc', 'AreaAsignadaInc', 'AsignadoAInc')
                .top(100)
                .get();

            solucionInfo = await webBitacoras.web.lists.getByTitle('Solucion').items
                .select('ID', 'FechaCompSol', 'IncidenciaSol/ID')
                .expand('IncidenciaSol')
                .get();

            result = result.filter(x => x.cluster !== undefined && x.cluster.TxtCluster !== 'Dummy')

            //let d =util.generarArregloEG(result, datos)
            this.setState({
                cargado: true, datosOriginalVentanaEG: datosEG, datosVentanaEG: datosEG, clustersVentana: result,
                totalAdmin: ventanas[0].Administración.length, totalNorm: ventanas[0].Normativo.length,
                totalProy: ventanas[0].Proyectos.length, idVentanaAnterior: this.state.idVentanaSeleccionada,
                terrenos: terrenos, terrenoTitulo: terrenoTitulo, backdrop: { cargado: true, mensaje: '' }, bitacorasInfo: bitacorasInfo,
                solucionInfo: solucionInfo
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

    obtenerDatosTramite = async (idFlujoTareas) => {
        const datosFPT = await sp.web.lists.getByTitle('Fechas paquete de trámites').items
            .filter('IdFlujoId eq ' + idFlujoTareas)
            .get()
        return datosFPT
    }

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
        let Mkt = [];

        if (tipoRFS === '' || tipoRFS === 'TF') {
            switch (idVentanaSeleccionada) {
                case 4:
                    //#region
                    if (name !== '' && style !== '') { util.styleLinkGen(name, style) }
                    let datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
                        .filter('(ProyectoInversionId eq ' + idProyecto + ') or (TerrenoId eq ' + (nuevoTerreno !== '' ? nuevoTerreno.Id : idTerreno) + ')')
                        .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Terreno/Title', 'Terreno/NombredelTerreno2',
                            'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/Orden', 'Tarea/OrdenEG', 'Tarea/Checkable',
                            'Tarea/ExisteEnGantt', 'Tarea/EsCluster', 'Tarea/EsSubcluster', 'AsignadoA/ID', 'AsignadoA/Title',
                            'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId', 'EstatusId',
                            'OrdenEG', 'NombreActividad', 'IdRCDTT/ID', 'IdRCDTT/Title', 'IdRCDTT/TituloInternoDelCampo',
                            'IdRCDTT/IdRTD', 'IdRCDTT/IdTramite', 'IdFPTId')
                        .expand('ProyectoInversion', 'Terreno', 'Tarea', 'AsignadoA', 'GrupoResponsable', 'IdRCDTT')
                        .orderBy('OrdenEG', true)
                        .top(1000)
                        .get();

                    let datosEG = util.inicializarArregloDatos(4, datos)
                    datosEG.datos = datos;
                    result = Array.from(new Set(datosEG.datos.map(s => s.Tarea.TxtCluster)))
                        .map(currentCluster => {
                            return {
                                cluster: datosEG.datos.find(s => s.Tarea.TxtCluster === currentCluster).Tarea
                            };
                        });

                    result = result.filter(x => x.cluster !== undefined && x.cluster.TxtCluster !== 'Dummy')
                    //let d =util.generarArregloEG(result, datosEG)
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
                    if (name !== '' && style !== '') { util.styleLinkGen(name, style) }
                    //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversión
                    const complemento = !terrenoTitulo.startsWith('T-') ? ' and (IdTarea/Desactivable eq 0)' : ''

                    actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                        .filter("((IdProyectoInversionId eq " + idProyecto + ") and ((IdTerrenoId eq " + idTerreno + ") or (IdTerrenoId eq null) or (IdTerrenoId eq 0) or (substringof('T-', IdTerreno/Title)))" + complemento + ")")
                        .select('ID', 'Title', 'IdProyectoInversion/ID', 'IdProyectoInversion/Title', 'IdProyectoInversion/NombreProyectoInversion',
                            'IdTerreno/ID', 'IdTerreno/Title', 'IdTerreno/NombredelTerreno2', 'Nivel/ID', 'Nivel/Title', 'IdTarea/ID', 'IdTarea/Title',
                            'IdTarea/TxtCluster', 'IdTarea/EsCluster', 'IdTarea/EsSubcluster', 'IdTarea/TxtVentana', 'IdTarea/Orden', 'IdTarea/Checkable',
                            'IdTarea/ExisteEnGantt', 'IdTarea/EsBitacora', 'Estatus/ID', 'Estatus/Title', 'GrupoResponsable/ID',
                            'GrupoResponsable/NombreCortoGantt', 'AsignadoA/ID', 'AsignadoA/Title', 'LineaBase', 'FechaEstimada', 'Favoritos/ID',
                            'Favoritos/Name', 'UrlDocumentos', 'UrlTarea', 'EstatusAnterior/ID', 'EstatusAnterior/Title', 'Orden', 'NombreActividad',
                            'Created/ID', 'Modified', 'Editor/ID', 'Editor/Title', 'LineaBaseModifico/ID', 'LineaBaseModifico/Title',
                            'IdTarea/Subcluster', 'IdTarea/AbrirLink', 'OcultoA/ID', 'OcultoA/Title')
                        .expand('IdProyectoInversion', 'IdTerreno', 'Nivel', 'IdTarea', 'Estatus', 'EstatusAnterior', 'GrupoResponsable',
                            'AsignadoA', 'Favoritos', 'Editor', 'LineaBaseModifico', 'OcultoA')
                        .orderBy('Orden', true)
                        .top(1000)
                        .get()

                    let datosFPT = await util.generarConsultaFPT(actividades)
                    datosFPT = util.establacerDatoLista('Fechas paquete de trámites', datosFPT, this.props.IdProyInv)

                    var ventanas = [actividades.reduce((a, c) => (a[c.IdTarea.TxtVentana] = (a[c.IdTarea.TxtVentana] || []).concat(c), a), {})];
                    var datosActs = util.inicializarArregloDatos(0, actividades)
                    actividades = util.establacerDatoLista('Flujo Tareas', actividades, this.props.IdProyInv)
                    datosActs.datos = actividades

                    result = Array.from(new Set(datosActs.datos.map(s => s.IdTarea.TxtCluster)))
                        .map(currentCluster => {
                            return {
                                cluster: datosActs.datos.find(s => s.IdTarea.TxtCluster === currentCluster && (parseFloat(s.Orden) > parseFloat(idVentanaSeleccionada) && parseFloat(s.Orden) < parseFloat(idVentanaSeleccionada + 1)))
                            };
                        });

                    Mkt = actividades
                        .filter(x => x.IdTarea.Orden === 3.14 && x.IdTarea.Subcluster !== null)
                        .sort(function (a, b) { return a.IdTarea.ID - b.IdTarea.ID })

                    result = result.filter(x => x.cluster !== undefined && x.cluster.TxtCluster !== 'Dummy')

                    result.sort(function (a, b) {
                        if (a.cluster.Orden > b.cluster.Orden)
                            return 1;
                        if (a.cluster.Orden < b.cluster.Orden)
                            return -1;
                        return 0;
                    })
                    //let d =util.generarArregloActs('Flujo Tareas', result, datosActs)
                    this.setState({
                        idVentana: idVentanaSeleccionada, clustersVentana: result, datosVentana: datosActs, datosOriginalVentana: datosActs,
                        totalAdmin: ventanas[0].Administración.length, totalNorm: ventanas[0].Normativo.length, totalProy: ventanas[0].Proyectos.length,
                        idVentanaAnterior: idVentanaSeleccionada, AdministracionAnterior: ventanas[0].Administración.length, NormativoAnterior: ventanas[0].Normativo.length,
                        ProyectosAnterior: ventanas[0].Proyectos.length, disabled: false, backdrop: { cargado: true, mensaje: '' },
                        Gantt: false, Star: false, User: false, filtrosTabla: filtrosTabla, datosFPT: datosFPT, Mkt: Mkt
                    })
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

        await sp.web.lists.getByTitle(fila.Lista).items.getById(fila.ID).update({
            FavoritosId: val,
        }).then(() => {
            if (fila.Lista === 'Flujo Tareas') {
                const filaIndice = this.state.datosVentana.datos.findIndex(datos => datos.ID === fila.ID)
                const filaIndiceO = this.state.datosOriginalVentana.datos.findIndex(datos => datos.ID === fila.ID)
                let newData = this.state.datosVentana.datos[filaIndice]
                let newDataO = this.state.datosOriginalVentana.datos[filaIndiceO]
                newData.Favoritos = favoritos
                newDataO.Favoritos = favoritos
                let datosActualizados = util.inicializarArregloDatos(0, this.state.datosVentana.datos)
                let datosActualizadosO = util.inicializarArregloDatos(0, this.state.datosOriginalVentana.datos)
                datosActualizados.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice, 1, newData]] })
                datosActualizadosO.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[filaIndiceO, 1, newDataO]] })
                this.setState({ datosVentana: datosActualizados, datosOriginalVentana: datosActualizadosO })
                //util.onShowStar(fila, usuarioActual)
            } else {
                const filaIndice = this.state.datosFPT.findIndex(datos => datos.ID === fila.ID)
                let newData = this.state.datosFPT[filaIndice]
                newData.Favoritos = favoritos
                let datosActualizados = update(this.state.datosFPT, { $splice: [[filaIndice, 1, newData]] })
                this.setState({ datosFPT: datosActualizados })
            }
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
        if (fila.Lista === 'Flujo Tareas') {
            const filaIndice = this.state.datosVentana.datos.findIndex(datos => datos.ID === fila.ID)
            const filaIndiceO = this.state.datosOriginalVentana.datos.findIndex(datos => datos.ID === fila.ID)
            let newData = this.state.datosVentana.datos[filaIndice]
            let newDataO = this.state.datosOriginalVentana.datos[filaIndiceO]
            switch (campo) {
                case 'LineaBase':
                    await sp.web.lists.getByTitle(fila.Lista).items.getById(fila.ID).update({
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
                    await sp.web.lists.getByTitle(fila.Lista).items.getById(fila.ID).update({
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
        } else {
            const filaIndice = this.state.datosFPT.findIndex(datos => datos.ID === fila.ID)
            let newData = this.state.datosFPT[filaIndice]
            switch (campo) {
                case 'LineaBase':
                    await sp.web.lists.getByTitle(fila.Lista).items.getById(fila.ID).update({
                        LineaBase: fecha,
                        LineaBaseModificoId: usuarioActual.Id
                    }).then(() => {
                        newData.LineaBase = moment(fecha).format()
                        newData.LineaBaseModifico = usuarioActual
                    })
                    break;
                case 'FechaEstimada':
                    await sp.web.lists.getByTitle(fila.Lista).items.getById(fila.ID).update({
                        FechaEstimada: fecha,
                    }).then(() => {
                        newData.FechaEstimada = moment(fecha).format()
                    })
                    break;
                default:
                    break;
            }

            let datosActualizados = update(this.state.datosFPT, { $splice: [[filaIndice, 1, newData]] })
            this.setState({ datosFPT: datosActualizados })
        }
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
        //Filtra los elementos que hayan sido modificados
        elementos = elementos.filter(x => x.cambio)
        const guardarEG = async () => {
            this.setState({ backdrop: { cargado: false, mensaje: 'Guardando estrategia de gestión...' } })
            await util.asyncForEach(elementos, async elemento => {
                //Si no tiene ID de elemento asignado, se creará la tarea en Flujo Tareas
                if (elemento.datos.IdFlujoTareasId === null || elemento.datos.IdFlujoTareasId === 0) {
                    this.establecerContador(contadores, elemento.datos.Tarea.TxtVentana, '+')
                    const usuariosAsignados = util.obtenerIdAsignados(elemento.datos.AsignadoA)
                    let fta = 0
                    //Si el elemento checkeado es clúster o subcluster...
                    if (elemento.datos.Tarea.EsCluster === '1' || elemento.datos.Tarea.EsSubcluster === '1') {
                        fta = await sp.web.lists.getByTitle('Flujo Tareas').items
                            .filter('IdProyectoInversionId eq ' + elemento.datos.ProyectoInversion.ID +
                                ' and IdTerrenoId eq ' + elemento.datos.Terreno.ID + ' and IdTareaId eq ' +
                                elemento.datos.Tarea.ID)
                            .get()
                    }

                    if (fta.length === 0) {
                        //Crea la tarea en flujo tareas de la actividad seleccionada
                        fta = await sp.web.lists.getByTitle("Flujo Tareas").items.add({
                            IdProyectoInversionId: elemento.datos.ProyectoInversion.ID,
                            IdTareaId: elemento.datos.Tarea.ID,
                            IdTerrenoId: elemento.datos.Terreno.ID,
                            NivelId: elemento.datos.Terreno.ID === undefined ? 1 : 2,
                            GrupoResponsableId: elemento.datos.GrupoResponsable.ID,
                            AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] },
                            EstatusId: 1,
                            EstatusAnteriorId: 1,
                            Visible: true,
                            Orden: elemento.datos.Tarea.Orden
                        })
                    }

                    let fpt = 0
                    //Si el elemento checkeado es clúster o subcluster...
                    if (elemento.datos.Tarea.EsCluster === '1' || elemento.datos.Tarea.EsSubcluster === '1') {
                        //Sino tiene Id en fechas paquete de trámites, guarda la información en dicha lista
                        if (elemento.datos.IdFPTId === null) {
                            fpt = await sp.web.lists.getByTitle("Fechas paquete de trámites").items.add({
                                Title: this.state.terrenoTitulo,
                                IdDocTaskId: elemento.datos.IdRCDTT.IdRTD,
                                IdFlujoId: fta.data !== undefined ? fta.data.ID : fta[0].ID,
                                IdDocTramiteId: elemento.datos.IdRCDTT.IdTramite,
                                InternalNameFdeI: 'FdeI' + elemento.datos.IdRCDTT.TituloInternoDelCampo,
                                InternalNameFdeLaP: 'FdeP' + elemento.datos.IdRCDTT.TituloInternoDelCampo,
                                InternalNameFdeR: 'FdeR' + elemento.datos.IdRCDTT.TituloInternoDelCampo,
                                InternalNameFdeV: 'FdeV' + elemento.datos.IdRCDTT.TituloInternoDelCampo,
                                AsignadoAId: usuariosAsignados,
                                EstatusId: 1,
                                EstatusAnteriorId: 1
                            })
                        } else {
                            //Si ya tiene Id en fechas paquete de trámites, actualiza la información en dicha lista
                            await sp.web.lists.getByTitle("Fechas paquete de trámites").items.getById(elemento.datos.IdFPTId).update({
                                NoAplica: !elementos.cambio,
                                AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] }
                            })
                        }
                    }
                    //Actualiza la información de la actividad seleccionada en la lista de Estrategia de gestión.
                    //Sólo si la actividad es de tipo cluster, el estatus no cambia a Enviado
                    await sp.web.lists.getByTitle("EstrategiaGestion").items.getById(elemento.datos.ID).update({
                        Seleccionado: elemento.datos.Seleccionado,
                        IdFlujoTareasId: fta.data !== undefined ? fta.data.ID : fta[0].ID,
                        AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] },
                        EstatusId: elemento.datos.Tarea.EsCluster === '1' ? 1 : 3,
                        IdFPTId: fpt !== 0 ? fpt.data.Id : null
                    }).then(() => {
                        //Asigna el ID de elemento generado en flujo tareas al objeto en memoria del item seleccionado
                        //en la vetana de la EG
                        const indice = this.state.datosVentanaEG.datos.findIndex((obj => obj.ID === elemento.datos.ID))
                        let newData = this.state.datosVentanaEG.datos[indice]
                        newData.Seleccionado = elemento.datos.Seleccionado
                        newData.IdFlujoTareasId = fta.data !== undefined ? fta.data.ID : fta[0].ID
                        newData.AsignadoAId = elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] }
                        newData.EstatusId = elemento.datos.Tarea.EsCluster === '1' ? 1 : 3
                        newData.IdFPTId = fpt !== 0 ? fpt.data.Id : null

                        let datosActualizados = util.inicializarArregloDatos(this.state.idVentana, this.state.datosVentanaEG.datos)
                        datosActualizados.datos = update(this.state.datosVentanaEG.datos, { $splice: [[indice, 1, newData]] })
                        this.setState({
                            totalAdmin: this.state.totalAdmin + contadores.admin, totalNorm: this.state.totalNorm + contadores.norm,
                            totalProy: this.state.totalProy + contadores.proy, datosVentanaEG: datosActualizados
                        })

                        /*const indice = checkedItems.findIndex((obj => obj.datos.ID === elemento.datos.ID))
                        if (indice !== -1) {
                            checkedItems[indice].datos.IdFlujoTareasId = fta.data !== undefined ? fta.data.ID : fta[0].ID
                            checkedItems[indice].datos.IdFPTId = fpt.data.Id
                        }
                        this.setState({ totalAdmin: this.state.totalAdmin + contadores.admin, totalNorm: this.state.totalNorm + contadores.norm, totalProy: this.state.totalProy + contadores.proy })*/
                    });
                } else {
                    //Si ya tiene ID de elemento asignado, se actualizará la tarea en flujo tareas
                    const usuariosAsignados = util.obtenerIdAsignados(elemento.datos.AsignadoA)
                    this.establecerContador(contadores, elemento.datos.Tarea.TxtVentana, elemento.datos.Seleccionado ? '+' : '-')
                    await sp.web.lists.getByTitle("Flujo Tareas").items.getById(elemento.datos.IdFlujoTareasId).update({
                        AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] },
                        Visible: elemento.datos.Seleccionado
                    }).then(async u => {
                        //Establece como seleccionado en la lista de EG
                        await sp.web.lists.getByTitle("EstrategiaGestion").items.getById(elemento.datos.ID).update({
                            AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] },
                            Seleccionado: elemento.datos.Seleccionado
                        })
                            .then(async () => {
                                //Si la actividad de es tipo cluster, actualiza los datos
                                if (elemento.datos.Tarea.EsCluster === '1' || elemento.datos.Tarea.EsSubcluster === '1') {
                                    await sp.web.lists.getByTitle("Fechas paquete de trámites").items.getById(elemento.datos.IdFPTId).update({
                                        NoAplica: !elemento.cambio,
                                        AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] }
                                    })
                                }
                                const indice = this.state.datosVentanaEG.datos.findIndex((obj => obj.ID === elemento.datos.ID))
                                let newData = this.state.datosVentanaEG.datos[indice]
                                newData.Seleccionado = elemento.datos.Seleccionado
                                newData.AsignadoAId = elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] }

                                let datosActualizados = util.inicializarArregloDatos(this.state.idVentana, this.state.datosVentanaEG.datos)
                                datosActualizados.datos = update(this.state.datosVentanaEG.datos, { $splice: [[indice, 1, newData]] })
                                this.setState({
                                    totalAdmin: this.state.totalAdmin + contadores.admin, totalNorm: this.state.totalNorm + contadores.norm,
                                    totalProy: this.state.totalProy + contadores.proy, datosVentanaEG: datosActualizados
                                })
                            })
                    });
                }
            });
            alert('Datos guardados correctamente')
            this.setState({ backdrop: { cargado: true, mensaje: '' } })
        }
        guardarEG();
    }

    //#region Métodos de ciclo de vida
    async componentWillMount() {
        util.styleLinkGen("genericoEG.css", "../estilos/genericoEG.css")

        webUrl = await sp.web()
        webCdT = webUrl.Url
        webUrl = webUrl.Url.replace('/CompraDeTerreno', '')
        webUrlBit = webCdT.replace('CompraDeTerreno', '')

        //Obtiene los datos del usuario actual
        usuarioActual = await sp.web.currentUser.get();
        //Obtiene los grupos en los que está registrado el usuario actual en la lista de GanttPersonColab
        /*gruposUsuarioActual = await sp.web.lists.getByTitle('GanttPersonColab').items
            .filter('AdminAreaGanttId eq ' + usuarioActual.Id + ' or RespAreaGanttId eq ' + usuarioActual.Id)
            .get()*/

        gruposUsuarioActual = await sp.web.lists.getByTitle('GanttPersonColab').items
            .filter('AdminAreaGanttId eq 16 or RespAreaGanttId eq 16')
            .get()

        this.cargarDatosIniciales(this.props.rfs, this.props.idProyecto, this.props.idTerreno, this.props.TerrenoId, '', this.props.IdProyInv)
    }

    //#endregion
    obtenerAsignados = campo => {
        var usuarios = campo.map((registro) => {
            return (registro.Title)
        })
        return usuarios
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

                newData.AsignadoA = arregloDatos.dato.usuarioAsignados
                newDataO.AsignadoA = arregloDatos.dato.usuarioAsignados
                let datosActualizados = util.inicializarArregloDatos(4, this.state.datosVentanaEG.datos)
                let datosActualizadosO = util.inicializarArregloDatos(4, this.state.datosOriginalVentanaEG.datos)
                datosActualizados.datos = update(this.state.datosVentanaEG.datos, { $splice: [[filaEGIndice, 1, newData]] })
                datosActualizadosO.datos = update(this.state.datosOriginalVentanaEG.datos, { $splice: [[filaEGIndiceO, 1, newDataO]] })
                this.setState({ datosVentanaEG: datosActualizados, datosOriginalVentanaEG: datosActualizadosO })

            } else {
                //Si el evento viene desde un modal que sí­ es tarea
                switch (arregloDatos.tarea) {
                    case 24:
                        //#region
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
                                            if (nuevaTarea.EsCluster === '0' || nuevaTarea.EsBitacora === '1') {
                                                //Crea el elemento en la lista de Flujo Tareas 
                                                tareaEG = await sp.web.lists.getByTitle("Flujo Tareas").items.add({
                                                    IdProyectoInversionId: terrenoPI.IdProyectoInversionId,
                                                    IdTareaId: nuevaTarea.ID,
                                                    NivelId: 2,
                                                    IdTerrenoId: terrenoPI.Id,
                                                    GrupoResponsableId: nuevaTarea.GrupoId,
                                                    EstatusId: 1,
                                                    EstatusAnteriorId: 1,
                                                    Visible: true,
                                                    Orden: nuevaTarea.Orden
                                                })
                                                    .catch(error => {
                                                        alert('Error al generar la tarea de EG en flujo tareas: ' + error)
                                                    })
                                            }
                                        }
                                        if (nuevaTarea.EnEG) {
                                            //Si la actividad a crear no es clúster, la crea normalmente
                                            if (nuevaTarea.EsCluster === '0') {
                                                //Crea el elemento en la estrategia de gestión del terreno resultante actual
                                                await sp.web.lists.getByTitle("EstrategiaGestion").items.add({
                                                    ProyectoInversionId: terrenoPI.IdProyectoInversionId,
                                                    TerrenoId: terrenoPI.ID,
                                                    TareaId: nuevaTarea.ID,
                                                    GrupoResponsableId: nuevaTarea.GrupoId,
                                                    Seleccionado: false,
                                                    IdFlujoTareasId: tareaEG.data !== undefined ? tareaEG.data.ID : tareaEG,
                                                    EstatusId: 1,
                                                    OrdenEG: nuevaTarea.OrdenEG
                                                })
                                                    .catch(error => {
                                                        alert('Error al generar la EG: ' + error)
                                                    })
                                            } else {
                                                //Si la actividad a crear sí es clúster o subclúster, obtiene los campos y asigna su id de relación a cada nueva actividad
                                                const tareasTramites = await sp.web.lists.getByTitle("Relación campos documentos trámites tareas").items.filter("TareaId eq " + nuevaTarea.ID).select('ID').get()
                                                let existeNodo = false
                                                await util.asyncForEach(tareasTramites, async tareaTramite => {
                                                    //Crea el elemento en la estrategia de gestión del terreno resultante actual
                                                    //Si la tarea a crear es subcluster y aún no se ha creado la tarea nodo...
                                                    if (nuevaTarea.EsSubcluster === '1' && !existeNodo) {
                                                        await sp.web.lists.getByTitle("EstrategiaGestion").items.add({
                                                            ProyectoInversionId: terrenoPI.IdProyectoInversionId,
                                                            TerrenoId: terrenoPI.ID,
                                                            TareaId: nuevaTarea.ID,
                                                            GrupoResponsableId: nuevaTarea.GrupoId,
                                                            Seleccionado: false,
                                                            EstatusId: 1,
                                                            OrdenEG: nuevaTarea.OrdenEG
                                                        })
                                                            .catch(error => {
                                                                alert('Error al generar el trámite nodo en la EG: ' + error)
                                                            })
                                                        existeNodo = true
                                                    }
                                                    await sp.web.lists.getByTitle("EstrategiaGestion").items.add({
                                                        ProyectoInversionId: terrenoPI.IdProyectoInversionId,
                                                        TerrenoId: terrenoPI.ID,
                                                        TareaId: nuevaTarea.ID,
                                                        GrupoResponsableId: nuevaTarea.GrupoId,
                                                        Seleccionado: false,
                                                        EstatusId: 1,
                                                        OrdenEG: nuevaTarea.OrdenEG,
                                                        IdRCDTTId: tareaTramite.ID
                                                    })
                                                        .catch(error => {
                                                            alert('Error al generar el trámite en la EG: ' + error)
                                                        })
                                                })
                                            }
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
                        //#endregion
                        break;
                    case 25:
                    case 30:
                    case 35:
                        //#region
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
                                            EstatusId: 3,
                                            EstatusAnteriorId: 3
                                        })
                                            .catch(error => {
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
                            })
                                .then(async () => {
                                    //Establece la tarea como Enviada
                                    await sp.web.lists.getByTitle("Flujo Tareas").items.getById(arregloDatos.dato.idFlujoTareas).update({
                                        EstatusId: 3,
                                        EstatusAnteriorId: 3
                                    })
                                        .then(async () => {
                                            //Establece el empadronamiento a los terrenos seleccionados en la tarea
                                            //para que se consideren como TERRENOS NO VIVOS
                                            await util.asyncForEach(arregloDatos.dato.terrenos, async (terrenoActual) => {
                                                await sp.web.lists.getByTitle("Terrenos").items.getById(terrenoActual.ID).update({
                                                    Empadronamiento: 'Sí'
                                                })
                                                    .catch(error => {
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
                                                })
                                                    .then(async () => {
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
                                                        })
                                                            .then(async (terr) => {
                                                                const nuevasTareasEG = await sp.web.lists.getByTitle("Tareas").items.filter("((DetonacionInicial eq 0) and (MACO eq 'X' or MACO eq '" + arregloDatos.dato.tipo + "' or MACO eq '" + terrenoResultante.MACO + "'))").get();

                                                                const generarEG = async () => {
                                                                    await util.asyncForEach(nuevasTareasEG, async nuevaTarea => {
                                                                        let tareaEG = 0
                                                                        if (nuevaTarea.MACO === arregloDatos.dato.tipo || (nuevaTarea.OrdenEG === null && nuevaTarea.ID !== 244)) {
                                                                            if (nuevaTarea.EsCluster === '0' || nuevaTarea.EsBitacora === '1') {
                                                                                //Crea el elemento en la lista de Flujo Tareas
                                                                                tareaEG = await sp.web.lists.getByTitle("Flujo Tareas").items.add({
                                                                                    IdProyectoInversionId: idProyecto,
                                                                                    IdTareaId: nuevaTarea.ID,
                                                                                    NivelId: 2,
                                                                                    IdTerrenoId: terr.data.Id,
                                                                                    GrupoResponsableId: nuevaTarea.GrupoId,
                                                                                    EstatusId: 1,
                                                                                    EstatusAnteriorId: 3,
                                                                                    Visible: true,
                                                                                    Orden: nuevaTarea.Orden
                                                                                })
                                                                                    .catch(error => {
                                                                                        alert('Error al generar la tarea de EG en flujo tareas: ' + error)
                                                                                    })
                                                                            }
                                                                        }
                                                                        if (nuevaTarea.EnEG) {
                                                                            if (nuevaTarea.EsCluster === '0') {
                                                                                //Crea el elemento en la estrategia de gestión del terreno resultante actual
                                                                                await sp.web.lists.getByTitle("EstrategiaGestion").items.add({
                                                                                    ProyectoInversionId: idProyecto,
                                                                                    TerrenoId: terr.data.Id,
                                                                                    TareaId: nuevaTarea.ID,
                                                                                    GrupoResponsableId: nuevaTarea.GrupoId,
                                                                                    Seleccionado: false,
                                                                                    IdFlujoTareasId: tareaEG.data !== undefined ? tareaEG.data.ID : tareaEG,
                                                                                    EstatusId: 1,
                                                                                    OrdenEG: nuevaTarea.OrdenEG
                                                                                })
                                                                                    .catch(error => {
                                                                                        alert('Error al generar la EG: ' + error)
                                                                                    })
                                                                            } else {
                                                                                //Si la actividad a crear sí es clúster o subclúster, obtiene los campos y asigna su id de relación a cada nueva actividad
                                                                                const tareasTramites = await sp.web.lists.getByTitle("Relación campos documentos trámites tareas").items.filter("TareaId eq " + nuevaTarea.ID).select('ID').get()
                                                                                await util.asyncForEach(tareasTramites, async tareaTramite => {
                                                                                    //Crea el elemento en la estrategia de gestión del terreno resultante actual
                                                                                    await sp.web.lists.getByTitle("EstrategiaGestion").items.add({
                                                                                        ProyectoInversionId: idProyecto,
                                                                                        TerrenoId: terr.data.Id,
                                                                                        TareaId: nuevaTarea.ID,
                                                                                        GrupoResponsableId: nuevaTarea.GrupoId,
                                                                                        Seleccionado: false,
                                                                                        EstatusId: 1,
                                                                                        OrdenEG: nuevaTarea.OrdenEG,
                                                                                        IdRCDTTId: tareaTramite.ID
                                                                                    })
                                                                                        .catch(error => {
                                                                                            alert('Error al generar el trámite en la EG: ' + error)
                                                                                        })
                                                                                })
                                                                            }
                                                                        }
                                                                    });
                                                                    if (terrenosGenerados === arregloDatos.dato.terrenosResultantes.length) {
                                                                        this.cargarDatosIniciales(true, idProyecto, terr.data.Id, terr.data.Title, arregloDatos.dato.tipo)
                                                                    } else {
                                                                        terrenosGenerados += 1
                                                                    }
                                                                }
                                                                generarEG();
                                                            })
                                                            .catch(error => {
                                                                alert('Error al crear el terreno resultante: ' + error)
                                                            })
                                                    })
                                                    .catch(error => {
                                                        alert('Error al guardar en Terrenos versionado: ' + error)
                                                    })
                                            });
                                        })
                                        .catch(error => {
                                            alert('Error al guardar en Flujo Tareas: ' + error)
                                        })
                                })
                                .catch(error => {
                                    alert('Error al guardar en RFS: ' + error)
                                })
                        })
                        //#endregion
                        break;
                    case 271:
                        this.onCambiarVentana(4, 'Cargando contenido generado...', "", "", "", '')
                        break;
                    default:
                        break;
                }
            }
            //#endregion
        } else {
            //#region Otras ventanas
            if (arregloDatos.tarea === 0) {
                //Asignado A
                //Si la ventana donde sucede el evento es Normativo, Proyectos o Administración
                const usuariosAsignados = util.obtenerIdAsignados(arregloDatos.dato.usuarioAsignados)
                const filaSeleccionada = this.state.modal.filaSeleccionada
                const idElemento = filaSeleccionada.ID

                await sp.web.lists.getByTitle(arregloDatos.dato.lista).items.getById(idElemento).update({
                    AsignadoAId: usuariosAsignados
                }).then(async () => {
                    const filtroEG = arregloDatos.dato.lista === 'Flujo Tareas' ? (filaSeleccionada.Nivel.ID === 1 ?
                        'ProyectoInversionId eq ' + filaSeleccionada.IdProyectoInversion.ID + ' and TareaId eq ' + filaSeleccionada.IdTarea.ID
                        : 'ProyectoInversionId eq ' + filaSeleccionada.IdProyectoInversion.ID + ' and TerrenoId eq ' + filaSeleccionada.IdTerreno.ID + ' and TareaId eq ' + filaSeleccionada.IdTarea.ID)
                        : 'IdFPTId eq ' + filaSeleccionada.ID
                    const itemEG = await sp.web.lists.getByTitle("EstrategiaGestion").items.filter(filtroEG).get()
                    if (itemEG.length > 0) {
                        await sp.web.lists.getByTitle("EstrategiaGestion").items.getById(itemEG[0].Id).update({
                            AsignadoAId: usuariosAsignados
                        })
                    }

                    if (arregloDatos.dato.lista === 'Flujo Tareas') {
                        const filaIndice = this.state.datosVentana.datos.findIndex(datos => datos.ID === idElemento)
                        const filaIndiceO = this.state.datosOriginalVentana.datos.findIndex(datos => datos.ID === idElemento)
                        let newData = this.state.datosVentana.datos[filaIndice]
                        let newDataO = this.state.datosOriginalVentana.datos[filaIndiceO]
                        newData.AsignadoA = arregloDatos.dato.usuarioAsignados
                        newDataO.AsignadoA = arregloDatos.dato.usuarioAsignados

                        let datosActualizados = util.inicializarArregloDatos(0, this.state.datosVentana.datos)
                        let datosActualizadosO = util.inicializarArregloDatos(0, this.state.datosOriginalVentana.datos)

                        datosActualizados.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice, 1, newData]] })
                        datosActualizadosO.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[filaIndiceO, 1, newDataO]] })
                        this.setState({ datosVentana: datosActualizados, datosOriginalVentana: datosActualizadosO })
                    } else {
                        const filaIndice = this.state.datosFPT.findIndex(datos => datos.ID === idElemento)
                        let newData = this.state.datosFPT[filaIndice]
                        newData.AsignadoA = arregloDatos.dato.usuarioAsignados

                        let datosActualizados = update(this.state.datosFPT, { $splice: [[filaIndice, 1, newData]] })
                        this.setState({ datosFPT: datosActualizados })
                    }
                }).catch(error => {
                    alert('Error al actualizar Flujo Tareas: ' + error)
                })
            } else if (arregloDatos.tarea === 271) {
                //Actividad ficticia
                this.onCambiarVentana(idVentana, 'Cargando contenido generado...', "", "", "", '')
            } else if (arregloDatos.tarea === 272) {
                if (arregloDatos.dato.lista === 'Flujo Tareas') {
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
                } else {
                    const filaIndice = this.state.datosFPT.findIndex(datos => datos.ID === arregloDatos.dato.idElemento)
                    let newData = this.state.datosFPT[filaIndice]
                    newData.Estatus = arregloDatos.dato.estatus

                    let datosActualizados = update(this.state.datosFPT, { $splice: [[filaIndice, 1, newData]] })
                    this.setState({ datosFPT: datosActualizados })
                }
            } else if (arregloDatos.tarea === 289) {
                //Edición de clúster de Marketing
                let datosActualizados
                let datosActualizadosO
                let datosActualizadosMkt
                const datosActualizar = arregloDatos.dato.datos.filter(x => x.Cambio)

                datosActualizar.forEach(dato => {
                    const filaIndice = this.state.datosVentana.datos.findIndex(datos => datos.ID === dato.ID)
                    const filaIndiceO = this.state.datosOriginalVentana.datos.findIndex(datos => datos.ID === dato.ID)
                    const filaIndiceMkt = this.state.Mkt.findIndex(datos => datos.ID === dato.ID)

                    let newData = this.state.datosVentana.datos[filaIndice]
                    let newDataO = this.state.datosOriginalVentana.datos[filaIndiceO]
                    let newDataMkt = this.state.Mkt[filaIndiceMkt]
                    newData.OcultoA = dato.OcultoA
                    newDataO.OcultoA = dato.OcultoA
                    newDataMkt.OcultoA = dato.OcultoA

                    datosActualizados = util.inicializarArregloDatos(0, this.state.datosVentana.datos)
                    datosActualizadosO = util.inicializarArregloDatos(0, this.state.datosOriginalVentana.datos)

                    datosActualizados.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice, 1, newData]] })
                    datosActualizadosO.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[filaIndiceO, 1, newDataO]] })
                    datosActualizadosMkt = update(this.state.Mkt, { $splice: [[filaIndiceMkt, 1, newDataMkt]] })
                })
                this.setState({ datosVentana: datosActualizados, datosOriginalVentana: datosActualizadosO, Mkt: datosActualizadosMkt })
            }
            //#endregion
        }
    }

    muiNormalEG = (fila, props, Columna, nombreTerreno, plus_icon, assignedTo_icon) => {
        return (
            <div className="item row" >
                <Columna titulo={fila.Tarea.ID + ': ' + (fila.Tarea.ID === 271 ? fila.NombreActividad : (fila.Tarea.EsCluster == '0' ? fila.Tarea.Title : (fila.IdRCDTT !== undefined ? fila.IdRCDTT.Title : fila.Tarea.Title)))} estilo='col-sm-5'
                    editable={fila.Tarea.ID === 271 ? true : (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35 && fila.Tarea.ID !== 271) ? false : true)}
                    idElemento={fila.Tarea.ID === 271 ? fila.Tarea.ID : (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? fila.Tarea.ID : fila.IdFlujoTareasId)}
                    esTarea={fila.Tarea.ID === 271 ? false : (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? false : true)}
                    terreno={nombreTerreno}
                    datos={fila.Tarea.ID === 271 ? fila : (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? null : fila)} />
                <Columna titulo={<p style={{ paddingLeft: "27px" }}>{fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'}</p>} estilo='col-sm-2' editable={false} />
                <Columna titulo={<p style={{ textAlign: "center" }}><img title={fila.AsignadoA === undefined ? 'Sin asignar' : (fila.AsignadoA.length > 0 ? this.obtenerAsignados(fila.AsignadoA) : 'Sin asignar')} src={fila.AsignadoA === undefined ? plus_icon : (fila.AsignadoA.length > 0 ? assignedTo_icon : plus_icon)} alt='assignedTo_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila, 4, "lg", "550px") }} /></p>} estilo='col-sm-2' editable={false} />
                <Columna estilo='col-sm-2' />
            </div>
        )
    }

    muiInnEG = (fila, props, Columna, nombreTerreno, plus_icon, assignedTo_icon) => {
        return (
            <div className="itemIn row" >
                <Columna titulo={fila.Tarea.ID + ': ' + (fila.Tarea.ID !== 271 ? fila.IdRCDTT.Title : fila.NombreActividad)} estilo='col-sm-5'
                    editable={fila.Tarea.ID === 271 ? true : (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35 && fila.Tarea.ID !== 271) ? false : true)}
                    idElemento={fila.Tarea.ID === 271 ? fila.Tarea.ID : (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? fila.Tarea.ID : fila.IdFlujoTareasId)}
                    esTarea={fila.Tarea.ID === 271 ? false : (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? false : true)}
                    terreno={nombreTerreno}
                    datos={fila.Tarea.ID === 271 ? fila : (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? null : fila)} />
                <Columna titulo={<p style={{ paddingLeft: "27px" }}>{fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'}</p>} estilo='col-sm-2' editable={false} />
                <Columna titulo={<p style={{ textAlign: "center" }}><img title={fila.AsignadoA === undefined ? 'Sin asignar' : (fila.AsignadoA.length > 0 ? this.obtenerAsignados(fila.AsignadoA) : 'Sin asignar')} src={fila.AsignadoA === undefined ? plus_icon : (fila.AsignadoA.length > 0 ? assignedTo_icon : plus_icon)} alt='assignedTo_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila, 4, "lg", "550px") }} /></p>} estilo='col-sm-2' editable={false} />
                <Columna estilo='col-sm-2' />
            </div>
        )
    }

    muiNormal = (fila, attach_icon, more_details_icon, usuarioActual, webUrl, urlDescargarDocto, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es) => {
        return (
            <div className="item row" >
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={es}>
                    <Columna titulo={<p>{fila.IdTarea.ID + ': ' + (fila.IdTarea.ID !== 271 ? fila.IdTarea.Title : fila.NombreActividad)}</p>} id={fila.ID} estilo='col-sm-4' editable={true} idElemento={fila.IdTarea.ID !== 271 ? fila.ID : fila.IdTarea.ID} esTarea={true} terreno={nombreTerreno} datos={fila} />
                    <Columna titulo={<p style={{ textAlign: "center" }}>{fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'}</p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img title={fila.AsignadoA === undefined ? 'Sin asignar' : (fila.AsignadoA.length > 0 ? this.obtenerAsignados(fila.AsignadoA) : 'Sin asignar')} src={fila.AsignadoA === undefined ? plus_icon : (fila.AsignadoA.length > 0 ? assignedTo_icon : plus_icon)} alt='assignedTo_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila, this.state.idVentana, "lg", "550px") }} /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "right", paddingLeft: "30px" }}><DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={fila.LineaBase} onChange={fecha => this.onSeleccionarFecha(fecha, fila, 'LineaBase')} /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "right", paddingLeft: "30px" }}>{<DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={fila.FechaEstimada} onChange={fecha => this.onSeleccionarFecha(fecha, fila, 'FechaEstimada')} />}</p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<span style={{ textAlign: "right", paddingLeft: "37px" }} className={fila.Estatus.Title.toLowerCase().replace(' ', '-') + ' badge badge-pill'}>{fila.Estatus.Title}</span>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={attach_icon} alt='attach_icon' onClick={() => window.open(webUrl + urlDescargarDocto)} title='Descargar archivos' /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={more_details_icon !== null ? <p style={{ textAlign: "center" }}><img src={more_details_icon} alt='more_details_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 272, false, null, null, { Tarea: { ID: 272 }, info: fila }, this.state.idVentana, "lg", "550px") }} /></p> : null} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={util.onShowStar(fila, usuarioActual)} alt='favoritos_icon' onClick={(e) => { this.onEstablecerFavorito(fila) }} /></p>} estilo='col-sm-1' editable={false} />
                </MuiPickersUtilsProvider>
            </div>
        )
    }

    mui273274 = (fila, num, attach_icon, more_details_icon, usuarioActual, webUrl, urlDescargarDocto, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, date, urlIncident) => {
        return (
            <div className="itemIn row" >
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={es}>
                    <Columna titulo={<p>{num.Title + ': ' + num.BitacoraInc.Title}</p>} estilo='col-sm-4' />
                    <Columna titulo={<p style={{ textAlign: "left" }}>{num.AreaAsignadaInc !== undefined ? num.AreaAsignadaInc.NombreCorto : 'Sin asignar'}</p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p><img title={num.AsignadoAInc === undefined ? 'Sin asignar' : (num.AsignadoAInc.length > 0 ? this.obtenerAsignados(num.AsignadoAInc) : 'Sin asignar')} src={num.AsignadoAInc === undefined ? plus_icon : (num.AsignadoAInc.length > 0 ? assignedTo_icon : plus_icon)} alt='assignedTo_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 270, false, 'AsignadoA', num.AsignadoAInc !== undefined ? num.AsignadoAInc : [], fila, this.state.idVentana, "lg", "550px") }} /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={fila.LineaBase} onChange={fecha => this.onSeleccionarFecha(fecha, fila, 'LineaBase')} />} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={date} onChange={fecha => this.onSeleccionarFecha(fecha, fila, 'FechaEstimada')} />} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<span style={{ textAlign: "left" }} className={num.EdoInc.toLowerCase().replace(' ', '-') + ' badge badge-pill'}>{num.EdoInc}</span>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "left" }}><img src={hyperlink_icon} alt='hyperlink_icon' onClick={() => window.open(urlIncident, "_blank")} title='Ir a la incidencia' /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "left" }}><img src={more_details_icon} alt='more_details_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 272, false, null, null, { Tarea: { ID: 272 }, info: fila }, this.state.idVentana, "lg", "550px") }} /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "left" }}><img src={util.onShowStar(fila, usuarioActual)} alt='favoritos_icon' onClick={(e) => { this.onEstablecerFavorito(fila) }} /></p>} estilo='col-sm-1' editable={false} />
                </MuiPickersUtilsProvider>
            </div>
        )
    }

    mui287288 = (dato, attach_icon, more_details_icon, usuarioActual, webUrl, urlDescargarDocto, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es) => {
        return (
            <div className="itemIn row" >
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={es}>
                    <Columna titulo={dato.IdTarea.ID + ': ' + (dato.IdTarea.ID !== 271 ? dato.IdTarea.Title : dato.NombreActividad)} estilo='col-sm-4' editable={true} idElemento={dato.IdTarea.ID !== 271 ? dato.ID : dato.IdTarea.ID} esTarea={true} terreno={nombreTerreno} datos={dato} />
                    <Columna titulo={<p style={{ textAlign: "left" }}>{dato.GrupoResponsable !== undefined ? dato.GrupoResponsable.NombreCortoGantt : 'Sin asignar'}</p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "left" }}><img title={dato.AsignadoA === undefined ? 'Sin asignar' : (dato.AsignadoA.length > 0 ? this.obtenerAsignados(dato.AsignadoA) : 'Sin asignar')} src={dato.AsignadoA === undefined ? plus_icon : (dato.AsignadoA.length > 0 ? assignedTo_icon : plus_icon)} alt='assignedTo_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 270, false, 'AsignadoA', dato.AsignadoA !== undefined ? dato.AsignadoA : [], dato, this.state.idVentana, "lg", "550px") }} /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={dato.LineaBase} onChange={fecha => this.onSeleccionarFecha(fecha, dato, 'LineaBase')} />} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={dato.FechaEstimada} onChange={fecha => this.onSeleccionarFecha(fecha, dato, 'FechaEstimada')} />} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<span className={dato.Estatus.Title.toLowerCase().replace(' ', '-') + ' badge badge-pill'}>{dato.Estatus.Title}</span>} style={{ textAlign: "right", paddingLeft: "30px" }} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "left" }}><img src={attach_icon} alt='attach_icon' onClick={() => window.open(webUrl + urlDescargarDocto)} title='Descargar archivos' /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "left" }}><img src={more_details_icon} alt='more_details_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 272, false, null, null, { Tarea: { ID: 272 }, info: dato }, this.state.idVentana, "lg", "550px") }} /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "left" }}><img src={util.onShowStar(dato, usuarioActual)} alt='favoritos_icon' onClick={(e) => { this.onEstablecerFavorito(dato) }} /></p>} estilo='col-sm-1' editable={false} />
                </MuiPickersUtilsProvider>
            </div>
        )
    }

    muiTramites = (fila, datoFPT, attach_icon, more_details_icon, usuarioActual, webUrl, urlDescargarDocto, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es) => {
        return (
            <div className="item row" >
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={es}>
                    <Columna titulo={fila.IdTarea.ID + ': ' + (fila.IdTarea.ID !== 271 ? datoFPT.IdDocTramite.Title : fila.NombreActividad)} estilo='col-sm-4' editable={true} idElemento={fila.IdTarea.ID !== 271 ? fila.ID : datoFPT.IdFlujoId} esTarea={true} terreno={nombreTerreno} datos={datoFPT} />
                    <Columna titulo={<p style={{ textAlign: "center" }}>{fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'}</p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img title={datoFPT.AsignadoA === undefined ? 'Sin asignar' : (datoFPT.AsignadoA.length > 0 ? this.obtenerAsignados(datoFPT.AsignadoA) : 'Sin asignar')} src={datoFPT.AsignadoA === undefined ? plus_icon : (datoFPT.AsignadoA.length > 0 ? assignedTo_icon : plus_icon)} alt='assignedTo_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 270, false, 'AsignadoA', datoFPT.AsignadoA !== undefined ? datoFPT.AsignadoA : [], datoFPT, this.state.idVentana, "lg", "550px") }} /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "right", paddingLeft: "30px" }}><DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={datoFPT.LineaBase} onChange={fecha => this.onSeleccionarFecha(fecha, datoFPT, 'LineaBase')} /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "right", paddingLeft: "30px" }}><DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={datoFPT.FechaEstimada} onChange={fecha => this.onSeleccionarFecha(fecha, datoFPT, 'FechaEstimada')} /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<span style={{ textAlign: "right", paddingLeft: "37px" }} className={datoFPT.Estatus.Title.toLowerCase().replace(' ', '-') + ' badge badge-pill'}>{datoFPT.Estatus.Title}</span>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={attach_icon} alt='attach_icon' onClick={() => window.open(webUrl + urlDescargarDocto)} title='Descargar archivos' /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={more_details_icon} alt='more_details_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 272, false, null, null, { Tarea: { ID: 272 }, info: datoFPT }, this.state.idVentana, "lg", "550px") }} /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={util.onShowStar(datoFPT, usuarioActual)} alt='favoritos_icon' onClick={(e) => { this.onEstablecerFavorito(datoFPT) }} /></p>} estilo='col-sm-1' editable={false} />
                </MuiPickersUtilsProvider>
            </div>
        )
    }

    render() {
        const { idVentana, totalAdmin, totalNorm, totalProy, MACO, filtrosTabla, idTerreno, idProyecto, nombreTerreno } = this.state

        const Cluster = (props) => {
            if (props.titulos.length > 0) {
                if (props.idVentana !== 4) {
                    //Otras ventanas
                    const filaCluster = props.titulos.map((fila) => {
                        if (fila.cluster.IdTarea.TxtCluster !== 'Dummy') {
                            var valida = util.action271(fila.cluster.Orden, props.datos);
                            var idcluster = fila.cluster.ID * 0.16;
                            var id = "body" + idcluster;
                            var arrow = "expandir" + idcluster
                            var average = util.average(props, fila.cluster.IdTarea.Orden);
                            return (
                                <div key={fila.cluster.Orden} style={{ width: "98%" }}>
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
                                                {fila.cluster.IdTarea.Orden === 3.14 ?
                                                    <div className="col-sm-1" style={{ paddingLeft: "30px" }}>
                                                        <p className="numberCircle pad100"><img src={pen} alt='pen_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 289, false, null, null, { Tarea: { ID: 289 }, info: fila }, this.state.idVentana, "lg", "550px") }}></img></p>
                                                    </div> :
                                                    valida === true ?
                                                        <div className="col-sm-1" style={{ paddingLeft: "30px" }}>
                                                            <p className="numberCircle pad100"><img src={disk} alt='disk_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 289, false, null, null, { Tarea: { ID: 289 }, info: fila }, this.state.idVentana, "lg", "550px") }}></img></p>
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
                                                            <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.Orden} />
                                                        </div> :
                                                        <div id={id} style={{ display: "block", paddingLeft: "3%", width: "97%" }} >
                                                            <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.Orden} />
                                                        </div> :
                                                    <div className={id} id={id + "*"} style={{ display: "block", paddingLeft: "3%", width: "97%" }} >
                                                        <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.Orden} />
                                                    </div>
                                                }
                                                <div className='row empty-space' ></div>
                                            </div>
                                            : <div>
                                                <div key={idcluster + 1} style={{ display: "block", paddingLeft: "3%", width: "97%" }} >
                                                    <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.Orden} />
                                                </div>
                                            </div>
                                    })}
                                </div>
                            )
                        }
                    });
                    return <div style={{ bottom: 20, height: '80%', position: "fixed", overflowX: 'hidden', overflowY: 'scroll', width: '99%' }} key={0} className="row justify-content-end">{filaCluster}</div>
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
                                        <input style={{ paddingLeft: "5px", marginTop: "13px", visibility: "hidden" }} style={{ visibility: "none" }} type='checkbox' className='checkBox'></input>
                                    }
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
                    return <div style={{ bottom: 20, height: '80%', position: "fixed", overflowX: 'hidden', overflowY: 'scroll', width: '99%' }} key={0} className="row justify-content-end">
                        {filaCluster}
                        <div className='row' style={{ backgroundColor: 'white', bottom: 0, position: "fixed", width: '100%' }}>
                            <div className='col-sm-12 derecha'>
                                <input style={{ borderRadius: "10%", width: "90px", backgroundColor: "#75E7BC" }} type='button' value='OK' className='btn btn-info' onClick={() => this.onSave(checkedItems)} />
                            </div>
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
                                    <p style={{ marginTop: "30px", paddingLeft: "10px" }}>
                                        {fila.titulo}
                                    </p>
                                </div>
                            )
                        }
                    case 'E. de G. autorizada':
                        return (
                            <div key={index} className={fila.estilo} >
                                <p style={{ marginTop: "30px", textAlign: "center" }}>
                                    <img style={{ marginRight: "5px" }} id='CargaEG' src={egupload_icon} alt='egupload_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 269, false, null, null, { Tarea: { ID: 269 }, esRFS: this.props.rfs, ProyectoInversion: { id: this.state.idProyecto, title: this.state.proyectoTitulo }, Terreno: { id: this.state.idTerreno, title: this.state.terrenoTitulo } }, null, "", "115px") }}></img>
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
                                    (valor.Orden >= idVentana && valor.Orden <= idVentana + 1 ?
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
                                    (valor.Orden >= idVentana && valor.Orden <= idVentana + 1 ?
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
                    <div style={{ padding: "8px", position: 'fixed', top: '7%', width: "98%" }}>
                        <div style={{ paddingLeft: "3%", width: "97%" }}>
                            <div>
                                <div className="row" style={{ paddingLeft: "5%" }}>
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
                let datosPITerr = { idPI: 0, idTerr: 0, tipo: '', idCluster: props.idCluster, usuario: usuarioActual, grupo: gruposUsuarioActual.length > 0 ? gruposUsuarioActual[0] : '', tarea: 0 }
                let nombreTerreno = ''
                let filaBody = props.datos.map((fila) => {
                    //Si el registro de EG actual tiene terreno asignado (es decir, es nivel T)
                    if (fila.Terreno !== undefined) {
                        if (fila.Terreno.Title === props.tituloTerreno) {
                            nombreTerreno = fila.Terreno.NombredelTerreno2
                            if (fila.OrdenEG === props.idCluster) {
                                if (props.esCheckable) {
                                    //Agrega al arreglo los datos de la fila que tiene un check para que se identifique los
                                    //checks que se han marcado o desmarcado
                                    checkedItems = checkedItems.concat({ datos: fila, cambio: false })
                                }
                                if (datosPITerr.idPI === 0) {
                                    //Agrega información necesaria para las actividades personales
                                    datosPITerr.idPI = fila.ProyectoInversion.ID
                                    datosPITerr.idTerr = fila.Terreno !== undefined ? fila.Terreno.ID : 0
                                    datosPITerr.tipo = 'T'
                                    datosPITerr.tarea = fila.Tarea
                                }
                                return (
                                    <div key={fila.ID} style={{ paddingLeft: "20px", width: "98%" }}>
                                        {fila.Tarea.EsSubcluster === "1" ?
                                            fila.IdRCDTT === undefined ?
                                                <div className="row" >
                                                    {fila.Tarea.ID === 271 ? <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input> :
                                                        (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ?
                                                            <input id={props.idCluster + fila.ID} style={{ marginRight: "1%" }} type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e) => this.onSeleccionarItem(e, fila.ID)} disabled ></input> :
                                                            <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>)
                                                    }
                                                    {this.muiNormalEG(fila, props, Columna, nombreTerreno, plus_icon, assignedTo_icon)}
                                                </div> :
                                                <div key={fila.ID} style={{ paddingLeft: "50px", width: "100%" }}>
                                                    <div className="row" >
                                                        {fila.Tarea.ID === 271 ? <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input> :
                                                            (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ?
                                                                <input id={props.idCluster + fila.ID} style={{ marginRight: "1%" }} type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e) => this.onSeleccionarItem(e, fila.ID)} disabled ></input> :
                                                                <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>)
                                                        }
                                                        {this.muiInnEG(fila, props, Columna, nombreTerreno, plus_icon, assignedTo_icon)}
                                                    </div>
                                                </div> :
                                            <div className="row" >
                                                {fila.Tarea.ID === 271 ? <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input> :
                                                    (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ?
                                                        <input id={props.idCluster + fila.ID} style={{ marginRight: "1%" }} type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e) => this.onSeleccionarItem(e, fila.ID)} disabled ></input> :
                                                        <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>)
                                                }
                                                {this.muiNormalEG(fila, props, Columna, nombreTerreno, plus_icon, assignedTo_icon)}
                                            </div>
                                        }
                                    </div>
                                )
                            } else {
                                return null
                            }
                        }
                    } else {
                        //Si el registro de EG actual no tiene terreno asignado (es decir, es nivel PI)
                        if (props.tituloTerreno === '') {
                            if (fila.OrdenEG === props.idCluster) {
                                if (props.esCheckable) {
                                    //Agrega al arreglo los datos de la fila que tiene un check para que se identifique los
                                    //checks que se han marcado o desmarcado
                                    checkedItems = checkedItems.concat({ datos: fila, cambio: false })
                                }
                                if (datosPITerr.idPI === 0) {
                                    //Agrega información necesaria para las actividades personales
                                    datosPITerr.idPI = fila.ProyectoInversion.ID
                                    datosPITerr.idTerr = fila.Terreno !== undefined ? fila.Terreno.ID : 0
                                    datosPITerr.tipo = 'PI'
                                    datosPITerr.tarea = fila.Tarea
                                }
                                return (
                                    <div key={fila.ID} style={{ width: "98%" }}>
                                        {fila.Tarea.EsSubcluster === "1" ?
                                            fila.IdRCDTT === undefined ?
                                                <div className="row" >
                                                    {fila.Tarea.ID === 271 ? <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input> :
                                                        (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ?
                                                            <input id={props.idCluster + fila.ID} style={{ marginRight: "1%" }} type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e) => this.onSeleccionarItem(e, fila.ID)} disabled ></input> :
                                                            <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>)
                                                    }
                                                    {this.muiNormalEG(fila, props, Columna, nombreTerreno, plus_icon, assignedTo_icon)}
                                                </div> :
                                                <div key={fila.ID} style={{ paddingLeft: "30px", width: "100%" }}>
                                                    <div className="row" >
                                                        {fila.Tarea.ID === 271 ? <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input> :
                                                            (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ?
                                                                <input id={props.idCluster + fila.ID} style={{ marginRight: "1%" }} type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e) => this.onSeleccionarItem(e, fila.ID)} disabled ></input> :
                                                                <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>)
                                                        }
                                                        {this.muiInnEG(fila, props, Columna, nombreTerreno, plus_icon, assignedTo_icon)}
                                                    </div>
                                                </div> :
                                            <div className="row" >
                                                {fila.Tarea.ID === 271 ? <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input> :
                                                    (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ?
                                                        <input id={props.idCluster + fila.ID} style={{ marginRight: "1%" }} type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e) => this.onSeleccionarItem(e, fila.ID)} disabled ></input> :
                                                        <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>)
                                                }
                                                {this.muiNormalEG(fila, props, Columna, nombreTerreno, plus_icon, assignedTo_icon)}
                                            </div>
                                        }
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
                            <div key={filaBody.length} style={{ paddingLeft: "20px", width: "98%" }} onClick={() => { this.onAbrirModal(nombreTerreno, 271, false, null, null, { Tarea: { ID: 271 }, info: datosPITerr }, this.state.idVentana, "lg", "550px") }} >
                                <div className="row" >
                                    {<input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>}
                                    <div className="row item-personal" style={{ width: "99%", backgroundColor: "#F8F8F8" }} >
                                        +  Agregar nueva actividad personal
                                    </div>
                                </div>
                            </div>
                        </div>
                        : <div> {filaBody}
                            <div key={0} style={{ paddingLeft: "20px", width: "98%" }} onClick={() => { this.onAbrirModal(nombreTerreno, 271, false, null, null, { Tarea: { ID: 271 }, info: datosPITerr }, this.state.idVentana, "lg", "550px") }} >
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
                let datosPITerr = { idPI: 0, idTerr: 0, tipo: '', idCluster: props.idCluster, usuario: usuarioActual, grupo: gruposUsuarioActual.length > 0 ? gruposUsuarioActual[0] : '', tarea: 0 }
                let nombreTerreno = ''
                let filaBody = props.datos.map((fila) => {
                    if (fila.IdTerreno !== undefined && fila.IdTerreno !== null) {
                        if (fila.IdTerreno.Title === props.tituloTerreno) {
                            nombreTerreno = fila.IdTerreno !== undefined ? fila.IdTerreno.NombredelTerreno2 : fila.IdProyectoInversion.NombreProyectoInversion
                            if (fila.Orden === props.idCluster) {
                                if (datosPITerr.idPI === 0) {
                                    datosPITerr.idPI = fila.IdProyectoInversion.ID
                                    datosPITerr.idTerr = fila.IdTerreno !== undefined ? fila.IdTerreno.ID : 0
                                    datosPITerr.tipo = 'T'
                                    datosPITerr.tarea = fila.IdTarea
                                }
                                return (
                                    <div key={fila.ID}>
                                        {fila.IdTarea.EsCluster === '0' && fila.IdTarea.Orden !== 3.14 ?
                                            <div style={{ paddingLeft: "20px", width: "98%" }}>
                                                <div className="row" >
                                                    <input id={fila.ID} style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>
                                                    {this.muiNormal(fila, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es)}
                                                </div>
                                            </div>
                                            :
                                            (fila.IdTarea.EsCluster === '1' && fila.IdTarea.EsSubcluster === '0' ?
                                                this.state.datosFPT.map((datoFPT) => {
                                                    return datoFPT.IdFlujoId === fila.ID ?
                                                        <div style={{ paddingLeft: "20px", width: "98%" }}>
                                                            <div className="row">
                                                                <input id={fila.ID} style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>
                                                                {this.muiTramites(fila, datoFPT, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es)}
                                                            </div>
                                                        </div> : null
                                                })
                                                :
                                                (fila.IdTarea.EsCluster === '1' && fila.IdTarea.EsSubcluster === '1' && fila.IdTarea.EsBitacora === '1' ?
                                                    <>
                                                        <div style={{ paddingLeft: "20px", width: "98%" }}>
                                                            <div className="row" >
                                                                <input id={fila.ID} style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>
                                                                {this.muiNormal(fila, hyperlink_icon, null, usuarioActual, webUrl, "/sitepages/Bitacora.aspx?b=" + this.state.bitacorasInfo[0].BitacoraInc.ID, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es)}
                                                            </div>
                                                        </div>
                                                        {this.state.bitacorasInfo.map((num) => {
                                                            var thisDate = this.state.solucionInfo.filter(x => x.IncidenciaSol.ID === num.ID);
                                                            var date = thisDate != null ? thisDate[0].FechaCompSol : null;
                                                            const urlIncident = webUrlBit + "sitepages/Bitacora.aspx?b=" + num.BitacoraInc.ID + "#" + num.Title;
                                                            switch (fila.IdTarea.ID) {
                                                                case 273:
                                                                    return (num.MotivoCausaInc.Title === "Arquitectura" ?
                                                                        <div key={fila.ID} style={{ paddingLeft: "50px", width: "100%" }}>
                                                                            <div className="row" >
                                                                                <input id={fila.ID} style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>
                                                                                {this.mui273274(fila, num, hyperlink_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, date, urlIncident)}
                                                                            </div>
                                                                        </div> : null)
                                                                case 274:
                                                                    return (num.MotivoCausaInc.Title === "Ejecutivo" ?
                                                                        <div key={fila.ID} style={{ paddingLeft: "50px", width: "100%" }}>
                                                                            <div className="row" >
                                                                                <input id={fila.ID} style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>
                                                                                {this.mui273274(fila, num, hyperlink_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, date, urlIncident)}
                                                                            </div>
                                                                        </div> : null)
                                                                default:
                                                                    break;
                                                            }
                                                        })}
                                                    </>
                                                    :
                                                    (fila.IdTarea.EsCluster === '1' && fila.IdTarea.EsSubcluster === '1' && fila.IdTarea.Subcluster === null ?
                                                        <>
                                                            <div style={{ paddingLeft: "20px", width: "98%" }}>
                                                                <div className="row" >
                                                                    <input id={fila.ID} style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>
                                                                    {this.muiNormal(fila, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es)}
                                                                </div>
                                                            </div>
                                                            {this.state.Mkt.map((dato) => {
                                                                const ocultoA = util.obtenerIdAsignados(dato.OcultoA)
                                                                if (!ocultoA.results.includes(usuarioActual.Id)) {
                                                                    switch (fila.IdTarea.ID) {
                                                                        case 287:
                                                                            return (dato.IdTarea.Subcluster === "Entrega para diseño de material de ventas" ?
                                                                                <div key={dato.ID} style={{ paddingLeft: "50px", width: "100%" }}>
                                                                                    <div className="row" >
                                                                                        <input id={dato.ID * 5} style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>
                                                                                        {this.mui287288(dato, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es)}
                                                                                    </div>
                                                                                </div> : null)
                                                                        case 288:
                                                                            return (dato.IdTarea.Subcluster === "Material de ventas fabricado" ?
                                                                                <div key={dato.ID} style={{ paddingLeft: "50px", width: "100%" }}>
                                                                                    <div className="row" >
                                                                                        <input id={dato.ID * 4} style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>
                                                                                        {this.mui287288(dato, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es)}
                                                                                    </div>
                                                                                </div> : null)
                                                                        default:
                                                                            break;
                                                                    }
                                                                }
                                                            })}
                                                        </>
                                                        : null
                                                    )
                                                )
                                            )}
                                    </div>
                                )
                            } else {
                                return null
                            }
                        }
                    } else {
                        if (props.tituloTerreno === '') {
                            nombreTerreno = fila.IdTerreno !== undefined ? fila.IdTerreno.NombredelTerreno2 : fila.IdProyectoInversion.NombreProyectoInversion
                            if (fila.Orden === props.idCluster) {
                                if (datosPITerr.idPI === 0) {
                                    datosPITerr.idPI = fila.IdProyectoInversion.ID
                                    datosPITerr.idTerr = fila.IdTerreno !== undefined ? fila.IdTerreno.ID : 0
                                    datosPITerr.tipo = 'PI'
                                    datosPITerr.tarea = fila.IdTarea
                                }
                                return (
                                    <div key={fila.ID}>
                                        {fila.IdTarea.EsCluster === '0' && fila.IdTarea.Orden !== 3.14 ?
                                            <div style={{ paddingLeft: "20px", width: "98%" }}>
                                                <div className="row" >
                                                    <input id={fila.ID} style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>
                                                    {this.muiNormal(fila, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es)}
                                                </div>
                                            </div>
                                            : (fila.IdTarea.EsCluster === '1' && fila.IdTarea.EsSubcluster === '0' ?
                                                this.state.datosFPT.map((datoFPT) => {
                                                    return datoFPT.IdFlujoId === fila.ID ?
                                                        <div style={{ paddingLeft: "20px", width: "98%" }}>
                                                            <div className="row">
                                                                <input id={fila.ID} style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>
                                                                {this.muiTramites(fila, datoFPT, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es)}
                                                            </div>
                                                        </div> : null
                                                })
                                                : (fila.IdTarea.EsCluster === '1' && fila.IdTarea.EsSubcluster === '1' && fila.IdTarea.EsBitacora === '1' ?
                                                    <>
                                                        <div style={{ paddingLeft: "20px", width: "98%" }}>
                                                            <div className="row" >
                                                                <input id={fila.ID} style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>
                                                                {this.muiNormal(fila, hyperlink_icon, null, usuarioActual, webUrl, "/sitepages/Bitacora.aspx?b=" + this.state.bitacorasInfo[0].BitacoraInc.ID, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es)}
                                                            </div>
                                                        </div>
                                                        {this.state.bitacorasInfo.map((num) => {
                                                            var thisDate = this.state.solucionInfo.filter(x => x.IncidenciaSol.ID === num.ID);
                                                            var date = thisDate != null ? thisDate[0].FechaCompSol : null;
                                                            const urlIncident = webUrlBit + "sitepages/Bitacora.aspx?b=" + num.BitacoraInc.ID + "#" + num.Title;
                                                            switch (fila.IdTarea.ID) {
                                                                case 273:
                                                                    return (num.MotivoCausaInc.Title === "Arquitectura" ?
                                                                        <div key={fila.ID} style={{ paddingLeft: "50px", width: "100%" }}>
                                                                            <div className="row" >
                                                                                <input id={fila.ID} style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>
                                                                                {this.mui273274(fila, num, hyperlink_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, date, urlIncident)}
                                                                            </div>
                                                                        </div> : null)
                                                                case 274:
                                                                    return (num.MotivoCausaInc.Title === "Ejecutivo" ?
                                                                        <div key={fila.ID} style={{ paddingLeft: "50px", width: "100%" }}>
                                                                            <div className="row" >
                                                                                <input id={fila.ID} style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>
                                                                                {this.mui273274(fila, num, hyperlink_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, date, urlIncident)}
                                                                            </div>
                                                                        </div> : null)
                                                                default:
                                                                    break;
                                                            }
                                                        })}
                                                    </>
                                                    : (fila.IdTarea.EsCluster === '1' && fila.IdTarea.EsSubcluster === '1' && fila.IdTarea.Subcluster === null ?
                                                        <>
                                                            <div style={{ paddingLeft: "20px", width: "98%" }}>
                                                                <div className="row" >
                                                                    <input id={fila.ID} style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>
                                                                    {this.muiNormal(fila, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es)}
                                                                </div>
                                                            </div>
                                                            {this.state.Mkt.map((dato) => {
                                                                const ocultoA = util.obtenerIdAsignados(dato.OcultoA)
                                                                if (!ocultoA.results.includes(usuarioActual.Id)) {
                                                                    switch (fila.IdTarea.ID) {
                                                                        case 287:
                                                                            return (dato.IdTarea.Subcluster === "Entrega para diseño de material de ventas" ?
                                                                                <div key={dato.ID} style={{ paddingLeft: "50px", width: "100%" }}>
                                                                                    <div className="row" >
                                                                                        <input id={dato.ID * 5} style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>
                                                                                        {this.mui287288(dato, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es)}
                                                                                    </div>
                                                                                </div> : null)
                                                                        case 288:
                                                                            return (dato.IdTarea.Subcluster === "Material de ventas fabricado" ?
                                                                                <div key={dato.ID} style={{ paddingLeft: "50px", width: "100%" }}>
                                                                                    <div className="row" >
                                                                                        <input id={dato.ID * 4} style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>
                                                                                        {this.mui287288(dato, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es)}
                                                                                    </div>
                                                                                </div> : null)
                                                                        default:
                                                                            break;
                                                                    }
                                                                }
                                                            })}
                                                        </>
                                                        : null
                                                    )
                                                )
                                            )
                                        }
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
                            <div key={filaBody.length} style={{ paddingLeft: "20px", width: "98%" }} onClick={() => { this.onAbrirModal(nombreTerreno, 271, false, null, null, { Tarea: { ID: 271 }, info: datosPITerr }, this.state.idVentana, "lg", "500px") }}>
                                <div className="row" >
                                    {<input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>}
                                    <div className="row item-personal" style={{ width: "99%", backgroundColor: "#F8F8F8" }} >
                                        +  Agregar nueva actividad personal
                                    </div>
                                </div>
                            </div>
                        </div> :

                        <div> {filaBody}
                            <div key={0} style={{ paddingLeft: "20px", width: "98%" }} onClick={() => { this.onAbrirModal(nombreTerreno, 271, false, null, null, { Tarea: { ID: 271 }, info: datosPITerr }, this.state.idVentana, "lg", "500px") }}>
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