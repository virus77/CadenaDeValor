import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Encabezado from '../componentes/Encabezado';
import Modal from '../componentes/Ventana';
import Backdrop from '../componentes/Backdrop';
import update from 'immutability-helper';
import DateFnsUtils from '@date-io/date-fns';
import FormControl from '@material-ui/core/FormControl';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import Skeleton from '@material-ui/lab/Skeleton';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Input from '@material-ui/core/Input';
import { makeStyles } from '@material-ui/core/styles';
import { InputLabel, Select, MenuItem } from '@material-ui/core'
import arrow_up_icon from '../imagenes/arrow_up_icon.png';
import arrow_down_icon from '../imagenes/arrow_down_icon.png';
import attach_icon from '../imagenes/attach_icon.png';
import more_details_icon from '../imagenes/more_details_icon.png';
import more_details_icon_disabled from '../imagenes/more_details_icon_disabled.png';
import assignedTo_icon from '../imagenes/assignedTo_icon.png';
import assignedTo_icon_disabled from '../imagenes/assignedTo_icon_disabled.png';
import plus_icon from '../imagenes/plus_icon.png';
import plus_icon_disabled from '../imagenes/plus_icon_disabled.png';
import egupload_icon from '../imagenes/egupload_icon.png';
import clear_icon from '../imagenes/clear.png';
import disk from '../imagenes/disk.png';
import pen from '../imagenes/pen.png';
import hyperlink_icon from '../imagenes/hyperlink_icon.png';
import forbidden from '../imagenes/forbidden.png';

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
//import '../estilos/generico.css';

var checkedItems = []
var webUrl = ''
var webCdT = ''

const currentWeb = Web(window.location.protocol + '//' + window.location.host + "/CompraDeTerreno/")

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
            datosOriginalVentanaEG: [],
            datosVentanaEG: [],
            datosOriginalVentana: [],
            datosVentana: [],
            disabled: true,
            clustersVentana: [],
            MACO: this.props.maco,
            datos: { campo: '', valor: '' },
            modal: {
                abierto: false,
                id: 0,
                terreno: '',
                esTarea: false,
                filaSeleccionada: {},
                url: ''
            },
            backdrop: { cargado: false, mensaje: 'Cargando contenido...' },
            terrenos: [],
            bitacorasInfoOriginales: [],
            bitacorasInfo: [],
            solucionInfo: [],
            opcionesFiltrosEncabezado: [],
            opcionesFiltrosEncabezadoOriginal: [],
            Mkt: [],
            MktOriginal: [],
            filtrosTabla: {
                responsable: [],
                asignadoa: [],
                lineabase: [],
                festimada: [],
                estatus: [],
                favs: [],
                gantt: [],
                ver: []
            },
            filtrosTablaOrden: [],
            datosOriginalesFPT: [],
            datosFPT: [],
            usuarioActual: [],
            gruposUsuarioActual: [],
            seguridad: [],
            tieneRFS: false,
            orden: { col: '', asc: true },
            clusterToggle: [],
            posicionScroll: 0
        }
        this.state = this.inialState;
    }
    //Realiza la carga de datos iniciales al seleccionar un terreno o el reinicio de datos cuando se hace una fusión
    cargarDatosIniciales = async (esRFS, idProyecto, idTerreno, terrenoTitulo, tipo, usuarioActual, gruposUsuarioActual, seguridad) => {
        if (tipo !== 'TR' && tipo !== 'TS') {
            let actividades = []
            let datos = []
            let terrenos = []

            //Si es terreno(s) original(es)
            if (!esRFS) {
                actividades = await currentWeb.lists.getByTitle('Flujo Tareas').items
                    .filter('(IdProyectoInversionId eq ' + idProyecto + ')')
                    .select('IdTarea/TxtVentana', 'IdTerreno/ID', 'IdTerreno/Title', 'IdTerreno/NombredelTerreno2')
                    .expand('IdTarea', 'IdTerreno')
                    .top(1000)
                    .get();

                terrenos = [...new Set(actividades.map(x => (x.IdTerreno !== undefined ? x.IdTerreno.Title : '')))]

                datos = await currentWeb.lists.getByTitle('EstrategiaGestion').items
                    .filter('(ProyectoInversionId eq ' + idProyecto + ')')
                    .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Terreno/Title', 'Terreno/NombredelTerreno2',
                        'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/Orden', 'Tarea/OrdenEG', 'Tarea/Checkable',
                        'Tarea/ExisteEnGantt', 'Tarea/EsCluster', 'Tarea/EsSubcluster', 'AsignadoA/ID', 'AsignadoA/Title',
                        'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId', 'Estatus/ID', 'Estatus/Title',
                        'OrdenEG', 'NombreActividad', 'IdRCDTT/ID', 'IdRCDTT/Title', 'IdRCDTT/TituloInternoDelCampo',
                        'IdRCDTT/IdRTD', 'IdRCDTT/IdTramite', 'IdFPTId')
                    .expand('ProyectoInversion', 'Terreno', 'Tarea', 'AsignadoA', 'GrupoResponsable', 'IdRCDTT', 'Estatus')
                    .orderBy('OrdenEG', true)
                    .top(1000)
                    .get();
            } else {
                //Si es terreno RFS
                actividades = await currentWeb.lists.getByTitle('Flujo Tareas').items
                    .filter("((IdProyectoInversionId eq " + idProyecto + ") and ((IdTerrenoId eq " + idTerreno + ") or (IdTerrenoId eq null) or (IdTerrenoId eq 0) or (substringof('T-', IdTerreno/Title))) and (IdTarea/Desactivable eq 0))")
                    .select('IdTarea/TxtVentana', 'IdTerreno/ID', 'IdTerreno/Title', 'IdTerreno/NombredelTerreno2')
                    .expand('IdTarea', 'IdTerreno')
                    .top(1000)
                    .get();

                terrenos = [...new Set(actividades.map(x => (x.IdTerreno !== undefined ? x.IdTerreno.Title : '')))]

                datos = await currentWeb.lists.getByTitle('EstrategiaGestion').items
                    .filter("(ProyectoInversionId eq " + idProyecto + ") and ((TerrenoId eq " + idTerreno + ") or (TerrenoId eq null) or (substringof('T-', TerrenoId/Title)))")
                    .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Terreno/Title', 'Terreno/NombredelTerreno2',
                        'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/Orden', 'Tarea/OrdenEG', 'Tarea/Checkable',
                        'Tarea/ExisteEnGantt', 'Tarea/EsCluster', 'Tarea/EsSubcluster', 'Tarea/Subcluster', 'AsignadoA/ID', 'AsignadoA/Title',
                        'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId', 'Estatus/ID', 'Estatus/Title',
                        'OrdenEG', 'NombreActividad', 'IdRCDTT/ID', 'IdRCDTT/Title', 'IdRCDTT/TituloInternoDelCampo',
                        'IdRCDTT/IdRTD', 'IdRCDTT/IdTramite', 'IdFPTId')
                    .expand('ProyectoInversion', 'Terreno', 'Tarea', 'AsignadoA', 'GrupoResponsable', 'IdRCDTT', 'Estatus')
                    .orderBy('OrdenEG', true)
                    .top(1000)
                    .get();
            }

            let datosEG = util.inicializarArregloDatos(4, datos)

            datosEG.datos = datos;
            let result = [];
            result = Array.from(new Set(datosEG.datos.map(s => s.Tarea.TxtCluster)))
                .map(currentCluster => {
                    return {
                        cluster: datosEG.datos.find(s => s.Tarea.TxtCluster === currentCluster).Tarea
                    };
                });

            result = result.filter(x => x.cluster !== undefined && x.cluster.TxtCluster !== 'Dummy')

            let clusterToggle = result.map((x=>{ return { id: x.cluster.OrdenEG, abierto: true}}))
            clusterToggle = clusterToggle.filter(x => x.id !== null)

            const tieneRFS = datosEG.datos.some(x=> x.Tarea.ID === 24 && x.Estatus.ID === 3)
            
            let datosFPT = await util.generarConsultaFPT(actividades)
            const datosBit = await util.obtenerBitacorasInfo(this.state.proyectoTitulo,terrenoTitulo)
            const bitacorasInfo = util.establecerLineaBaseBit(datosBit.solucion, datosBit.bitacoras)

            const totalAdmin = util.obtenerTotalPorVentana(1, actividades, datosFPT, [])
            const totalNorm = util.obtenerTotalPorVentana(2, actividades, datosFPT, bitacorasInfo)
            const totalProy = util.obtenerTotalPorVentana(3, actividades, datosFPT, bitacorasInfo)

            //let d =util.generarArregloEG(result, datos)
            const opcionesFiltrosEncabezado = util.generarFiltrosEncabezado(4, datosEG, [], [], [], 0, [])
            this.setState({
                cargado: true, datosOriginalVentanaEG: datosEG, datosVentanaEG: datosEG, clustersVentana: result,
                totalAdmin: totalAdmin, totalNorm: totalNorm, totalProy: totalProy,
                tieneRFS: tieneRFS, terrenos: terrenos, terrenoTitulo: terrenoTitulo, backdrop: { cargado: true, mensaje: '' },
                gruposUsuarioActual: gruposUsuarioActual, usuarioActual: usuarioActual, seguridad: seguridad,
                clusterToggle: clusterToggle, opcionesFiltrosEncabezado: opcionesFiltrosEncabezado,
                opcionesFiltrosEncabezadoOriginal : opcionesFiltrosEncabezado
            });

        } else {
            this.setState({ backdrop: { cargado: false, mensaje: 'Completo' } });
            alert('Se crearon los terrenos nuevos y su estrategia de gestión. Vuelva al menú principal para continuar.')
        }
        const node = document.getElementById('cluster');
        node.scrollTop = 0
    }

    onCambiarVentana = async (idVentanaSeleccionada, mensaje, name, style, tipoRFS, nuevoTerreno, usuarioActual, gruposUsuarioActual, seguridad) => {
        const { idVentana, idProyecto, idTerreno, proyectoTitulo, terrenoTitulo, datosVentana, datosVentanaEG } = this.state
        let { filtrosTabla, orden, clusterToggle, opcionesFiltrosEncabezado, datosOriginalesFPT, bitacorasInfoOriginales, Mkt, MktOriginal, datosOriginalVentanaEG, datosOriginalVentana, opcionesFiltrosEncabezadoOriginal, filtrosTablaOrden } = this.state
        const datosOriginalesVEG = datosOriginalVentanaEG
        const datosOriginalesV = datosOriginalVentana
        let result = [];
        let actividades = [];
        let bitacorasInfo = []
        let solucionInfo = []

        if (tipoRFS === '' || tipoRFS === 'TF') {
            switch (idVentanaSeleccionada) {
                case 4:
                    //#region
                    if (name !== '' && style !== '') { util.styleLinkGen(name, style) }
                    let datos = await currentWeb.lists.getByTitle('EstrategiaGestion').items
                        .filter('(ProyectoInversionId eq ' + idProyecto + ') or (TerrenoId eq ' + (nuevoTerreno !== '' ? nuevoTerreno.Id : idTerreno) + ')')
                        .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Terreno/Title', 'Terreno/NombredelTerreno2',
                            'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/Orden', 'Tarea/OrdenEG', 'Tarea/Checkable',
                            'Tarea/ExisteEnGantt', 'Tarea/EsCluster', 'Tarea/EsSubcluster', 'Tarea/Subcluster', 'AsignadoA/ID', 'AsignadoA/Title',
                            'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId', 'Estatus/ID', 'Estatus/Title',
                            'OrdenEG', 'NombreActividad', 'IdRCDTT/ID', 'IdRCDTT/Title', 'IdRCDTT/TituloInternoDelCampo',
                            'IdRCDTT/IdRTD', 'IdRCDTT/IdTramite', 'IdFPTId')
                        .expand('ProyectoInversion', 'Terreno', 'Tarea', 'AsignadoA', 'GrupoResponsable', 'IdRCDTT', 'Estatus')
                        .orderBy('OrdenEG', true)
                        .top(1000)
                        .get();

                    let datosEG = util.inicializarArregloDatos(idVentanaSeleccionada, datos)
                    datosEG.datos = datos;
                    result = Array.from(new Set(datosEG.datos.map(s => s.Tarea.TxtCluster)))
                        .map(currentCluster => {
                            return {
                                cluster: datosEG.datos.find(s => s.Tarea.TxtCluster === currentCluster).Tarea
                            };
                        });

                    result = result.filter(x => x.cluster !== undefined && x.cluster.TxtCluster !== 'Dummy')

                    clusterToggle = result.map((x=>{ return { id: x.cluster.OrdenEG, abierto: true}}))
                    clusterToggle = clusterToggle.filter(x => x.id !== null)

                    const tieneRFS = datosEG.datos.some(x=> x.Tarea.ID === 24 && x.Estatus.ID === 3)

                    //let d =util.generarArregloEG(result, datosEG)
                    opcionesFiltrosEncabezado = util.generarFiltrosEncabezado(4, datosEG, [], [], [], 0, [])
                    
                    this.setState({
                        backdrop: { cargado: true, mensaje: '' }, idVentana: idVentanaSeleccionada, clustersVentana: result,
                        datosOriginalVentanaEG: datosEG, datosVentanaEG: datosEG, disabled: true,
                        idTerreno: nuevoTerreno !== '' ? nuevoTerreno.Id : idTerreno, MACO: nuevoTerreno !== '' ? nuevoTerreno.MACO : this.state.MACO,
                        terrenoTitulo: nuevoTerreno !== '' ? nuevoTerreno.Title : this.state.terrenoTitulo, cargado: true,
                        tieneRFS: tieneRFS, clusterToggle: clusterToggle, opcionesFiltrosEncabezado: opcionesFiltrosEncabezado
                    });
                    //#endregion
                    break;
                case 1:
                case 2:
                case 3:
                    //#region
                    if (name !== '' && style !== '') { util.styleLinkGen(name, style) }
                    filtrosTabla = util.limpiarFiltrosTabla()
                    orden = { col: '', asc: true }
                    //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversión
                    const complemento = !terrenoTitulo.startsWith('T-') ? ' and (IdTarea/Desactivable eq 0)' : ''

                    actividades = await currentWeb.lists.getByTitle('Flujo Tareas').items
                        .filter("((IdProyectoInversionId eq " + idProyecto + ") and ((IdTerrenoId eq " + idTerreno + ") or (IdTerrenoId eq null) or (IdTerrenoId eq 0) or (substringof('T-', IdTerreno/Title)))" + complemento + ")")
                        .select('ID', 'Title', 'IdProyectoInversion/ID', 'IdProyectoInversion/Title', 'IdProyectoInversion/NombreProyectoInversion',
                            'IdTerreno/ID', 'IdTerreno/Title', 'IdTerreno/NombredelTerreno2', 'Nivel/ID', 'Nivel/Title', 'IdTarea/ID', 'IdTarea/Title',
                            'IdTarea/TxtCluster', 'IdTarea/EsCluster', 'IdTarea/EsSubcluster', 'IdTarea/TxtVentana', 'IdTarea/Orden', 'IdTarea/Checkable',
                            'IdTarea/ExisteEnGantt', 'IdTarea/EsBitacora', 'Estatus/ID', 'Estatus/Title', 'GrupoResponsable/ID', 'Visible',
                            'GrupoResponsable/NombreCortoGantt', 'AsignadoA/ID', 'AsignadoA/Title', 'LineaBase', 'FechaEstimada', 'Favoritos/ID',
                            'Favoritos/Name', 'UrlDocumentos', 'UrlTarea', 'EstatusAnterior/ID', 'EstatusAnterior/Title', 'Orden', 'NombreActividad',
                            'Created/ID', 'Modified', 'Editor/ID', 'Editor/Title', 'LineaBaseModifico/ID', 'LineaBaseModifico/Title',
                            'IdTarea/Subcluster', 'IdTarea/AbrirLink', 'OcultoA/ID', 'OcultoA/Title', 'IdTerreno/MACO', 'IdTarea/CreaBitacora',
                            'IdTerreno/LinkFichasVenta', 'IdTerreno/LinkMemoriaAcabados', 'IdTerreno/LinkFichasDesarrollo', 'IdTarea/TareaCrear',
                            'IdProyectoInversion/IdBusquedaVersionado')
                        .expand('IdProyectoInversion', 'IdTerreno', 'Nivel', 'IdTarea', 'Estatus', 'EstatusAnterior', 'GrupoResponsable',
                            'AsignadoA', 'Favoritos', 'Editor', 'LineaBaseModifico', 'OcultoA')
                        .orderBy('Orden', true)
                        .top(1000)
                        .get()

                    const terrenos = [...new Set(actividades.map(x => (x.IdTerreno !== undefined ? x.IdTerreno.Title : '')))]

                    let datosFPT = await util.generarConsultaFPT(actividades)
                    datosFPT = util.establacerDatoLista('Fechas paquete de trámites', datosFPT, this.props.IdProyInv)

                    //let ventanas = [actividades.reduce((a, c) => (a[c.IdTarea.TxtVentana] = (a[c.IdTarea.TxtVentana] || []).concat(c), a), {})];
                    let datosActs = util.inicializarArregloDatos(idVentanaSeleccionada, actividades.filter(x=> x.Orden >= idVentanaSeleccionada && x.Orden <= idVentanaSeleccionada + 1))
                    actividades = util.establacerDatoLista('Flujo Tareas', actividades, this.props.IdProyInv)
                    datosActs.datos = actividades

                    result = Array.from(new Set(datosActs.datos.map(s => s.IdTarea.TxtCluster)))
                    .map(currentCluster => {
                        return {
                            cluster: datosActs.datos.find(s => s.IdTarea.TxtCluster === currentCluster && (parseFloat(s.Orden) > parseFloat(idVentanaSeleccionada) && parseFloat(s.Orden) < parseFloat(idVentanaSeleccionada + 1)))
                        };
                    });

                    Mkt = actividades
                    MktOriginal = actividades
                    .filter(x => x.IdTarea.Orden === 3.14 && x.IdTarea.Subcluster !== null)
                    .sort(function (a, b) { return a.ID - b.ID })

                    //Obtiene datos de las bitácoras
                    if(idVentanaSeleccionada === 3){
                        const datosBit = await util.obtenerBitacorasInfo(proyectoTitulo,terrenoTitulo)
                        solucionInfo = datosBit.solucion
                        bitacorasInfo = util.establecerLineaBaseBit(datosBit.solucion, datosBit.bitacoras)
                    }

                    const totalAdmin = util.obtenerTotalPorVentana(1, datosActs.datos, datosFPT, [])
                    const totalNorm = util.obtenerTotalPorVentana(2, datosActs.datos, datosFPT, bitacorasInfo)
                    const totalProy = util.obtenerTotalPorVentana(3, datosActs.datos, datosFPT, bitacorasInfo)

                    result = result.filter(x => x.cluster !== undefined && x.cluster.TxtCluster !== 'Dummy')

                    result.sort(function (a, b) {
                        if (a.cluster.Orden > b.cluster.Orden)
                            return 1;
                        if (a.cluster.Orden < b.cluster.Orden)
                            return -1;
                        return 0;
                    })

                    clusterToggle = result.map((x=>{ return { id: x.cluster.IdTarea.Orden, abierto: true}}))
                    clusterToggle = clusterToggle.filter(x => x.id !== null)

                    const hayRFS = actividades.some(x=> x.IdTarea.ID === 24 && x.Estatus.ID === 3)

                    opcionesFiltrosEncabezado = util.generarFiltrosEncabezado(idVentanaSeleccionada, datosActs, datosFPT, bitacorasInfo, gruposUsuarioActual, usuarioActual.Id, filtrosTabla)
                    //let d =util.generarArregloActs('Flujo Tareas', result, datosActs)
                    this.setState({
                        idVentana: idVentanaSeleccionada, clustersVentana: result, datosVentana: datosActs, datosOriginalVentana: datosActs,
                        totalAdmin: totalAdmin, totalNorm: totalNorm, totalProy: totalProy, opcionesFiltrosEncabezado: opcionesFiltrosEncabezado,
                        tieneRFS: hayRFS, orden: orden, clusterToggle: clusterToggle, datosOriginalesFPT: datosFPT, bitacorasInfoOriginales :bitacorasInfo,
                        terrenos: terrenos, terrenoTitulo: terrenoTitulo,  disabled: false, backdrop: { cargado: true, mensaje: '' },
                        filtrosTabla: filtrosTabla, datosFPT: datosFPT, Mkt: Mkt, bitacorasInfo: bitacorasInfo, seguridad: seguridad,
                        solucionInfo: solucionInfo, gruposUsuarioActual: gruposUsuarioActual, usuarioActual: usuarioActual, cargado: true,
                        opcionesFiltrosEncabezadoOriginal : opcionesFiltrosEncabezado, MktOriginal: MktOriginal
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
                                    const datosOriginales = idVentana === 4 ? datosOriginalVentanaEG : datosOriginalVentana
                                    const filtrado = util.accionFiltrado(idVentana, datosOriginales, MktOriginal, datosOriginalesFPT, bitacorasInfoOriginales, filtrosTabla, 'favs', true, filtrosTablaOrden, opcionesFiltrosEncabezado, opcionesFiltrosEncabezadoOriginal, gruposUsuarioActual, usuarioActual)
                                    
                                    if(idVentana === 4){
                                        this.setState({ datosVentanaEG: filtrado.datosVentana, filtrosTabla: filtrado.filtrosTabla, opcionesFiltrosEncabezado: filtrado.opcionesFiltrosEncabezado, filtrosTablaOrden: filtrado.filtrosTablaOrden })
                                    }else{
                                        this.setState({ datosVentana: filtrado.datosVentana, filtrosTabla: filtrado.filtrosTabla, datosFPT : filtrado.datosFPT, Mkt: filtrado.Mkt, opcionesFiltrosEncabezado: filtrado.opcionesFiltrosEncabezado, filtrosTablaOrden: filtrado.filtrosTablaOrden })
                                    }
                                }
                                break;
                            case 6:
                                //Se hizo clic en el filtro de Tareas de Gantt
                                {
                                    const datosOriginales = idVentana === 4 ? datosOriginalVentanaEG : datosOriginalVentana
                                    const filtrado = util.accionFiltrado(idVentana, datosOriginales, MktOriginal, datosOriginalesFPT, bitacorasInfoOriginales, filtrosTabla, 'gantt', true, filtrosTablaOrden, opcionesFiltrosEncabezado, opcionesFiltrosEncabezadoOriginal, gruposUsuarioActual, usuarioActual)
                                    
                                    if(idVentana === 4){
                                        this.setState({ datosVentanaEG: filtrado.datosVentana, filtrosTabla: filtrado.filtrosTabla, opcionesFiltrosEncabezado: filtrado.opcionesFiltrosEncabezado, filtrosTablaOrden: filtrado.filtrosTablaOrden })
                                    }else{
                                        this.setState({ datosVentana: filtrado.datosVentana, filtrosTabla: filtrado.filtrosTabla, datosFPT : filtrado.datosFPT, Mkt: filtrado.Mkt, opcionesFiltrosEncabezado: filtrado.opcionesFiltrosEncabezado, filtrosTablaOrden: filtrado.filtrosTablaOrden })
                                    }
                                }
                                break;
                            case 7:
                                //Se hizo clic en el filtro de Ver todos
                                {
                                    const datosOriginales = idVentana === 4 ? datosOriginalVentanaEG : datosOriginalVentana
                                    const filtrado = util.accionFiltrado(idVentana, datosOriginales, MktOriginal, datosOriginalesFPT, bitacorasInfoOriginales, filtrosTabla, 'ver', true, filtrosTablaOrden, opcionesFiltrosEncabezado, opcionesFiltrosEncabezadoOriginal, gruposUsuarioActual, usuarioActual)
                                    
                                    if(idVentana === 4){
                                        this.setState({ datosVentanaEG: filtrado.datosVentana, filtrosTabla: filtrado.filtrosTabla, opcionesFiltrosEncabezado: filtrado.opcionesFiltrosEncabezado, filtrosTablaOrden: filtrado.filtrosTablaOrden })
                                    }else{
                                        this.setState({ datosVentana: filtrado.datosVentana, filtrosTabla: filtrado.filtrosTabla, datosFPT : filtrado.datosFPT, Mkt: filtrado.Mkt, opcionesFiltrosEncabezado: filtrado.opcionesFiltrosEncabezado, filtrosTablaOrden: filtrado.filtrosTablaOrden })
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                    }
                    break;
                case 8:
                    //Se hizo clic en el icono de redirección a Gantt
                    const dato = this.props.rfs === false ? proyectoTitulo : terrenoTitulo
                    window.open(webUrl + "/CompraDeTerreno/sitepages/gantt.aspx?Valor=" + dato, "_blank");
                    break;
                default:
                    break;
            }
        }
        else {
            this.setState({ backdrop: { cargado: true, mensaje: '' } });
            alert('Se crearon los terrenos nuevos y su estrategia de gestión. Vuelva al menú principal para consultarlos.')
        }
        const node = document.getElementById('cluster');
        node.scrollTop = 0
    }

    //#region Métodos de modal
    onAbrirModal = (terreno, id, esTarea, campo, valor, fila, ventana, size, padding) => {
        //Si el evento viene de la ventana de E.G.
        let abrirModal = true
        if (ventana === 4) {
            if (fila.Tarea.ID === 24 && this.state.MACO === null) {
                abrirModal = false
                alert('No puedes generar RFSN hasta definir el tipo de MACO. Hazlo en el botón superior, junto al nombre del proyecto.')
            }
        }

        if(abrirModal){
            const node = document.getElementById('cluster');
            this.setState({
                modal: { abierto: true, id: id, terreno: terreno, esTarea: esTarea, filaSeleccionada: fila, size: size, padding: padding, usuarioActual: this.state.usuarioActual, gruposUsuarioActual: this.state.gruposUsuarioActual, url: webUrl },
                datos: { campo: campo, valor: valor },
                posicionScroll: node.scrollTop
            })
        }
    }

    onCerrarModal = () => {
        this.setState({ modal: this.inialState.modal })
    };
    //#endregion

    onHandleChange = (event) => {
        let { filtrosTabla, datosOriginalVentanaEG, datosOriginalVentana, idVentana, datosOriginalesFPT, bitacorasInfoOriginales, MktOriginal, opcionesFiltrosEncabezado, opcionesFiltrosEncabezadoOriginal, gruposUsuarioActual, usuarioActual, filtrosTablaOrden } = this.state
        const { id, name } = event.target

        const datosOriginales = idVentana === 4 ? datosOriginalVentanaEG : datosOriginalVentana

        const filtrado = util.accionFiltrado(idVentana, datosOriginales, MktOriginal, datosOriginalesFPT, bitacorasInfoOriginales, filtrosTabla, name, id, filtrosTablaOrden, opcionesFiltrosEncabezado, opcionesFiltrosEncabezadoOriginal, gruposUsuarioActual, usuarioActual)

        if(idVentana === 4){
            this.setState({ datosVentanaEG: filtrado.datosVentana, filtrosTabla: filtrado.filtrosTabla, opcionesFiltrosEncabezado: filtrado.opcionesFiltrosEncabezado, filtrosTablaOrden: filtrado.filtrosTablaOrden })
        }else{
            this.setState({ datosVentana: filtrado.datosVentana, filtrosTabla: filtrado.filtrosTabla, datosFPT : filtrado.datosFPT, Mkt: filtrado.Mkt, opcionesFiltrosEncabezado: filtrado.opcionesFiltrosEncabezado, filtrosTablaOrden: filtrado.filtrosTablaOrden })
        }
    }

    onOrdenar = (event) =>{
        let { idVentana, datosVentanaEG, datosVentana, orden } = this.state
        
        if(orden.col !== event.target.id){
            orden.col = event.target.id
            orden.asc = true
        }else{
            orden.asc = !orden.asc
        }

        switch(event.target.id){
            case "responsable":
                if(idVentana === 4){
                    datosVentanaEG.datos.sort(function (a, b) {
                        let comparison = 0;
                        if (a.GrupoResponsable.NombreCortoGantt > b.GrupoResponsable.NombreCortoGantt)
                            comparison = 1;
                        else if (a.GrupoResponsable.NombreCortoGantt < b.GrupoResponsable.NombreCortoGantt)
                            comparison = -1;

                        return orden.asc ? comparison : comparison * -1;
                    })
                }else{
                    datosVentana.datos.sort(function (a, b) {
                        let comparison = 0;
                        if (a.GrupoResponsable.NombreCortoGantt > b.GrupoResponsable.NombreCortoGantt)
                            comparison = 1;
                        else if (a.GrupoResponsable.NombreCortoGantt < b.GrupoResponsable.NombreCortoGantt)
                            comparison = -1;

                        return orden.asc ? comparison : comparison * -1;
                    })
                }
                break;
            case "asignadoa":
                    if(idVentana === 4){
                        datosVentanaEG.datos.sort(function (a, b) {
                            let comparison = 0;
                            if(a.AsignadoA !== undefined && b.AsignadoA !== undefined){
                                if (a.AsignadoA[0].Title > b.AsignadoA[0].Title)
                                    comparison = 1;
                                else if (a.AsignadoA[0].Title < b.AsignadoA[0].Title)
                                    comparison = -1;
                            }else if(a.AsignadoA !== undefined){
                                comparison = 1;
                            }
                            else if(b.AsignadoA !== undefined){
                                comparison = -1;
                            }
    
                            return orden.asc ? comparison : comparison * -1;
                        })
                    }else{
                        datosVentana.datos.sort(function (a, b) {
                            let comparison = 0;
                            if(a.AsignadoA !== undefined && b.AsignadoA !== undefined){
                                if (a.AsignadoA[0].Title > b.AsignadoA[0].Title)
                                    comparison = 1;
                                else if (a.AsignadoA[0].Title < b.AsignadoA[0].Title)
                                    comparison = -1;
                            }else if(a.AsignadoA !== undefined){
                                comparison = 1;
                            }
                            else if(b.AsignadoA !== undefined){
                                comparison = -1;
                            }
    
                            return orden.asc ? comparison : comparison * -1;
                        })
                    }
                    break;
            case "lineabase":
                datosVentana.datos.sort(function (a, b) {
                    let comparison = 0;
                    if(a.LineaBase !== null && b.LineaBase !== null){
                        if (a.LineaBase > b.LineaBase)
                            comparison = 1;
                        else if (a.LineaBase < b.LineaBase)
                            comparison = -1;
                    }else if(a.LineaBase !== null ){
                        comparison = 1;
                    }else if(b.LineaBase !== null){
                        comparison = -1;
                    }

                    return orden.asc ? comparison : comparison * -1;
                })
                break;
            case "festimada":
                datosVentana.datos.sort(function (a, b) {
                    let comparison = 0;
                    if(a.FechaEstimada !== null && b.FechaEstimada !== null){
                        if (a.FechaEstimada > b.FechaEstimada)
                            comparison = 1;
                        else if (a.FechaEstimada < b.FechaEstimada)
                            comparison = -1;
                    }else if(a.FechaEstimada !== null ){
                        comparison = 1;
                    }else if(b.FechaEstimada !== null){
                        comparison = -1;
                    }

                    return orden.asc ? comparison : comparison * -1;
                })
                break;
            case "estatus":
                datosVentana.datos.sort(function (a, b) {
                    let comparison = 0;
                    if (a.Estatus.Title > b.Estatus.Title)
                        comparison = 1;
                    else if (a.Estatus.Title < b.Estatus.Title)
                        comparison = -1;

                    return orden.asc ? comparison : comparison * -1;
                })
                break;
        }
        if(idVentana === 4){
            this.setState({datosVentanaEG: datosVentanaEG})
        }else{
            this.setState({datosVentana: datosVentana})
        }
    }

    onLimpiarFiltros = () =>{
        let { filtrosTabla, datosOriginalVentanaEG, datosOriginalVentana, idVentana } = this.state
        
        const datosOriginales = idVentana === 4 ? datosOriginalVentanaEG : datosOriginalVentana
        filtrosTabla = util.limpiarFiltrosTabla()

        if(idVentana === 4){
            this.setState({ datosVentanaEG: datosOriginales, filtrosTabla: filtrosTabla })
        }else{
            this.setState({ datosVentana: datosOriginales, filtrosTabla: filtrosTabla })
        }
    }

    onCambiarMaco = maco => {
        this.setState({ MACO: maco.dato })
    }

    //Función utilizada para establecer o quitar favoritos
    onEstablecerFavorito = async (fila) => {
        const node = document.getElementById('cluster');
        let val = { results: [] }
        let favoritos = []
        const user = this.state.usuarioActual
        let { datosVentana, datosOriginalVentana, datosFPT, datosOriginalesFPT, bitacorasInfo, bitacorasInfoOriginales } = this.state
        if (!util.IsNullOrEmpty(fila.Favoritos)) {
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

        if(fila.Lista !== 'Incidencia'){
            await currentWeb.lists.getByTitle(fila.Lista).items.getById(fila.ID).update({
                FavoritosId: val,
            }).then(() => {
                if (fila.Lista === 'Flujo Tareas') {
                    let data = util.actualizarPropiedadesEstatus(datosVentana.datos, 'ID', fila.ID, 'Favoritos', favoritos)
                    let dataO = util.actualizarPropiedadesEstatus(datosOriginalVentana.datos, 'ID', fila.ID, 'Favoritos', favoritos)
    
                    datosVentana.datos = update(this.state.datosVentana.datos, { $splice: [[data.indice, 1, data.dato]] })
                    datosOriginalVentana.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[dataO.indice, 1, dataO.dato]] })
                    this.setState({ datosVentana: datosVentana, datosOriginalVentana: datosOriginalVentana })
                } else if (fila.Lista === 'Fechas paquete de trámites') {
                    let data = util.actualizarPropiedadesEstatus(datosFPT, 'ID', fila.ID, 'Favoritos', favoritos)
                    let dataO = util.actualizarPropiedadesEstatus(datosOriginalesFPT, 'ID', fila.ID, 'Favoritos', favoritos)
                    
                    datosFPT = update(this.state.datosFPT, { $splice: [[data.indice, 1, data.dato]] })
                    datosOriginalesFPT = update(this.state.datosOriginalesFPT, { $splice: [[dataO.indice, 1, dataO.dato]] })
                    this.setState({ datosFPT: datosFPT, datosOriginalesFPT: datosOriginalesFPT, posicionScroll: node.scrollTop })
                }
            })
        }else{
            const rootweb = await currentWeb.getParentWeb()
            let websCdV = await rootweb.web.webs()
            let webBitacoras = websCdV[2]
            webBitacoras = await sp.site.openWebById(webBitacoras.Id)

            await webBitacoras.web.lists.getByTitle(fila.Lista).items.getById(fila.ID).update({
                FavoritosId: val,
            }).then(()=>{
                let data = util.actualizarPropiedadesEstatus(bitacorasInfo, 'ID', fila.ID, 'Favoritos', favoritos)
                let dataO = util.actualizarPropiedadesEstatus(bitacorasInfoOriginales, 'ID', fila.ID, 'Favoritos', favoritos)
                
                bitacorasInfo = update(this.state.bitacorasInfo, { $splice: [[data.indice, 1, data.dato]] })
                bitacorasInfoOriginales = update(this.state.bitacorasInfoOriginales, { $splice: [[dataO.indice, 1, dataO.dato]] })
                this.setState({ bitacorasInfo: bitacorasInfo, bitacorasInfoOriginales: bitacorasInfoOriginales, posicionScroll: node.scrollTop })
            })
        }
    }

    //Establece la fecha seleccionada en el campo de Linea base y Fecha estimada
    onSeleccionarFecha = async (fecha, fila, campo) => {
        const { idVentana, gruposUsuarioActual, usuarioActual } = this.state
        let { datosVentana, datosOriginalVentana, opcionesFiltrosEncabezado, datosFPT, filtrosTabla } = this.state
        if (fila.Lista === 'Flujo Tareas') {
            const filaIndice = datosVentana.datos.findIndex(datos => datos.ID === fila.ID)
            const filaIndiceO = datosOriginalVentana.datos.findIndex(datos => datos.ID === fila.ID)
            let newData = datosVentana.datos[filaIndice]
            let newDataO = datosOriginalVentana.datos[filaIndiceO]
            switch (campo) {
                case 'LineaBase':
                    await currentWeb.lists.getByTitle(fila.Lista).items.getById(fila.ID).update({
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
                    await currentWeb.lists.getByTitle(fila.Lista).items.getById(fila.ID).update({
                        FechaEstimada: fecha,
                    }).then(() => {
                        newData.FechaEstimada = moment(fecha).format()
                        newDataO.FechaEstimada = moment(fecha).format()
                    })
                    break;
                default:
                    break;
            }
            datosVentana.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice, 1, newData]] })
            datosOriginalVentana.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[filaIndiceO, 1, newDataO]] })
            opcionesFiltrosEncabezado = util.generarFiltrosEncabezado(idVentana, datosOriginalVentana, datosFPT, [], gruposUsuarioActual, usuarioActual, filtrosTabla)
            this.setState({ datosVentana: datosVentana, datosOriginalVentan: datosOriginalVentana, opcionesFiltrosEncabezado: opcionesFiltrosEncabezado })
        } else {
            const filaIndice = datosFPT.findIndex(datos => datos.ID === fila.ID)
            let newData = datosFPT[filaIndice]
            switch (campo) {
                case 'LineaBase':
                    await currentWeb.lists.getByTitle(fila.Lista).items.getById(fila.ID).update({
                        LineaBase: fecha,
                        LineaBaseModificoId: usuarioActual.Id
                    }).then(() => {
                        newData.LineaBase = moment(fecha).format()
                        newData.LineaBaseModifico = usuarioActual
                    })
                    break;
                case 'FechaEstimada':
                    await currentWeb.lists.getByTitle(fila.Lista).items.getById(fila.ID).update({
                        FechaEstimada: fecha,
                    }).then(() => {
                        newData.FechaEstimada = moment(fecha).format()
                    })
                    break;
                default:
                    break;
            }

            datosFPT = update(this.state.datosFPT, { $splice: [[filaIndice, 1, newData]] })
            opcionesFiltrosEncabezado = util.generarFiltrosEncabezado(idVentana, datosOriginalVentana, datosFPT, [], gruposUsuarioActual, usuarioActual, filtrosTabla)
            this.setState({ datosFPT: datosFPT, opcionesFiltrosEncabezado: opcionesFiltrosEncabezado })
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
        //Filtra los elementos que hayan sido modificados
        elementos = elementos.filter(x => x.cambio)
        const guardarEG = async () => {
            let datosActualizados
            this.setState({ backdrop: { cargado: false, mensaje: 'Guardando estrategia de gestión...' } })
            await util.asyncForEach(elementos, async elemento => {
                //Si no tiene ID de elemento asignado, se creará la tarea en Flujo Tareas
                if (elemento.datos.IdFlujoTareasId === null || elemento.datos.IdFlujoTareasId === 0) {
                    const usuariosAsignados = util.obtenerIdAsignados(elemento.datos.AsignadoA)
                    let fta = []
                    //Si el elemento checkeado es clúster o subcluster...
                    if (elemento.datos.Tarea.EsCluster === '1' || elemento.datos.Tarea.EsSubcluster === '1') {
                        fta = await currentWeb.lists.getByTitle('Flujo Tareas').items
                            .filter('IdProyectoInversionId eq ' + elemento.datos.ProyectoInversion.ID +
                                ' and IdTerrenoId eq ' + elemento.datos.Terreno.ID + ' and IdTareaId eq ' +
                                elemento.datos.Tarea.ID)
                            .get()
                            .catch(error =>{
                                alert('Error al consultar datos del subcluster: ' + error)
                            })
                    }

                    if (fta.length === 0) {
                        //Crea la tarea en flujo tareas de la actividad seleccionada
                        fta = await currentWeb.lists.getByTitle("Flujo Tareas").items.add({
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
                        .catch(error =>{
                            alert('Error al guardar la actividad seleccionada: ' + error)
                        })
                    }

                    let fpt = 0
                    //Si el elemento checkeado es clúster o subcluster...
                    if (elemento.datos.Tarea.EsCluster === '1' || elemento.datos.Tarea.EsSubcluster === '1') {
                        //Sino tiene Id en fechas paquete de trámites, guarda la información en dicha lista
                        if (elemento.datos.IdFPTId === null) {
                            if(elemento.datos.IdRCDTT !== undefined){
                                fpt = await currentWeb.lists.getByTitle("Fechas paquete de trámites").items.add({
                                    Title: this.state.terrenoTitulo,
                                    IdDocTaskId: elemento.datos.IdRCDTT.IdRTD,
                                    IdFlujoId: fta.data !== undefined ? fta.data.ID : fta[0].ID,
                                    IdDocTramiteId: elemento.datos.IdRCDTT.IdTramite,
                                    InternalNameFdeI: 'FdeI' + elemento.datos.IdRCDTT.TituloInternoDelCampo,
                                    InternalNameFdeLaP: 'FdeP' + elemento.datos.IdRCDTT.TituloInternoDelCampo,
                                    InternalNameFdeR: 'FdeR' + elemento.datos.IdRCDTT.TituloInternoDelCampo,
                                    InternalNameFdeV: 'FdeV' + elemento.datos.IdRCDTT.TituloInternoDelCampo,
                                    GrupoResponsableId: elemento.datos.GrupoResponsable.ID,
                                    AsignadoAId: usuariosAsignados,
                                    EstatusId: 1,
                                    EstatusAnteriorId: 1
                                })
                                .catch(error =>{
                                    alert('Error al generar datos del trámite: ' + error)
                                })
                            }
                        } else {
                            //Si ya tiene Id en fechas paquete de trámites, actualiza la información en dicha lista
                            await currentWeb.lists.getByTitle("Fechas paquete de trámites").items.getById(elemento.datos.IdFPTId).update({
                                NoAplica: !elementos.cambio,
                                AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] }
                            })
                            .catch(error =>{
                                alert('Error al actualizar datos del trámite: ' + error)
                            })
                        }
                    }
                    //Actualiza la información de la actividad seleccionada en la lista de Estrategia de gestión.
                    //Sólo si la actividad es de tipo cluster, el estatus no cambia a Enviado
                    await currentWeb.lists.getByTitle("EstrategiaGestion").items.getById(elemento.datos.ID).update({
                        Seleccionado: elemento.datos.Seleccionado,
                        IdFlujoTareasId: fta.data !== undefined ? fta.data.ID : fta[0].ID,
                        AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] },
                        EstatusId: elemento.datos.Tarea.EsCluster === '1' ? 1 : 3,
                        IdFPTId: fpt !== 0 ? fpt.data.Id : null
                    })
                    .then(() => {
                        //Asigna el ID de elemento generado en flujo tareas al objeto en memoria del item seleccionado
                        //en la vetana de la EG
                        const indice = this.state.datosVentanaEG.datos.findIndex((obj => obj.ID === elemento.datos.ID))
                        let newData = this.state.datosVentanaEG.datos[indice]
                        newData.Seleccionado = elemento.datos.Seleccionado
                        newData.IdFlujoTareasId = fta.data !== undefined ? fta.data.ID : fta[0].ID
                        newData.AsignadoAId = elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] }
                        newData.EstatusId = elemento.datos.Tarea.EsCluster === '1' ? 1 : 3
                        newData.IdFPTId = fpt !== 0 ? fpt.data.Id : null

                        datosActualizados = util.inicializarArregloDatos(this.state.idVentana, this.state.datosVentanaEG.datos.filter(x=> x.Orden >= this.state.idVentana && x.Orden <= this.state.idVentana + 1))
                        datosActualizados.datos = update(this.state.datosVentanaEG.datos, { $splice: [[indice, 1, newData]] })
                    })
                    .catch(error =>{
                        alert('Error al actualizar datos de la actividad en Estrategia de gestión: ' + error)
                    })
                } else {
                    //Si ya tiene ID de elemento asignado, se actualizará la tarea en flujo tareas
                    const usuariosAsignados = util.obtenerIdAsignados(elemento.datos.AsignadoA)
                    await currentWeb.lists.getByTitle("Flujo Tareas").items.getById(elemento.datos.IdFlujoTareasId).update({
                        AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] },
                        Visible: elemento.datos.Seleccionado
                    })
                    .then(async u => {
                        //Establece como seleccionado en la lista de EG
                        await currentWeb.lists.getByTitle("EstrategiaGestion").items.getById(elemento.datos.ID).update({
                            AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] },
                            Seleccionado: elemento.datos.Seleccionado
                        })
                        .then(async () => {
                            //Si la actividad de es tipo cluster, actualiza los datos
                            if (elemento.datos.Tarea.EsCluster === '1' || elemento.datos.Tarea.EsSubcluster === '1') {
                                await currentWeb.lists.getByTitle("Fechas paquete de trámites").items.getById(elemento.datos.IdFPTId).update({
                                    NoAplica: !elemento.cambio,
                                    AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] }
                                })
                                .catch(error =>{
                                    alert('Error al actualizar datos del trámite: ' + error)
                                })
                            }
                            const indice = this.state.datosVentanaEG.datos.findIndex((obj => obj.ID === elemento.datos.ID))
                            let newData = this.state.datosVentanaEG.datos[indice]
                            newData.Seleccionado = elemento.datos.Seleccionado
                            newData.AsignadoAId = elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] }

                            datosActualizados = util.inicializarArregloDatos(this.state.idVentana, this.state.datosVentanaEG.datos.filter(x=> x.Orden >= this.state.idVentana && x.Orden <= this.state.idVentana + 1))
                            datosActualizados.datos = update(this.state.datosVentanaEG.datos, { $splice: [[indice, 1, newData]] })
                        })
                        .catch(error =>{
                            alert('Error al actualizar datos de la estrategia de gestión: ' + error)
                        })
                    });
                }
            });
            await currentWeb.lists.getByTitle("HistorialEG").items.add({
                ProyectoInversionId: this.state.idProyecto
            })
            .catch(error =>{
                alert('Error al guardar el historial de E.G.: ' + error)
            })
            alert('Datos guardados correctamente')
            this.setState({ datosVentanaEG: datosActualizados, backdrop: { cargado: true, mensaje: '' } })
        }
        guardarEG();
    }

    onTogggleCluster = (idCluster) =>{
        let { clusterToggle } = this.state
        const index = clusterToggle.findIndex(x=> x.id === idCluster)
        let newData = clusterToggle[index]
        newData.abierto = !newData.abierto
        let datosActualizados = update(clusterToggle, { $splice: [[index, 1, newData]] })

        this.setState({ clusterToggle: datosActualizados})
    }
    //#region Métodos de ciclo de vida
    async componentDidMount() {
        util.styleLinkGen("genericoEG.css", "../estilos/genericoEG.css")

        webUrl = await sp.web()
        webCdT = webUrl.Url
        webUrl = webUrl.Url.replace('/CompraDeTerreno', '')

        //Obtiene los grupos y sus usuarios de la lista de GanttPersonColab
        const seguridad = await util.obtenerSeguridad()
        //Obtiene los datos del usuario actual
        const usuarioActual = await currentWeb.currentUser.get();
        //Obtiene los grupos en los que está registrado el usuario actual en la lista de GanttPersonColab
        const gruposUsuarioActual = await currentWeb.lists.getByTitle('GanttPersonColab').items
            .filter("AdminAreaGanttId eq " + usuarioActual.Id + " or RespAreaGanttId eq " + usuarioActual.Id + " or NombreCortoGantt eq 'TODOS'")
            .get()

        const esAdministrador = gruposUsuarioActual.some(x=> x.NombreCortoGantt === 'EG')

        if(esAdministrador){
            this.cargarDatosIniciales(this.props.rfs, this.props.idProyecto, this.props.idTerreno, this.props.TerrenoId, '', usuarioActual, gruposUsuarioActual, seguridad)
        }else if(gruposUsuarioActual.length === 0){
            alert('Tu usuario no tiene permisos para ver este contenido. Por favor, contacta al área de sistemas.')
        }else{
            this.onCambiarVentana(2, 'Cargando contenido...', "genericoNorm.css", "../estilos/genericoNorm.css", "", "", usuarioActual, gruposUsuarioActual, seguridad)
        }
    }

    componentDidUpdate(prevProps){
        const node = document.getElementById('cluster');
        node.scrollTop = this.state.posicionScroll
    }
    //#endregion

    onActualizarDatos = async arregloDatos => {
        const { idVentana, MACO, idProyecto, tipo , usuarioActual, gruposUsuarioActual, seguridad, filtrosTabla } = this.state
        let { datosVentana, datosOriginalVentana, opcionesFiltrosEncabezado, datosFPT } = this.state
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
                let datosActualizados = util.inicializarArregloDatos(idVentana, this.state.datosVentanaEG.datos.filter(x=> x.Orden >= idVentana && x.Orden <= idVentana + 1))
                let datosActualizadosO = util.inicializarArregloDatos(idVentana, this.state.datosOriginalVentanaEG.datos.filter(x=> x.Orden >= idVentana && x.Orden <= idVentana + 1))
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
                            const terrenosPI = await currentWeb.lists.getByTitle('Terrenos').items.filter('IdProyectoInversionId eq ' + idProyecto + ' and Empadronamiento eq null').get()
                            const nuevasTareasEG = await currentWeb.lists.getByTitle("Tareas").items.filter("((DetonacionInicial eq 0) and (MACO eq 'X' or MACO eq '" + MACO + "') and (CrearConRFS eq 0))").get();
                            
                            const generarEG = async () => {
                                await util.asyncForEach(terrenosPI, async terrenoPI => {
                                    await util.asyncForEach(nuevasTareasEG, async nuevaTarea => {
                                        let tareaEG = 0
                                        if (nuevaTarea.OrdenEG === null && nuevaTarea.ID !== 244) {
                                            //Crea el elemento en la lista de Flujo Tareas 
                                            tareaEG = await currentWeb.lists.getByTitle("Flujo Tareas").items.add({
                                                IdProyectoInversionId: terrenoPI.IdProyectoInversionId,
                                                IdTareaId: nuevaTarea.ID,
                                                NivelId: nuevaTarea.NivelId,
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
                                        if (nuevaTarea.EnEG) {
                                            //Si la actividad a crear no es clúster, la crea normalmente
                                            if (nuevaTarea.EsCluster === '0') {
                                                //Crea el elemento en la estrategia de gestión del terreno resultante actual
                                                await currentWeb.lists.getByTitle("EstrategiaGestion").items.add({
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
                                                const tareasTramites = await currentWeb.lists.getByTitle("Relación campos documentos trámites tareas").items.filter("TareaId eq " + nuevaTarea.ID + " and Tramite eq 'Trámite'").select('ID').get()
                                                let existeNodo = false
                                                await util.asyncForEach(tareasTramites, async tareaTramite => {
                                                    //Crea el elemento en la estrategia de gestión del terreno resultante actual
                                                    //Si la tarea a crear es subcluster y aún no se ha creado la tarea nodo...
                                                    if (nuevaTarea.EsSubcluster === '1' && !existeNodo) {
                                                        await currentWeb.lists.getByTitle("EstrategiaGestion").items.add({
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
                                                    await currentWeb.lists.getByTitle("EstrategiaGestion").items.add({
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
                                this.cargarDatosIniciales(true, terrenosPI[0].IdProyectoInversionId, terrenosPI[0].ID, terrenosPI[0].Title, '', usuarioActual, gruposUsuarioActual, seguridad)
                            }
                            generarEG();
                        } else {
                            //Establece el spinner mientras para cargar la nueva tarea generada a partir del RFS
                            this.onCambiarVentana(4, 'Cargando contenido generado...', "genericoEG.css", "../estilos/genericoEG.css", "", '', usuarioActual, gruposUsuarioActual, seguridad)
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

                        //Obtiene las tareas a deshabilitar después de hacer un RFS
                        const tareasDeshabilitar = await currentWeb.lists.getByTitle("Tareas").items
                            .filter('Desactivable eq 1')
                            .select('ID')
                            .get()
                        
                        //Deshabilita las tareas a nivel PI que ya no son necesarias después de hacer un RFS
                        await util.asyncForEach(tareasDeshabilitar, async (tareaDeshabilitar) => {
                            await currentWeb.lists.getByTitle("Flujo Tareas").items
                                .filter('IdProyectoInversionId eq ' + idProyecto + ' and IdTareaId eq ' + tareaDeshabilitar.ID)
                                .get()
                                .then(async (ft) => {
                                    if (ft.length > 0) {
                                        await currentWeb.lists.getByTitle("Flujo Tareas").items.getById(ft[0].Id).update({
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
                        })
                        .then(async () => {
                            const rootweb = await currentWeb.getParentWeb()
                            let websCdV = await rootweb.web.webs()
                            let weBdTVersionado = websCdV[0]
                            weBdTVersionado = await sp.site.openWebById(weBdTVersionado.Id)

                            const terrenosVersionadoPI = await weBdTVersionado.web.lists.getByTitle("Terrenos").items
                                .filter("IdPredio/IdPredio eq '" + arregloDatos.dato.tituloPI + "'")
                                .select('ID', 'Title', 'Metraje', 'IdPredio/ID', 'IdPredio/Title', 'IdPredio/IdPredio', 'Calle', 'Colonia', 'CodigoPostal', 'NoExterior', 'Municipio')
                                .expand('IdPredio').orderBy('ID', false).get()

                            //Guarda la información de los terrenos seleccionados en la terea en la lista de RFS
                            await util.asyncForEach(arregloDatos.dato.terrenos, async (terrenoActual) => {
                                if(terrenoActual.Empadronamiento === 'Sí'){
                                    await currentWeb.lists.getByTitle('RFSN').items.add({
                                        IdProyectoInversionId: idProyecto,
                                        FRSN: arregloDatos.dato.tipo === 'TS' ? 'Subdivisión' : (tipo === 'TR' ? 'Relotificación' : 'Fusión'),
                                        IdFlujoId: arregloDatos.dato.idFlujoTareas,
                                        IdTerrenoId: terrenoActual.ID,
                                        CantidadTerrenos: arregloDatos.dato.cantidadTerrenos,
                                        Metrajes: unionMetrajes
                                    })
                                    .catch(error => {
                                        alert('Error al agregar datos en RFS: ' + error)
                                    })
                                }
                            })
                            .then(async () => {
                                //Establece la tarea como Enviada
                                await currentWeb.lists.getByTitle("Flujo Tareas").items.getById(arregloDatos.dato.idFlujoTareas).update({
                                    EstatusId: 3,
                                    EstatusAnteriorId: 3
                                })
                                .then(async () => {
                                    //Establece el empadronamiento a los terrenos seleccionados en la tarea
                                    //para que se consideren como TERRENOS NO VIVOS
                                    await util.asyncForEach(arregloDatos.dato.terrenos, async (terrenoActual) => {
                                        if(terrenoActual.Empadronamiento === 'Sí'){
                                            await currentWeb.lists.getByTitle("Terrenos").items.getById(terrenoActual.ID).update({
                                                Empadronamiento: 'Sí'
                                            })
                                            .catch(error => {
                                                alert('Error al establecer el empadronamiento: ' + error)
                                            })
                                        }
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
                                            await currentWeb.lists.getByTitle('Terrenos').items.add({
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
                                                //Obtiene las tareas que se crarán para el nuevo terreno dependiendo de su MACO y tipo de RFS (TS, TF o TR)
                                                const nuevasTareasEG = await currentWeb.lists.getByTitle("Tareas").items.filter("((DetonacionInicial eq 0) and (MACO eq 'X' or MACO eq '" + arregloDatos.dato.tipo + "' or MACO eq '" + terrenoResultante.MACO + "'))").get();

                                                const generarEG = async () => {
                                                    await util.asyncForEach(nuevasTareasEG, async nuevaTarea => {
                                                        let tareaEG = 0
                                                        if (nuevaTarea.OrdenEG === null && nuevaTarea.ID !== 244) {
                                                            //Crea el elemento en la lista de Flujo Tareas
                                                            tareaEG = await currentWeb.lists.getByTitle("Flujo Tareas").items.add({
                                                                IdProyectoInversionId: idProyecto,
                                                                IdTareaId: nuevaTarea.ID,
                                                                NivelId: nuevaTarea.NivelId,
                                                                IdTerrenoId: terr.data.Id,
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
                                                        if (nuevaTarea.EnEG) {
                                                            if (nuevaTarea.EsCluster === '0') {
                                                                //Crea el elemento en la estrategia de gestión del terreno resultante actual
                                                                await currentWeb.lists.getByTitle("EstrategiaGestion").items.add({
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
                                                                const tareasTramites = await currentWeb.lists.getByTitle("Relación campos documentos trámites tareas").items.filter("TareaId eq " + nuevaTarea.ID + " and Tramite eq 'Trámite'").select('ID').get()
                                                                let existeNodo = false
                                                                await util.asyncForEach(tareasTramites, async tareaTramite => {
                                                                    //Crea el elemento en la estrategia de gestión del terreno resultante actual
                                                                    //Si la tarea a crear es subcluster y aún no se ha creado la tarea nodo...
                                                                    if (nuevaTarea.EsSubcluster === '1' && !existeNodo) {
                                                                        await currentWeb.lists.getByTitle("EstrategiaGestion").items.add({
                                                                            ProyectoInversionId: idProyecto,
                                                                            TerrenoId: terr.data.Id,
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
                                                                    await currentWeb.lists.getByTitle("EstrategiaGestion").items.add({
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
                                                        this.cargarDatosIniciales(true, idProyecto, terr.data.Id, terr.data.Title, arregloDatos.dato.tipo, this.state.usuarioActual, this.state.gruposUsuarioActual, seguridad)
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
                        this.onCambiarVentana(4, 'Cargando contenido generado...', "", "", "", '', usuarioActual, gruposUsuarioActual, seguridad)
                        break;
                    default:
                        break;
                }
            }
            //#endregion
        } else {
            //#region Otras ventanas
            const filaSeleccionada = this.state.modal.filaSeleccionada
            if(!this.state.modal.esTarea){
                if (arregloDatos.tarea === 0) {
                    //Asignado A
                    //Si la ventana donde sucede el evento es Normativo, Proyectos o Administración
                    let usuariosAsignados = util.obtenerIdAsignados(arregloDatos.dato.usuarioAsignados)
                    const idElemento = filaSeleccionada.ID
    
                    await currentWeb.lists.getByTitle(arregloDatos.dato.lista).items.getById(idElemento).update({
                        AsignadoAId: usuariosAsignados
                    }).then(async () => {
                        const filtroEG = arregloDatos.dato.lista === 'Flujo Tareas' ? (filaSeleccionada.Nivel.ID === 1 ?
                            'ProyectoInversionId eq ' + filaSeleccionada.IdProyectoInversion.ID + ' and TareaId eq ' + filaSeleccionada.IdTarea.ID
                            : 'ProyectoInversionId eq ' + filaSeleccionada.IdProyectoInversion.ID + ' and TerrenoId eq ' + filaSeleccionada.IdTerreno.ID + ' and TareaId eq ' + filaSeleccionada.IdTarea.ID)
                                : 'IdFPTId eq ' + filaSeleccionada.ID
                        const itemEG = await currentWeb.lists.getByTitle("EstrategiaGestion").items.filter(filtroEG).get()
                        if (itemEG.length > 0) {
                            await currentWeb.lists.getByTitle("EstrategiaGestion").items.getById(itemEG[0].Id).update({
                                AsignadoAId: usuariosAsignados
                            })
                        }
    
                        if (arregloDatos.dato.lista === 'Flujo Tareas') {
                            let data = util.actualizarPropiedadesEstatus(datosVentana.datos, 'ID', idElemento, 'AsignadoA', arregloDatos.dato.usuarioAsignados)
                            let dataO = util.actualizarPropiedadesEstatus(datosOriginalVentana.datos, 'ID', idElemento, 'AsignadoA', arregloDatos.dato.usuarioAsignados)
    
                            datosVentana.datos = update(this.state.datosVentana.datos, { $splice: [[data.indice, 1, data.dato]] })
                            datosOriginalVentana.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[dataO.indice, 1, dataO.dato]] })
                            
                            if(filaSeleccionada.IdTarea.Subcluster !== null){
                                let filaIndice = datosVentana.datos.findIndex(datos => datos.IdTarea.Title === filaSeleccionada.IdTarea.Subcluster)
                                let filaIndiceO = datosOriginalVentana.datos.findIndex(datos => datos.IdTarea.Title === filaSeleccionada.IdTarea.Subcluster)

                                let newData = datosVentana.datos[filaIndice]
                                let newDataO = datosOriginalVentana.datos[filaIndiceO]
                                
                                usuariosAsignados = util.combinarIdAsignados(newData.AsignadoA, arregloDatos.dato.usuarioAsignados)
                                const newAsignados = util.combinarAsignados(newData.AsignadoA, arregloDatos.dato.usuarioAsignados)
                                newData.AsignadoA = newAsignados
                                newDataO.AsignadoA = newAsignados

                                datosVentana.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice, 1, newData]] })
                                datosOriginalVentana.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[filaIndiceO, 1, newDataO]] })

                                await currentWeb.lists.getByTitle(arregloDatos.dato.lista).items.getById(newData.ID).update({
                                    AsignadoAId: usuariosAsignados
                                })
                            }

                            opcionesFiltrosEncabezado = util.generarFiltrosEncabezado(idVentana, datosOriginalVentana, datosFPT, [], gruposUsuarioActual, usuarioActual, filtrosTabla)
                            this.setState({ datosVentana: datosVentana, datosOriginalVentana: datosOriginalVentana, opcionesFiltrosEncabezado: opcionesFiltrosEncabezado })
                        } else if (arregloDatos.dato.lista === 'Fechas paquete de trámites') {
                            //Actualiza el dataSource de trámites del trámite guardado
                            const dataFPT = util.actualizarPropiedadesEstatus(datosFPT, 'ID', idElemento, 'AsignadoA', arregloDatos.dato.usuarioAsignados)
                            datosFPT = update(this.state.datosFPT, { $splice: [[dataFPT.indice, 1, dataFPT.dato]] })
                            
                            //Obtiene los Asignados de los trámites pertenecientes al IdFlujo
                            let AsignadoAFPT = []
                            datosFPT.map((x)=>{
                                if(x.IdFlujoId === filaSeleccionada.IdFlujoId && x.AsignadoA !== undefined)
                                    x.AsignadoA.forEach((item)=>{
                                        AsignadoAFPT.push(item)
                                    })
                                    return x
                            })

                            const nuevoAsignadosId = util.combinarIdAsignados(AsignadoAFPT, arregloDatos.dato.usuarioAsignados)
                            const nuevoAsignados =  util.combinarAsignados(AsignadoAFPT, arregloDatos.dato.usuarioAsignados)
                            //Guarda los asignados en la tarea
                            await currentWeb.lists.getByTitle("Flujo Tareas").items.getById(filaSeleccionada.IdFlujoId).update({
                                AsignadoAId: nuevoAsignadosId
                            }).then(()=>{
                                //Asigna los asignados al state de datos y datos originales
                                const data = util.actualizarPropiedadesEstatus(datosVentana.datos, 'ID', filaSeleccionada.IdFlujoId, 'AsignadoA', nuevoAsignados)
                                const dataO = util.actualizarPropiedadesEstatus(datosOriginalVentana.datos, 'ID', filaSeleccionada.IdFlujoId, 'AsignadoA', nuevoAsignados)

                                datosVentana.datos = update(this.state.datosVentana.datos, { $splice: [[data.indice, 1, data.dato]] })
                                datosOriginalVentana.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[dataO.indice, 1, dataO.dato]] })
                            })

                            opcionesFiltrosEncabezado = util.generarFiltrosEncabezado(idVentana, datosOriginalVentana, datosFPT, [], gruposUsuarioActual, usuarioActual, filtrosTabla)
                            this.setState({ datosVentana: datosVentana, datosOriginalVentana: datosOriginalVentana, opcionesFiltrosEncabezado: opcionesFiltrosEncabezado })
                        }
                    }).catch(error => {
                        alert('Error al actualizar Flujo Tareas: ' + error)
                    })
                } else if (arregloDatos.tarea === 271) {
                    //Actividad ficticia
                    this.onCambiarVentana(idVentana, 'Cargando contenido generado...', "", "", "", '', usuarioActual, gruposUsuarioActual, seguridad)
                } else if (arregloDatos.tarea === 272) {
                    if (arregloDatos.dato.lista === 'Flujo Tareas') {
                        const data = util.actualizarPropiedadesEstatus(datosVentana.datos, 'ID', arregloDatos.dato.idElemento, 'Estatus', arregloDatos.dato.estatus)
                        const dataO = util.actualizarPropiedadesEstatus(datosOriginalVentana.datos, 'ID', arregloDatos.dato.idElemento, 'Estatus', arregloDatos.dato.estatus)
    
                        datosVentana.datos = update(this.state.datosVentana.datos, { $splice: [[data.indice, 1, data.dato]] })
                        datosOriginalVentana.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[dataO.indice, 1, dataO.dato]] })
                        this.setState({ datosVentana: datosVentana, datosOriginalVentana: datosOriginalVentana })
                    } else {
                        const data = util.actualizarPropiedadesEstatus(datosFPT, 'ID', arregloDatos.dato.idElemento, 'Estatus', arregloDatos.dato.estatus)
    
                        datosFPT = update(this.state.datosFPT, { $splice: [[data.indice, 1, data.dato]] })
                        this.setState({ datosFPT: datosFPT })
                    }
                } else if (arregloDatos.tarea === 289) {
                    //Edición de clúster de Marketing
                    const datosActualizar = arregloDatos.dato.datos.filter(x => x.Cambio)
                    if(datosActualizar.length>0){
                        let datosActualizados = util.inicializarArregloDatos(idVentana, this.state.datosVentana.datos.filter(x=> x.Orden >= idVentana && x.Orden <= idVentana + 1))
                        let datosActualizadosO = util.inicializarArregloDatos(idVentana, this.state.datosOriginalVentana.datos.filter(x=> x.Orden >= idVentana && x.Orden <= idVentana + 1))
                        let datosActualizadosMkt
                        
                        //Permite que se visualice cada item individual seleccionado en la ventana de edición de clúster
                        datosActualizar.forEach(dato => {
                            const filaIndice = this.state.datosVentana.datos.findIndex(datos => datos.ID === dato.ID)
                            const filaIndiceO = this.state.datosOriginalVentana.datos.findIndex(datos => datos.ID === dato.ID)
                            const filaIndiceMkt = this.state.Mkt.findIndex(datos => datos.ID === dato.ID)
        
                            let newData = this.state.datosVentana.datos[filaIndice]
                            let newDataO = this.state.datosOriginalVentana.datos[filaIndiceO]
                            let newDataMkt = this.state.Mkt[filaIndiceMkt]
                            newData.Visible = dato.Visible
                            newDataO.Visible = dato.Visible
                            newDataMkt.Visible = dato.Visible
        
                            datosActualizados.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice, 1, newData]] })
                            datosActualizadosO.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[filaIndiceO, 1, newDataO]] })
                            datosActualizadosMkt = update(this.state.Mkt, { $splice: [[filaIndiceMkt, 1, newDataMkt]] })
                        })

                        if(arregloDatos.dato.t287completa !== ''){
                            const filaIndice287 = this.state.datosVentana.datos.findIndex(datos => datos.IdTarea.ID === 287)
                            const filaIndice287O = this.state.datosOriginalVentana.datos.findIndex(datos => datos.IdTarea.ID === 287)

                            let newData287 = this.state.datosVentana.datos[filaIndice287]
                            let newData287O = this.state.datosOriginalVentana.datos[filaIndice287O]
                            newData287.Estatus = arregloDatos.dato.t287completa ? this.state.datosVentana.datos.find(x=> x.Estatus.ID === 3).Estatus : this.state.datosVentana.datos.find(x=> x.Estatus.ID === 1).Estatus
                            newData287O.Estatus = arregloDatos.dato.t287completa ? this.state.datosOriginalVentana.datos.find(x=> x.Estatus.ID === 3).Estatus : this.state.datosOriginalVentana.datos.find(x=> x.Estatus.ID === 1).Estatus

                            datosActualizados.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice287, 1, newData287]] })
                            datosActualizadosO.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[filaIndice287O, 1, newData287O]] })
                        }

                        if(arregloDatos.dato.t288completa !== ''){
                            const filaIndice288 = this.state.datosVentana.datos.findIndex(datos => datos.IdTarea.ID === 288)
                            const filaIndice288O = this.state.datosOriginalVentana.datos.findIndex(datos => datos.IdTarea.ID === 288)

                            let newData288 = this.state.datosVentana.datos[filaIndice288]
                            let newData288O = this.state.datosOriginalVentana.datos[filaIndice288O]
                            newData288.Estatus = arregloDatos.dato.t288completa ? this.state.datosVentana.datos.find(x=> x.Estatus.ID === 3).Estatus : this.state.datosVentana.datos.find(x=> x.Estatus.ID === 1).Estatus
                            newData288O.Estatus = arregloDatos.dato.t288completa ? this.state.datosOriginalVentana.datos.find(x=> x.Estatus.ID === 3).Estatus : this.state.datosOriginalVentana.datos.find(x=> x.Estatus.ID === 1).Estatus

                            datosActualizados.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice288, 1, newData288]] })
                            datosActualizadosO.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[filaIndice288O, 1, newData288O]] })
                        }

                        this.setState({ datosVentana: datosActualizados, datosOriginalVentana: datosActualizadosO, Mkt: datosActualizadosMkt })
                    }
                }
            }else{
                await currentWeb.lists.getByTitle(filaSeleccionada.Lista).items.getById(filaSeleccionada.ID).update({
                    EstatusId: arregloDatos.dato.ID,
                    EstatusAnteriorId: arregloDatos.dato.ID
                })
                .then(async ()=>{
                    if(filaSeleccionada.Lista === 'Flujo Tareas'){
                        if(filaSeleccionada.IdTarea.CreaBitacora === '1' || filaSeleccionada.IdTarea.TareaCrear !== '0'){
                            this.onCambiarVentana(idVentana, 'Cargando contenido generado...', "", "", "", '', usuarioActual, gruposUsuarioActual, seguridad)
                        }
                        else{
                            let esClusterMkt = false
                            let datosActualizadosMkt
                            let filaIndice = this.state.datosVentana.datos.findIndex(datos => datos.ID === filaSeleccionada.ID)
                            let filaIndiceO = this.state.datosOriginalVentana.datos.findIndex(datos => datos.ID === filaSeleccionada.ID)
                            let newData = this.state.datosVentana.datos[filaIndice]
                            let newDataO = this.state.datosOriginalVentana.datos[filaIndiceO]

                            newData.Estatus = arregloDatos.dato
                            newDataO.Estatus = arregloDatos.dato
                            let datosActualizados = util.inicializarArregloDatos(idVentana, this.state.datosVentana.datos.filter(x=> x.Orden >= idVentana && x.Orden <= idVentana + 1))
                            let datosActualizadosO = util.inicializarArregloDatos(idVentana, this.state.datosOriginalVentana.datos.filter(x=> x.Orden >= idVentana && x.Orden <= idVentana + 1))
                            datosActualizados.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice, 1, newData]] })
                            datosActualizadosO.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[filaIndiceO, 1, newDataO]] })

                            if(filaSeleccionada.IdTarea.ID === 20 || filaSeleccionada.IdTarea.ID === 28 || filaSeleccionada.IdTarea.ID === 33 || filaSeleccionada.IdTarea.ID === 38){
                                await currentWeb.lists.getByTitle("Terrenos").items
                                .select('ID', 'IdProyectoInversionId', 'NombredelTerreno2')
                                .filter('ID eq ' + filaSeleccionada.IdTerreno.ID)
                                .get().then(async (dato)=>{
                                    let terrenosModificar = this.state.datosVentana.datos.filter(datos => datos.IdTerreno !== undefined)
                                    terrenosModificar = terrenosModificar.filter(datos => datos.IdTerreno.Title === filaSeleccionada.IdTerreno.Title)
                                    terrenosModificar.forEach(terrenoModificar =>{
                                        if(terrenoModificar.IdTerreno.NombredelTerreno2 !== dato[0].NombredelTerreno2){
                                            filaIndice = this.state.datosVentana.datos.findIndex(datos => datos.ID === terrenoModificar.ID)
                                            filaIndiceO = this.state.datosOriginalVentana.datos.findIndex(datos => datos.ID === terrenoModificar.ID)

                                            newData = this.state.datosVentana.datos[filaIndice]
                                            newDataO = this.state.datosOriginalVentana.datos[filaIndiceO]

                                            newData.IdTerreno.NombredelTerreno2 = dato[0].NombredelTerreno2
                                            newDataO.IdTerreno.NombredelTerreno2 = dato[0].NombredelTerreno2

                                            datosActualizados.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice, 1, newData]] })
                                            datosActualizadosO.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[filaIndiceO, 1, newDataO]] })
                                        }
                                    })
                                })
                                .catch(error =>{
                                    alert('Error al consultar la lista Terrenos: ' + error)
                                })
                            }
                            if(filaSeleccionada.IdTarea.EsSubcluster === '0' && filaSeleccionada.IdTarea.Subcluster !== null){
                                esClusterMkt = true
                                const filaIndiceMkt = this.state.Mkt.findIndex(datos => datos.ID === filaSeleccionada.ID)
                                let newDataMkt = this.state.Mkt[filaIndiceMkt]
                                newDataMkt.Estatus = arregloDatos.dato
                                newDataMkt.EstatusAnterior= arregloDatos.dato
                                datosActualizadosMkt = update(this.state.Mkt, { $splice: [[filaIndiceMkt, 1, newDataMkt]] })

                                let tareasIncompletas = datosActualizadosMkt.filter(x=> x.IdTarea.Subcluster === filaSeleccionada.IdTarea.Subcluster && x.Visible)
                                tareasIncompletas = tareasIncompletas.length > 0 ? tareasIncompletas.some(x=> x.Estatus.ID !== 3) : false
                                const filaTareaCluster = this.state.datosVentana.datos.findIndex(datos => datos.IdTarea.Title === filaSeleccionada.IdTarea.Subcluster)
                                const filaTareaClusterO = this.state.datosOriginalVentana.datos.findIndex(datos => datos.IdTarea.Title === filaSeleccionada.IdTarea.Subcluster)

                                let tareaCluster = this.state.datosVentana.datos[filaTareaCluster]
                                let tareaClusterO = this.state.datosOriginalVentana.datos[filaTareaClusterO]

                                if(tareaCluster.Estatus.ID === 1 && !tareasIncompletas || tareaCluster.Estatus.ID === 3 && tareasIncompletas){
                                    await currentWeb.lists.getByTitle("Flujo Tareas").items.getById(tareaCluster.ID).update({
                                        EstatusId: !tareasIncompletas ? 3 : 1,
                                        EstatusAnteriorId: !tareasIncompletas ? 3 : 1
                                    }).then(()=>{
                                        tareaCluster.Estatus = !tareasIncompletas ? this.state.datosVentana.datos.find(x=> x.Estatus.ID === 3).Estatus : this.state.datosVentana.datos.find(x=> x.Estatus.ID === 1).Estatus
                                        tareaCluster.EstatusAnterior = tareaCluster.Estatus
                                        tareaClusterO.Estatus = !tareasIncompletas ? this.state.datosOriginalVentana.datos.find(x=> x.Estatus.ID === 3).Estatus : this.state.datosOriginalVentana.datos.find(x=> x.Estatus.ID === 1).Estatus
                                        tareaClusterO.EstatusAnterior = tareaClusterO.Estatus

                                        tareaCluster.datos = update(this.state.datosVentana.datos, { $splice: [[filaTareaCluster, 1, tareaCluster]] })
                                        tareaClusterO.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[filaTareaClusterO, 1, tareaClusterO]] })
                                    })
                                }
                            }
                            if(!esClusterMkt){
                                this.setState({ datosVentana: datosActualizados, datosOriginalVentana: datosActualizadosO })
                            }else{
                                this.setState({ datosVentana: datosActualizados, datosOriginalVentana: datosActualizadosO, Mkt: datosActualizadosMkt })
                            }
                        }
                    }
                    else if(filaSeleccionada.Lista === 'Fechas paquete de trámites'){
                        let filaIndice = this.state.datosFPT.findIndex(datos => datos.ID === filaSeleccionada.ID)
                        let newData = this.state.datosFPT[filaIndice]
                        newData.Estatus = arregloDatos.dato
                        let datosActualizadosFPT = update(this.state.datosFPT, { $splice: [[filaIndice, 1, newData]] })
                        const actualizarSubcluster = await util.cambiarEstatusCluster(filaSeleccionada.IdFlujoId, datosActualizadosFPT, this.state.datosVentana.datos)
                        if(actualizarSubcluster){
                            let filaIndice = this.state.datosVentana.datos.findIndex(datos => datos.ID === filaSeleccionada.IdFlujoId)
                            let filaIndiceO = this.state.datosOriginalVentana.datos.findIndex(datos => datos.ID === filaSeleccionada.IdFlujoId)
                            let newData = this.state.datosVentana.datos[filaIndice]
                            let newDataO = this.state.datosOriginalVentana.datos[filaIndiceO]

                            newData.Estatus = arregloDatos.dato
                            newDataO.Estatus = arregloDatos.dato
                            let datosActualizados = util.inicializarArregloDatos(idVentana, this.state.datosVentana.datos.filter(x=> x.Orden >= idVentana && x.Orden <= idVentana + 1))
                            let datosActualizadosO = util.inicializarArregloDatos(idVentana, this.state.datosOriginalVentana.datos.filter(x=> x.Orden >= idVentana && x.Orden <= idVentana + 1))
                            datosActualizados.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice, 1, newData]] })
                            datosActualizadosO.datos = update(this.state.datosOriginalVentana.datos, { $splice: [[filaIndiceO, 1, newDataO]] })

                            this.setState({ datosVentana: datosActualizados, datosOriginalVentana: datosActualizadosO, datosFPT: datosActualizadosFPT })
                        }else{
                            this.setState({ datosFPT: datosActualizadosFPT })
                        }
                    }
                })
                .catch(error => {
                    alert('Error al actualizar el estatus de la tarea: ' + error)
                })
            }
            //#endregion
        }
    }

    muiNormalEG = (fila, props, Columna, nombreTerreno, plus_icon, assignedTo_icon) => {
        return (
            <div className={fila.Tarea.ID === 271 ? "itemPersonal row" : "item row"}>
                <Columna titulo={fila.Tarea.ID + ': ' + (fila.Tarea.ID === 271 ? fila.NombreActividad : (fila.Tarea.EsCluster === '0' ? fila.Tarea.Title : (fila.IdRCDTT !== undefined ? fila.IdRCDTT.Title : fila.Tarea.Title)))} estilo='col-sm-5'
                    editable={fila.Tarea.ID === 271 ? true : (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35 && fila.Tarea.ID !== 271) ? false : true)}
                    idElemento={fila.Tarea.ID === 271 ? fila.Tarea.ID : (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? fila.Tarea.ID : fila.IdFlujoTareasId)}
                    esTarea={fila.Tarea.ID === 271 ? false : (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? false : true)}
                    terreno={nombreTerreno} abrirExterno={'0'} url={''}
                    datos={fila.Tarea.ID === 271 ? fila : (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? null : fila)} />
                <Columna titulo={<p style={{ textAlign: "center" }}>{fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'}</p>} estilo='col-sm-2' editable={false} />
                <Columna titulo={<p style={{ textAlign: "center" }}><img title={fila.AsignadoA === undefined ? 'Sin asignar' : (fila.AsignadoA.length > 0 ? util.obtenerAsignados(fila.AsignadoA) : 'Sin asignar')} src={fila.AsignadoA === undefined ? plus_icon : (fila.AsignadoA.length > 0 ? assignedTo_icon : plus_icon)} alt='assignedTo_icon' onClick={ fila.Tarea.ID !== 271 ? () => { this.onAbrirModal(nombreTerreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila, 4, "", "550px") } : null } /></p>} estilo='col-sm-2' editable={false} />
                <Columna estilo='col-sm-2' />
            </div>
        )
    }

    muiInnEG = (fila, props, Columna, nombreTerreno, plus_icon, assignedTo_icon) => {
        return (
            <div className={fila.Tarea.ID === 271 ? "itemInPersonal row" : "itemIn row"}>
                <Columna titulo={fila.Tarea.ID + ': ' + (fila.Tarea.ID !== 271 ? fila.IdRCDTT.Title : fila.NombreActividad)} estilo='col-sm-5'
                    editable={fila.Tarea.ID === 271 ? true : (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35 && fila.Tarea.ID !== 271) ? false : true)}
                    idElemento={fila.Tarea.ID === 271 ? fila.Tarea.ID : (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? fila.Tarea.ID : fila.IdFlujoTareasId)}
                    esTarea={fila.Tarea.ID === 271 ? false : (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? false : true)}
                    terreno={nombreTerreno} abrirExterno={'0'} url={''}
                    datos={fila.Tarea.ID === 271 ? fila : (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? null : fila)} />
                <Columna titulo={<p style={{ textAlign: "center" }}>{fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'}</p>} estilo='col-sm-2' editable={false} />
                <Columna titulo={<p style={{ textAlign: "center" }}><img title={fila.AsignadoA === undefined ? 'Sin asignar' : (fila.AsignadoA.length > 0 ? util.obtenerAsignados(fila.AsignadoA) : 'Sin asignar')} src={fila.AsignadoA === undefined ? plus_icon : (fila.AsignadoA.length > 0 ? assignedTo_icon : plus_icon)} alt='assignedTo_icon' onClick={ fila.Tarea.ID !== 271 ? () => { this.onAbrirModal(nombreTerreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila, 4, "", "550px") } : null} /></p>} estilo='col-sm-2' editable={false} />
                <Columna estilo='col-sm-2' />
            </div>
        )
    }

    filaNormal = (fila, attach_icon, more_details_icon, usuarioActual, webUrl, urlDescargarDocto, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual, editable) => {
        const esEditorLB = gruposUsuarioActual.some(gpo=> (gpo.NombreCortoGantt === fila.GrupoResponsable.NombreCortoGantt && gpo.AdminAreaGanttId.includes(usuarioActual.Id)) || fila.GrupoResponsable.NombreCortoGantt === 'TODOS')
        const esEditorFE = gruposUsuarioActual.some(gpo=> (gpo.NombreCortoGantt === fila.GrupoResponsable.NombreCortoGantt && (gpo.AdminAreaGanttId.includes(usuarioActual.Id) || gpo.RespAreaGanttId.includes(usuarioActual.Id))) || fila.GrupoResponsable.NombreCortoGantt === 'TODOS')
        return (
            <div className={fila.IdTarea.ID !== 271 ? "item row fixedPadding" : "itemPersonal row fixedPadding"}>
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={es}>
                    <Columna titulo={fila.IdTarea.ID + ': ' + (fila.IdTarea.ID !== 271 ? fila.IdTarea.Title : fila.NombreActividad)} id={fila.ID} estilo='col-sm-4' editable={editable} idElemento={fila.IdTarea.ID !== 271 ? fila.ID : fila.IdTarea.ID} esTarea={true} terreno={nombreTerreno} datos={fila} abrirExterno={fila.IdTarea.AbrirLink} url={fila.UrlTarea} />
                    <Columna titulo={fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img title={fila.AsignadoA === undefined ? ((esEditorLB || esEditorFE) && fila.IdTarea.ID !== 271 ? 'Sin asignar' : 'Sin permisos para editar') : (fila.AsignadoA.length > 0 ? util.obtenerAsignados(fila.AsignadoA) : 'Sin asignar')} src={fila.AsignadoA === undefined ? ((esEditorLB || esEditorFE) && fila.IdTarea.ID !== 271 ? plus_icon : plus_icon_disabled) : (fila.AsignadoA.length > 0 ? ((esEditorLB || esEditorFE) && fila.IdTarea.ID !== 271 ? assignedTo_icon : assignedTo_icon_disabled) : ((esEditorLB || esEditorFE) && fila.IdTarea.ID !== 271 ? plus_icon : plus_icon_disabled))} alt='assignedTo_icon' onClick={ (esEditorLB || esEditorFE) && fila.IdTarea.ID !== 271 ? () => { this.onAbrirModal(nombreTerreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila, this.state.idVentana, "", "550px") } : null } /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}>{esEditorLB && fila.IdTarea.ExisteEnGantt === '0' ? <DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={fila.LineaBase} onChange={fecha => this.onSeleccionarFecha(fecha, fila, 'LineaBase')} /> : util.spDate(fila.LineaBase)}</p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}>{esEditorFE ? <DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={fila.FechaEstimada} onChange={fecha => this.onSeleccionarFecha(fecha, fila, 'FechaEstimada')} /> : util.spDate(fila.FechaEstimada)}</p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<span style={{ textAlign: "center" }} className={fila.Estatus.Title.toLowerCase().replace(' ', '-') + ' badge badge-pill'}>{fila.Estatus.Title}</span>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={attach_icon} alt='attach_icon' onClick={() => window.open(webUrl + urlDescargarDocto)} title='Descargar archivos' /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={more_details_icon !== null ? <p style={{ textAlign: "center" }}><img src={(esEditorLB || esEditorFE) ? more_details_icon : more_details_icon_disabled} alt='more_details_icon' onClick={esEditorLB || esEditorFE ? () => { this.onAbrirModal(nombreTerreno, 272, false, null, null, { Tarea: { ID: 272 }, info: fila }, this.state.idVentana, "lg", "550px") } : null } /></p> : null} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={util.onShowStar(fila, usuarioActual)} alt='favoritos_icon' onClick={() => { this.onEstablecerFavorito(fila) }} /></p>} estilo='col-sm-1' editable={false} />
                </MuiPickersUtilsProvider>
            </div>
        )
    }

    filaAgrupador = (fila, usuarioActual, Columna, nombreTerreno, forbidden, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual) => {
        const esEditorLB = gruposUsuarioActual.some(gpo=> (gpo.NombreCortoGantt === fila.GrupoResponsable.NombreCortoGantt && gpo.AdminAreaGanttId.includes(usuarioActual.Id)) || fila.GrupoResponsable.NombreCortoGantt === 'TODOS')
        const esEditorFE = gruposUsuarioActual.some(gpo=> (gpo.NombreCortoGantt === fila.GrupoResponsable.NombreCortoGantt && (gpo.AdminAreaGanttId.includes(usuarioActual.Id) || gpo.RespAreaGanttId.includes(usuarioActual.Id))) || fila.GrupoResponsable.NombreCortoGantt === 'TODOS')
        return (
            <div className="item row fixedPadding">
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={es}>
                    <Columna titulo={fila.IdTarea.ID + ': ' + (fila.IdTarea.ID !== 271 ? fila.IdTarea.Title : fila.NombreActividad)} id={fila.ID} estilo='col-sm-4' editable={false} idElemento={fila.IdTarea.ID !== 271 ? fila.ID : fila.IdTarea.ID} esTarea={true} terreno={nombreTerreno} datos={fila} abrirExterno={fila.IdTarea.AbrirLink} url={fila.UrlTarea} />
                    <Columna titulo={fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img title={fila.AsignadoA === undefined ? 'Sin asignar' : (fila.AsignadoA.length > 0 ? util.obtenerAsignados(fila.AsignadoA) : 'Sin asignar')} src={fila.AsignadoA === undefined ? forbidden : (fila.AsignadoA.length > 0 ? assignedTo_icon : forbidden)} alt='assignedTo_icon' /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}>{esEditorLB && fila.IdTarea.ExisteEnGantt === '0' ? <DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={fila.LineaBase} onChange={fecha => this.onSeleccionarFecha(fecha, fila, 'LineaBase')} /> : util.spDate(fila.LineaBase)}</p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}>{esEditorFE ? <DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={fila.FechaEstimada} onChange={fecha => this.onSeleccionarFecha(fecha, fila, 'FechaEstimada')} /> : util.spDate(fila.FechaEstimada)}</p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<span style={{ textAlign: "center" }} className={fila.Estatus.Title.toLowerCase().replace(' ', '-') + ' badge badge-pill'}>{fila.Estatus.Title}</span>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={''} estilo='col-sm-1' editable={false} />
                    <Columna titulo={''} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={util.onShowStar(fila, usuarioActual)} alt='favoritos_icon' onClick={() => { this.onEstablecerFavorito(fila) }} /></p>} estilo='col-sm-1' editable={false} />
                </MuiPickersUtilsProvider>
            </div>
        )
    }

    filaIncidencia = (fila, num, attach_icon, more_details_icon, usuarioActual, webUrl, urlDescargarDocto, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, urlIncident) => {
        return (
            <div className="itemIn row">
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={es}>
                    <Columna titulo={num.Title + ': ' + num.MotivoCausaInc.Title} estilo='col-sm-4' />
                    <Columna titulo={num.AreaAsignadaInc !== undefined ? num.AreaAsignadaInc.NombreCorto : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img title={num.AsignadoAInc === undefined ? 'Sin asignar' : (num.AsignadoAInc.length > 0 ? util.obtenerAsignados(num.AsignadoAInc) : 'Sin asignar')} src={num.AsignadoAInc === undefined ? plus_icon : (num.AsignadoAInc.length > 0 ? assignedTo_icon : plus_icon)} alt='assignedTo_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 270, false, 'AsignadoA', num.AsignadoAInc !== undefined ? num.AsignadoAInc : [], fila, this.state.idVentana, "", "550px") }} /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}>{util.spDate(num.LineaBase)}</p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<span style={{ textAlign: "center" }} className={num.EdoInc.toLowerCase().replace(' ', '-') + ' badge badge-pill'}>{num.EdoInc}</span>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={hyperlink_icon} alt='hyperlink_icon' onClick={() => window.open(urlIncident, "_blank")} title='Ir a la incidencia' /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={more_details_icon_disabled} alt='more_details_icon' /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={util.onShowStar(num, usuarioActual)} alt='favoritos_icon' onClick={() => { this.onEstablecerFavorito(num) }} /></p>} estilo='col-sm-1' editable={false} />
                </MuiPickersUtilsProvider>
            </div>
        )
    }

    filaMarketing = (dato, attach_icon, more_details_icon, usuarioActual, webUrl, urlDescargarDocto, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual) => {
        const esEditorLB = gruposUsuarioActual.some(gpo=> (gpo.NombreCortoGantt === dato.GrupoResponsable.NombreCortoGantt && gpo.AdminAreaGanttId.includes(usuarioActual.Id)) || dato.GrupoResponsable.NombreCortoGantt === 'TODOS')
        const esEditorFE = gruposUsuarioActual.some(gpo=> (gpo.NombreCortoGantt === dato.GrupoResponsable.NombreCortoGantt && (gpo.AdminAreaGanttId.includes(usuarioActual.Id) || gpo.RespAreaGanttId.includes(usuarioActual.Id))) || dato.GrupoResponsable.NombreCortoGantt === 'TODOS')
        return (
            <div className={dato.IdTarea.ID !== 271 ? "itemIn row" : "itemInPersonal row"}>
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={es}>
                    <Columna titulo={dato.IdTarea.ID + ': ' + (dato.IdTarea.ID !== 271 ? dato.IdTarea.Title : dato.NombreActividad)} estilo='col-sm-4' editable={true} idElemento={dato.IdTarea.ID !== 271 ? dato.ID : dato.IdTarea.ID} esTarea={true} terreno={nombreTerreno} datos={dato} abrirExterno={dato.IdTarea.AbrirLink} url={dato.UrlTarea} />
                    <Columna titulo={dato.GrupoResponsable !== undefined ? dato.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img title={dato.AsignadoA === undefined ? ((esEditorLB || esEditorFE) && dato.IdTarea.ID !== 271 ? 'Sin asignar' : 'Sin permisos para editar') : (dato.AsignadoA.length > 0 ? util.obtenerAsignados(dato.AsignadoA) : 'Sin asignar')} src={dato.AsignadoA === undefined ? ((esEditorLB || esEditorFE) && dato.IdTarea.ID !== 271 ? plus_icon : plus_icon_disabled) : (dato.AsignadoA.length > 0 ? ((esEditorLB || esEditorFE) && dato.IdTarea.ID !== 271 ? assignedTo_icon : assignedTo_icon_disabled) : ((esEditorLB || esEditorFE) && dato.IdTarea.ID !== 271 ? plus_icon : plus_icon_disabled))} alt='assignedTo_icon' onClick={ (esEditorLB || esEditorFE) && dato.IdTarea.ID !== 271 ? () => { this.onAbrirModal(nombreTerreno, 270, false, 'AsignadoA', dato.AsignadoA !== undefined ? dato.AsignadoA : [], dato, this.state.idVentana, "", "550px") } : null } /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}>{esEditorLB && dato.IdTarea.ExisteEnGantt === '0' ? <DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={dato.LineaBase} onChange={fecha => this.onSeleccionarFecha(fecha, dato, 'LineaBase')} /> : util.spDate(dato.LineaBase)}</p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}>{esEditorFE ? <DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={dato.FechaEstimada} onChange={fecha => this.onSeleccionarFecha(fecha, dato, 'FechaEstimada')} /> : util.spDate(dato.FechaEstimada)}</p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<span className={dato.Estatus.Title.toLowerCase().replace(' ', '-') + ' badge badge-pill'}>{dato.Estatus.Title}</span>} style={{ textAlign: "right", paddingLeft: "30px" }} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={attach_icon} alt='attach_icon' onClick={() => window.open(webUrl + urlDescargarDocto)} title='Descargar archivos' /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={(esEditorLB || esEditorFE) ? more_details_icon : more_details_icon_disabled} alt='more_details_icon' onClick={esEditorLB || esEditorFE ? () => { this.onAbrirModal(nombreTerreno, 272, false, null, null, { Tarea: { ID: 272 }, info: dato }, this.state.idVentana, "lg", "550px")} : null } /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={util.onShowStar(dato, usuarioActual)} alt='favoritos_icon' onClick={() => { this.onEstablecerFavorito(dato) }} /></p>} estilo='col-sm-1' editable={false} />
                </MuiPickersUtilsProvider>
            </div>
        )
    }

    filaTramites = (fila, datoFPT, attach_icon, more_details_icon, usuarioActual, webUrl, urlDescargarDocto, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual) => {
        const esEditorLB = gruposUsuarioActual.some(gpo=> (gpo.NombreCortoGantt === fila.GrupoResponsable.NombreCortoGantt && gpo.AdminAreaGanttId.includes(usuarioActual.Id)) || fila.GrupoResponsable.NombreCortoGantt === 'TODOS')
        const esEditorFE = gruposUsuarioActual.some(gpo=> (gpo.NombreCortoGantt === fila.GrupoResponsable.NombreCortoGantt && (gpo.AdminAreaGanttId.includes(usuarioActual.Id) || gpo.RespAreaGanttId.includes(usuarioActual.Id))) || fila.GrupoResponsable.NombreCortoGantt === 'TODOS')
        fila.Lista = "Fechas paquete de trámites"
        return (
            <div className={fila.IdTarea.ID !== 271 ? "item row" : "itemPersonal row"}>
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={es}>
                    <Columna titulo={fila.IdTarea.ID + ': ' + (fila.IdTarea.ID !== 271 ? datoFPT.IdDocTramite.Title : fila.NombreActividad)} estilo='col-sm-4' editable={true} idElemento={fila.IdTarea.ID !== 271 ? fila.ID : datoFPT.IdFlujoId} esTarea={true} terreno={nombreTerreno} datos={datoFPT} abrirExterno={fila.IdTarea.AbrirLink} url={fila.UrlTarea} />
                    <Columna titulo={fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img title={datoFPT.AsignadoA === undefined ? ((esEditorLB || esEditorFE) && fila.IdTarea.ID !== 271 ? 'Sin asignar' : 'Sin permisos para editar') : (datoFPT.AsignadoA.length > 0 ? util.obtenerAsignados(datoFPT.AsignadoA) : 'Sin asignar')} src={datoFPT.AsignadoA === undefined ? ((esEditorLB || esEditorFE) && fila.IdTarea.ID !== 271 ? plus_icon : plus_icon_disabled) : (datoFPT.AsignadoA.length > 0 ? ((esEditorLB || esEditorFE) && fila.IdTarea.ID !== 271 ? assignedTo_icon : assignedTo_icon_disabled) : ((esEditorLB || esEditorFE) && fila.IdTarea.ID !== 271 ? plus_icon : plus_icon_disabled))} alt='assignedTo_icon' onClick={ (esEditorLB || esEditorFE) && fila.IdTarea.ID !== 271 ? () => { this.onAbrirModal(nombreTerreno, 270, false, 'AsignadoA', datoFPT.AsignadoA !== undefined ? datoFPT.AsignadoA : [], datoFPT, this.state.idVentana, "", "550px") } : null } /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}>{esEditorLB ? <DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={datoFPT.LineaBase} onChange={fecha => this.onSeleccionarFecha(fecha, datoFPT, 'LineaBase')} /> : util.spDate(fila.LineaBase)}</p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}>{esEditorFE ? <DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={datoFPT.FechaEstimada} onChange={fecha => this.onSeleccionarFecha(fecha, datoFPT, 'FechaEstimada')} /> : util.spDate(fila.FechaEstimada)}</p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<span style={{ textAlign: "center" }} className={datoFPT.Estatus.Title.toLowerCase().replace(' ', '-') + ' badge badge-pill'}>{datoFPT.Estatus.Title}</span>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={attach_icon} alt='attach_icon' onClick={() => window.open(webUrl + urlDescargarDocto)} title='Descargar archivos' /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={(esEditorLB || esEditorFE) ? more_details_icon : more_details_icon_disabled} alt='more_details_icon' onClick={ esEditorLB || esEditorFE ? () => { this.onAbrirModal(nombreTerreno, 272, false, null, null, { Tarea: { ID: 272 }, info: datoFPT }, this.state.idVentana, "lg", "550px")} : null} /></p>} estilo='col-sm-1' editable={false} />
                    <Columna titulo={<p style={{ textAlign: "center" }}><img src={util.onShowStar(datoFPT, usuarioActual)} alt='favoritos_icon' onClick={() => { this.onEstablecerFavorito(datoFPT) }} /></p>} estilo='col-sm-1' editable={false} />
                </MuiPickersUtilsProvider>
            </div>
        )
    }

    render() {
        const { idVentana, totalAdmin, totalNorm, totalProy, MACO, filtrosTabla, idTerreno, idProyecto, nombreTerreno, usuarioActual, gruposUsuarioActual, seguridad, tieneRFS, clusterToggle } = this.state
        
        const useStyles = makeStyles(theme => ({
            formControl: {
                minWidth: idVentana === 4 ? '100%' : '120%',
                textAlign: "left",
                marginTop: '3%'
            },
        }));

        const Cluster = (props) => {
            if (props.titulos.length > 0) {
                if (props.idVentana !== 4) {
                    //Otras ventanas
                    let datosV = util.filtrarDatosVentana(idVentana, props.datos, gruposUsuarioActual, usuarioActual.Id, filtrosTabla)
                    
                    let filaCluster = props.titulos.map((fila) => {
                        if (fila.cluster.IdTarea.TxtCluster !== 'Dummy' && datosV.some(x=> x.IdTarea.TxtCluster === fila.cluster.IdTarea.TxtCluster)) {
                            const existeAFActiva = datosV.some(x=>x.Orden === fila.cluster.Orden && x.IdTarea.ID === 271 && x.Estatus.ID !== 3)
                            let average = fila.cluster.IdTarea.EsCluster === '0' ? (fila.cluster.IdTarea.Orden !== 3.14 ? util.average(props, fila.cluster.IdTarea.Orden) : util.averageMkt(props.datos)) : util.averageFPT(this.state.datosFPT, fila.cluster.ID);
                            return (
                                <div key={fila.cluster.Orden} style={{ width: "98%" }}>
                                    <div className="row">
                                        {<input style={{ paddingLeft: "5px", marginTop: "13px", visibility: "hidden" }} type='checkbox' className='checkBox'></input>}
                                        <div className='titulo'>
                                            <div className="row">
                                                <div className="col-sm-9">
                                                    <p style={{ paddingLeft: "10px" }} onClick={() => this.onTogggleCluster(fila.cluster.IdTarea.Orden)}>
                                                        <img style={{ paddingRight: "1%" }} src={clusterToggle.find(x=> x.id === fila.cluster.IdTarea.Orden).abierto ? arrow_up_icon : arrow_down_icon} alt='arrow_up_icon'></img>
                                                        {fila.cluster.IdTarea.TxtCluster}
                                                    </p>
                                                </div>
                                                <div className="col-sm-1" style={{ paddingLeft: "30px" }}>
                                                    {fila.cluster.IdTarea.Orden === 3.14 ? <p className="numberCircle pad100"><img src={pen} alt='pen_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 289, false, null, null, { Tarea: { ID: 289 }, info: fila }, this.state.idVentana, "lg", "550px") }}></img></p>: <p></p>}
                                                </div>
                                                <div className="col-sm-1" style={{ paddingLeft: "30px" }}>
                                                    {existeAFActiva ? <p className="numberCircle pad100"><img src={disk} alt='disk_icon'></img></p>: null}
                                                </div>
                                                <div className="col-sm-1">
                                                    {average === 100 ? <p className="numberCircle pad100">{average}%</p> : <p className="numberCircle pad">{average}%</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {this.state.terrenos.map((terr) => {
                                        return util.bodyFunAll(terr, props, fila).length > 0 ?
                                            <div key={fila.cluster.IdTarea.Orden + '_' + terr } style={{ display: clusterToggle.find(x=> x.id === fila.cluster.IdTarea.Orden).abierto ? 'block' : 'none'}}>
                                                {terr !== "" ?
                                                    util.bodyFunAll(terr, props, fila).length > 2 ?
                                                        <div style={{ paddingLeft: "3%", width: "97%" }}>
                                                            <Body tituloTerreno={terr} datos={datosV} idCluster={fila.cluster.Orden} />
                                                        </div>
                                                        :
                                                        <div style={{ paddingLeft: "3%", width: "97%" }}>
                                                            <Body tituloTerreno={terr} datos={datosV} idCluster={fila.cluster.Orden} />
                                                        </div>
                                                    :
                                                    <div style={{ paddingLeft: "3%", width: "97%" }}>
                                                        <Body tituloTerreno={terr} datos={datosV} idCluster={fila.cluster.Orden} />
                                                    </div>
                                                }
                                                <div className='row empty-space'></div>
                                            </div>
                                            :
                                            <div key={fila.cluster.IdTarea.Orden + '_' + terr + '_0'} style={{ display: clusterToggle.find(x=> x.id === fila.cluster.IdTarea.Orden).abierto ? 'block' : 'none'}}>
                                                <div style={{ paddingLeft: "3%", width: "97%" }}>
                                                    <Body tituloTerreno={terr} datos={datosV} idCluster={fila.cluster.Orden} />
                                                </div>
                                            </div>
                                    })}
                                    <div className='row empty-space' style={{ display: clusterToggle.find(x=> x.id === fila.cluster.IdTarea.Orden).abierto ? 'none' : 'block'}}></div>
                                </div>
                            )
                        }
                    });
                    filaCluster = filaCluster.filter(x=> x !== undefined)
                    return  <div id='cluster' style={{ top: '17%', display:'block', height: '80%', position: "fixed", overflowX: 'hidden', overflowY:  'scroll', width: '99%' }} key={0} className="row justify-content-end">
                                {filaCluster.length > 0 ? filaCluster : <h2 className="col-sm-12 text-center align-self-center">No tiene actividades asignadas en esta ventana</h2>}
                            </div>
                } else {
                    //Ventana de estrategia de gestión
                    let filaCluster = props.titulos.map((fila) => {
                        if(props.datos.some(x=> x.Tarea.OrdenEG === fila.cluster.OrdenEG)){
                            return (
                                <div key={fila.cluster.OrdenEG} style={{ width: "98%" }}>
                                    <div className="row">
                                        <input id={fila.cluster.OrdenEG} name={fila.cluster.OrdenEG} onClick={() => util.toggleCheck(fila.cluster.OrdenEG, props.datos)} style={{ marginTop: "1%" }} type='checkbox' className='checkBox'></input>
                                        <div className='titulo'>
                                            <div className="row" name={fila.cluster.OrdenEG}>
                                                <div className="col-sm-12">
                                                    <p style={{ paddingLeft: "10px" }} onClick={() => this.onTogggleCluster(fila.cluster.OrdenEG)}>
                                                        <img style={{ paddingRight: "1%" }} src={clusterToggle.find(x=> x.id === fila.cluster.OrdenEG).abierto ? arrow_up_icon : arrow_down_icon} alt='arrow_up_icon'></img>
                                                        {fila.cluster.TxtCluster}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {this.state.terrenos.map((terr) => {
                                        return (util.bodyFunEG(terr, props, fila).length > 0 ?
                                            <div key={fila.cluster.OrdenEG + '_' + terr } style={{ display: clusterToggle.find(x=> x.id === fila.cluster.OrdenEG).abierto ? 'block' : 'none'}}>
                                                {terr !== "" ?
                                                    util.bodyFunEG(terr, props, fila).length > 2 ?
                                                        <div style={{ paddingLeft: "3%", width: "97%" }}>
                                                            <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.OrdenEG} esCheckable={fila.cluster.Checkable} />
                                                        </div>
                                                        :
                                                        <div style={{ paddingLeft: "3%", width: "97%" }}>
                                                            <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.OrdenEG} esCheckable={fila.cluster.Checkable} />
                                                        </div>
                                                    :
                                                    <div style={{ paddingLeft: "3%", width: "97%" }}>
                                                        <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.OrdenEG} esCheckable={fila.cluster.Checkable} />
                                                    </div>
                                                }
                                                <div className='row empty-space'></div>
                                            </div>
                                            :
                                            <div key={fila.cluster.OrdenEG + '_' + terr + '_0'}>
                                                <div style={{ paddingLeft: "3%", width: "97%" }}>
                                                    <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.OrdenEG} esCheckable={fila.cluster.Checkable} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div className='row empty-space' style={{ display: clusterToggle.find(x=> x.id === fila.cluster.OrdenEG).abierto ? 'none' : 'block'}}></div>
                                </div>
                            )
                        }
                    });
                    filaCluster = filaCluster.filter(x=> x !== undefined)
                    return <div id='cluster' style={{ paddingLeft: '1%', top: '17%', display:'block', height: '80%', position: "fixed", overflowX: 'hidden', overflowY: 'scroll', width: '99%' }} key={0} className="row justify-content-end">
                        {filaCluster}
                        <div className='row' style={{ backgroundColor: 'whitesmoke', bottom: 0, margin: 0, position: "fixed", width: '100%' }}>
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
                //e, terreno, id, esTarea, campo, valor, fila, ventana, size, padding
                
                if (props.titulo.length <= 20) {
                    if (util.contains(props.titulo, "RFS")) {
                        const modal = { abierto: true, id: props.idElemento, terreno: props.terreno, esTarea: props.esTarea, filaSeleccionada: props.datos, size: '', padding: '255px', usuarioActual: this.state.usuarioActual, gruposUsuarioActual: this.state.gruposUsuarioActual, url: webUrl }
                        const datos = { campo: null, valor: null }
                        return (
                            <div className={props.estilo} onClick={() => {props.abrirExterno === '0' ? this.onAbrirModal(props.terreno, props.idElemento, props.esTarea, null, null, props.datos, this.state.idVentana, "", "255px") : window.open(webUrl + props.url)}} >{props.titulo}</div>
                            //<div className={props.estilo} onClick={(e) => {props.abrirExterno === '0' ? <Modal abrir={modal} cerrar={this.onCerrarModal} evento={this.onActualizarDatos} datos={datos} /> : window.open(webUrl + props.url)}} >{props.titulo}</div>
                        );
                    }
                    else {
                        return (
                            <div className={props.estilo} onClick={() => { props.abrirExterno === '0' ? this.onAbrirModal(props.terreno, props.idElemento, props.esTarea, null, null, props.datos, this.state.idVentana, "lg", "550px") : window.open(webUrl + props.url)}} >{props.titulo}</div>
                        );
                    }
                }
                else {
                    return (
                        <div className={props.estilo} onClick={() => { props.abrirExterno === '0' ? this.onAbrirModal(props.terreno, props.idElemento, props.esTarea, null, null, props.datos, this.state.idVentana, "lg", "380px") : window.open(webUrl + props.url)}} >{props.titulo}</div>
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
                            return (
                                <div key={index} className={fila.estilo}>
                                    <p style={{ marginTop: "15%", paddingRight: "30px", textAlign: "center" }}>
                                    <img src={clear_icon} alt='clear_icon_icon' onClick={() => { this.onLimpiarFiltros()}} />
                                    </p>
                                </div>
                            )
                        }
                        else {
                            return (
                                <div key={index} className={fila.estilo} >
                                    <p style={{ marginTop: "15%" }}>
                                        {fila.titulo}
                                    </p>
                                </div>
                            )
                        }
                    case 'E. de G. autorizada':
                        return (
                            <div key={index} className={fila.estilo} >
                                <p style={{ marginTop: "5%", textAlign: "center" }}>
                                    <img style={{ marginRight: "5px" }} id='CargaEG' src={egupload_icon} alt='egupload_icon' onClick={() => { this.onAbrirModal(nombreTerreno, 269, false, null, null, { Tarea: { ID: 269 }, esRFS: this.props.rfs, ProyectoInversion: { id: this.state.idProyecto, title: this.state.proyectoTitulo }, Terreno: { id: this.state.idTerreno, title: this.state.terrenoTitulo } }, null, "", "115px") }}></img>
                                    {fila.titulo}
                                </p>
                            </div>
                        )
                    case 'Asignado a':
                        const valoreAsignadoA = this.state.opcionesFiltrosEncabezado[fila.interN.toLowerCase()]
                        const valuesAsignados = filtrosTabla[fila.titulo.toLowerCase().trim().replace('.', '').replace(' ', '')]
                        return (
                            <div key={index} className={fila.estilo} style={{ textAlign: "center" }}>
                                <FormControl className={classes.formControl}>
                                    <InputLabel id={"lbl" + fila.interN}>{fila.titulo}</InputLabel>
                                    <Select key={index}
                                        labelId="lblAsignado"
                                        autoWidth={true}
                                        id={"cmb" + fila.interN}
                                        multiple
                                        value={valuesAsignados}
                                        renderValue={() => '...'}
                                        name={fila.titulo + "|" + fila.Tipo}
                                        input={<Input />}
                                    >
                                        <MenuItem value=''><em id={fila.titulo.toLowerCase().trim().replace('.', '').replace(' ', '')} onClick={this.onOrdenar}>Ordenar ↑↓</em></MenuItem>
                                        {valoreAsignadoA.sort().map((valor) => (
                                            <MenuItem key={valor} value={valor}>
                                                <Checkbox name={fila.titulo.toLowerCase().trim().replace('.', '').replace(' ', '')} id={valor} checked={valuesAsignados.indexOf(valor) > -1} onChange={this.onHandleChange} />
                                                <ListItemText primary={valor} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        )
                    case 'Responsable':
                    case 'Estatus':
                    case 'Linea base':
                    case 'F. estimada':
                        const valoresRespEst = this.state.opcionesFiltrosEncabezado[fila.interN.toLowerCase()]
                        const valuesRespEst = filtrosTabla[fila.titulo.toLowerCase().trim().replace('.', '').replace(' ', '')]
                        return (
                            <div key={index} className={fila.estilo} style={{ textAlign: "center" }}>
                                <FormControl className={classes.formControl}>
                                    <InputLabel id={"lbl" + fila.interN}>{fila.titulo}</InputLabel>
                                    <Select key={index}
                                        labelId={"lbl" + fila.interN}
                                        autoWidth={true}
                                        id={"cmb" + fila.interN}
                                        multiple
                                        value={valuesRespEst}
                                        renderValue={() => '...'}
                                        name={fila.titulo + "|" + fila.Tipo}
                                        input={<Input />}
                                    >
                                        <MenuItem value=''><em id={fila.titulo.toLowerCase().trim().replace('.', '').replace(' ', '')} onClick={this.onOrdenar}>Ordenar ↑↓</em></MenuItem>
                                        {valoresRespEst.sort().map((valor) => (
                                            <MenuItem key={valor} value={valor}>
                                                <Checkbox name={fila.titulo.toLowerCase().trim().replace('.', '').replace(' ', '')} id={valor} checked={valuesRespEst.indexOf(valor) > -1} onChange={this.onHandleChange} />
                                                <ListItemText primary={valor} />
                                            </MenuItem>
                                        ))}
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
                        <div style={{ paddingLeft: "3%", width: "96%" }}>
                            <div>
                                <div className="row" style= {{ paddingLeft: idVentana === 4 ? '5%' : '0'}}>
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
                                    <div key={fila.ID} style={{ paddingLeft: "1%", width: "98%" }}>
                                        {fila.Tarea.EsSubcluster === "1" ?
                                            fila.IdRCDTT === undefined ?
                                                <div className="row">
                                                    {fila.Tarea.ID === 271 ? <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input> :
                                                        (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ?
                                                            <input id={props.idCluster + fila.ID} style={{ marginRight: "1%" }} type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e) => this.onSeleccionarItem(e, fila.ID)} disabled ></input> :
                                                            <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>)
                                                    }
                                                    {this.muiNormalEG(fila, props, Columna, nombreTerreno, plus_icon, assignedTo_icon)}
                                                </div> :
                                                <div key={fila.ID} style={{ paddingLeft: "2%" }}>
                                                    <div className="row">
                                                        {fila.Tarea.ID === 271 ? <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input> :
                                                            (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ?
                                                                <input id={props.idCluster + fila.ID} style={{ marginRight: "1%" }} type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e) => this.onSeleccionarItem(e, fila.ID)} disabled ></input> :
                                                                <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>)
                                                        }
                                                        {this.muiInnEG(fila, props, Columna, nombreTerreno, plus_icon, assignedTo_icon)}
                                                    </div>
                                                </div> :
                                            <div className="row">
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
                                                <div className="row">
                                                    {fila.Tarea.ID === 271 ? <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input> :
                                                        (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ?
                                                            <input id={props.idCluster + fila.ID} style={{ marginRight: "1%" }} type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e) => this.onSeleccionarItem(e, fila.ID)} disabled ></input> :
                                                            <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>)
                                                    }
                                                    {this.muiNormalEG(fila, props, Columna, nombreTerreno, plus_icon, assignedTo_icon)}
                                                </div> :
                                                <div key={fila.ID} style={{ paddingLeft: "30px", width: "100%" }}>
                                                    <div className="row">
                                                        {fila.Tarea.ID === 271 ? <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input> :
                                                            (props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ?
                                                                <input id={props.idCluster + fila.ID} style={{ marginRight: "1%" }} type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e) => this.onSeleccionarItem(e, fila.ID)} disabled ></input> :
                                                                <input style={{ visibility: "hidden", marginRight: "1%" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>)
                                                        }
                                                        {this.muiInnEG(fila, props, Columna, nombreTerreno, plus_icon, assignedTo_icon)}
                                                    </div>
                                                </div> :
                                            <div className="row">
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
                        <div>
                            <div className='terreno'>{props.tituloTerreno + ': ' + nombreTerreno}</div>
                            {filaBody}
                            <div key={filaBody.length} style={{ paddingLeft: "4%" }} onClick={() => { this.onAbrirModal(nombreTerreno, 271, false, null, null, { Tarea: { ID: 271 }, info: datosPITerr }, this.state.idVentana, "lg", "550px") }} >
                                <div className="row">
                                    <div className="row item-personal" style={{ width: "99%", backgroundColor: "#F8F8F8" }} >
                                        +  Agregar nueva actividad personal
                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        <div>
                            {filaBody}
                            {props.idCluster !== 4.11 ?
                                <div key={0} style={{ paddingLeft: "4%" }} onClick={() => { this.onAbrirModal(nombreTerreno, 271, false, null, null, { Tarea: { ID: 271 }, info: datosPITerr }, this.state.idVentana, "lg", "550px") }} >
                                    <div className="row">
                                        <div className="row item-personal" style={{ width: "99%", backgroundColor: "#F8F8F8" }} >
                                            +  Agregar nueva actividad personal
                                        </div>
                                    </div>
                                </div>
                            :null}
                        </div>
                    )
                    : null

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
                                            <div style={{ paddingLeft: "4%"}}>
                                                <div className="row">
                                                    {this.filaNormal(fila, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual, true)}
                                                </div>
                                            </div>
                                            :
                                            (fila.IdTarea.EsCluster === '1' && fila.IdTarea.EsSubcluster === '0' ?
                                                this.state.datosFPT.map((datoFPT) => {
                                                    return datoFPT.IdFlujoId === fila.ID && (gruposUsuarioActual.some(x=> x.ID === fila.GrupoResponsable.ID) || util.contieneAsignadoA(datoFPT.AsignadoA, usuarioActual.Id)) ?
                                                        <div style={{ paddingLeft: "4%" }}>
                                                            <div className="row">
                                                                {this.filaTramites(fila, datoFPT, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual)}
                                                            </div>
                                                        </div>
                                                    : null
                                                })
                                                :
                                                (fila.IdTarea.EsCluster === '1' && fila.IdTarea.EsSubcluster === '1' && fila.IdTarea.EsBitacora === '0' && fila.IdTarea.Subcluster !== null ?
                                                    <>
                                                        <div style={{ paddingLeft: "4%"}}>
                                                            <div className="row">
                                                                {this.filaAgrupador(fila, usuarioActual, Columna, nombreTerreno, forbidden, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual)}
                                                            </div>
                                                        </div>
                                                        {this.state.datosFPT.map((datoFPT) => {
                                                            return datoFPT.IdFlujoId === fila.ID && (gruposUsuarioActual.some(x=> x.ID === fila.GrupoResponsable.ID) || util.contieneAsignadoA(datoFPT.AsignadoA, usuarioActual.Id)) ?
                                                                <div style={{ paddingLeft: "5%" }}>
                                                                    <div className="row">
                                                                        {this.filaTramites(fila, datoFPT, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual, gruposUsuarioActual)}
                                                                    </div>
                                                                </div> : null
                                                        })}
                                                    </>
                                                    :
                                                    (fila.IdTarea.EsCluster === '1' && fila.IdTarea.EsSubcluster === '1' && fila.IdTarea.EsBitacora === '1' && fila.IdTarea.Subcluster !== null ?
                                                        <>
                                                            <div style={{ paddingLeft: "4%"}}>
                                                                <div className="row">
                                                                    {this.filaNormal(fila, hyperlink_icon, null, usuarioActual, webUrl, (this.state.bitacorasInfo.length> 0 ? "/sitepages/Bitacora.aspx?b=" + this.state.bitacorasInfo[0].BitacoraInc.ID : ''), Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual, false)}
                                                                </div>
                                                            </div>
                                                            {this.state.bitacorasInfo.map((num) => {
                                                                const urlIncident = webUrl + "/sitepages/Bitacora.aspx?b=" + num.BitacoraInc.ID + "#" + num.Title;
                                                                switch (fila.IdTarea.ID) {
                                                                    case 273:
                                                                        return ((num.BitacoraInc.Title.includes('BIT.ADU.') && (gruposUsuarioActual.some(x=> x.NombreCortoGantt === num.AreaAsignadaInc.NombreCorto) || util.contieneAsignadoA(num.AsignadoAInc, usuarioActual.Id)))
                                                                        || (num.BitacoraInc.Title.includes('BIT.ADU.') && filtrosTabla.ver.length > 0)?
                                                                            <div key={fila.ID} style={{ paddingLeft: "5%" }}>
                                                                                <div className="row">
                                                                                    {this.filaIncidencia(fila, num, hyperlink_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, urlIncident)}
                                                                                </div>
                                                                            </div> :null)
                                                                    case 274:
                                                                        return ((num.AreaAsignadaInc.NombreCorto === 'DT' && (num.MotivoCausaInc.ID === 3 || num.MotivoCausaInc.ID === 4 || num.MotivoCausaInc.ID === 5) && (gruposUsuarioActual.some(x=> x.NombreCortoGantt === num.AreaAsignadaInc.NombreCorto) || util.contieneAsignadoA(num.AsignadoAInc, usuarioActual.Id)))
                                                                        || (num.AreaAsignadaInc.NombreCorto === 'DT' && (num.MotivoCausaInc.ID === 3 || num.MotivoCausaInc.ID === 4 || num.MotivoCausaInc.ID === 5) && filtrosTabla.ver.length > 0) ?
                                                                            <div key={fila.ID} style={{ paddingLeft: "5%" }}>
                                                                                <div className="row">
                                                                                    {this.filaIncidencia(fila, num, hyperlink_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, urlIncident)}
                                                                                </div>
                                                                            </div> : null)
                                                                    default:
                                                                        break;
                                                                }
                                                            })}
                                                        </>
                                                        :
                                                        (fila.IdTarea.EsCluster === '1' && fila.IdTarea.EsSubcluster === '1' && fila.IdTarea.EsBitacora === '0' && fila.IdTarea.Subcluster === null ?
                                                            <>
                                                                <div style={{ paddingLeft: "4%"}}>
                                                                    <div className="row">
                                                                        {this.filaAgrupador(fila, usuarioActual, Columna, nombreTerreno, forbidden, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual)}
                                                                    </div>
                                                                </div>
                                                                {this.state.Mkt.map((dato) => {
                                                                    //const ocultoA = util.obtenerIdAsignados(dato.OcultoA)
                                                                    //if (!ocultoA.results.includes(usuarioActual.Id)) {
                                                                    if (dato.Visible) {
                                                                        switch (fila.IdTarea.ID) {
                                                                            case 287:
                                                                                return (dato.IdTarea.Subcluster === "Entrega para diseño de material de ventas" ?
                                                                                    <div key={dato.ID} style={{ paddingLeft: "5%" }}>
                                                                                        <div className="row">
                                                                                            {this.filaMarketing(dato, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual)}
                                                                                        </div>
                                                                                    </div> : null)
                                                                            case 288:
                                                                                return (dato.IdTarea.Subcluster === "Material de ventas fabricado" ?
                                                                                    <div key={dato.ID} style={{ paddingLeft: "5%" }}>
                                                                                        <div className="row">
                                                                                            {this.filaMarketing(dato, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual)}
                                                                                        </div>
                                                                                    </div> : null)
                                                                            default:
                                                                                break
                                                                        }
                                                                    }
                                                                })}
                                                            </>
                                                            : null
                                                        )
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
                                            <div style={{ paddingLeft: "4%"}}>
                                                <div className="row">
                                                    {this.filaNormal(fila, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual, true)}
                                                </div>
                                            </div>
                                            : (fila.IdTarea.EsCluster === '1' && fila.IdTarea.EsSubcluster === '0' ?
                                                this.state.datosFPT.map((datoFPT) => {
                                                    return datoFPT.IdFlujoId === fila.ID && (gruposUsuarioActual.some(x=> x.ID === fila.GrupoResponsable.ID) || util.contieneAsignadoA(datoFPT.AsignadoA, usuarioActual.Id)) ?
                                                        <div style={{ paddingLeft: "4%"}}>
                                                            <div className="row">
                                                                {this.filaTramites(fila, datoFPT, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual)}
                                                            </div>
                                                        </div> : null
                                                })
                                                : (fila.IdTarea.EsCluster === '1' && fila.IdTarea.EsSubcluster === '1' && fila.IdTarea.EsBitacora === '0' && fila.IdTarea.Subcluster !== null ?
                                                    <>
                                                        <div style={{ paddingLeft: "4%"}}>
                                                            <div className="row">
                                                                {this.filaAgrupador(fila, usuarioActual, Columna, nombreTerreno, forbidden, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual)}
                                                            </div>
                                                        </div>
                                                        {this.state.datosFPT.map((datoFPT) => {
                                                            return datoFPT.IdFlujoId === fila.ID && (gruposUsuarioActual.some(x=> x.ID === fila.GrupoResponsable.ID) || util.contieneAsignadoA(datoFPT.AsignadoA, usuarioActual.Id)) ?
                                                                <div style={{ paddingLeft: "5%" }}>
                                                                    <div className="row">
                                                                        {this.filaTramites(fila, datoFPT, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual)}
                                                                    </div>
                                                                </div> : null
                                                        })}
                                                    </>
                                                    :
                                                    (fila.IdTarea.EsCluster === '1' && fila.IdTarea.EsSubcluster === '1' && fila.IdTarea.EsBitacora === '1' && fila.IdTarea.Subcluster !== null ?
                                                        <>
                                                            <div style={{ paddingLeft: "4%"}}>
                                                                <div className="row">
                                                                    {this.filaNormal(fila, hyperlink_icon, null, usuarioActual, webUrl, (this.state.bitacorasInfo.length> 0 ? "/sitepages/Bitacora.aspx?b=" + this.state.bitacorasInfo[0].BitacoraInc.ID : ''), Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual, false)}
                                                                </div>
                                                            </div>
                                                            {this.state.bitacorasInfo.map((num) => {
                                                                const urlIncident = webUrl + "/sitepages/Bitacora.aspx?b=" + num.BitacoraInc.ID + "#" + num.Title;
                                                                switch (fila.IdTarea.ID) {
                                                                    case 273:
                                                                        return ((num.BitacoraInc.Title.includes('BIT.ADU.') && (gruposUsuarioActual.some(x=> x.NombreCortoGantt === num.AreaAsignadaInc.NombreCorto) || util.contieneAsignadoA(num.AsignadoAInc, usuarioActual.Id)))
                                                                        || (num.BitacoraInc.Title.includes('BIT.ADU.') && filtrosTabla.ver.length > 0)?
                                                                            <div key={fila.ID} style={{ paddingLeft: "5%" }}>
                                                                                <div className="row">
                                                                                    {this.filaIncidencia(fila, num, hyperlink_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, urlIncident)}
                                                                                </div>
                                                                            </div> :null)
                                                                    case 274:
                                                                        return ((num.AreaAsignadaInc.NombreCorto === 'DT' && (num.MotivoCausaInc.ID === 3 || num.MotivoCausaInc.ID === 4 || num.MotivoCausaInc.ID === 5) && (gruposUsuarioActual.some(x=> x.NombreCortoGantt === num.AreaAsignadaInc.NombreCorto) || util.contieneAsignadoA(num.AsignadoAInc, usuarioActual.Id)))
                                                                        || (num.AreaAsignadaInc.NombreCorto === 'DT' && (num.MotivoCausaInc.ID === 3 || num.MotivoCausaInc.ID === 4 || num.MotivoCausaInc.ID === 5) && filtrosTabla.ver.length > 0) ?
                                                                            <div key={fila.ID} style={{ paddingLeft: "5%" }}>
                                                                                <div className="row">
                                                                                    {this.filaIncidencia(fila, num, hyperlink_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, urlIncident)}
                                                                                </div>
                                                                            </div> : null)
                                                                    default:
                                                                        break;
                                                                }
                                                            })}
                                                        </>
                                                        : (fila.IdTarea.EsCluster === '1' && fila.IdTarea.EsSubcluster === '1' && fila.IdTarea.EsBitacora === '0' && fila.IdTarea.Subcluster === null ?
                                                            <>
                                                                <div style={{ paddingLeft: "4%"}}>
                                                                    <div className="row">
                                                                        {this.filaAgrupador(fila, usuarioActual, Columna, nombreTerreno, forbidden, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual)}
                                                                    </div>
                                                                </div>
                                                                {this.state.Mkt.map((dato) => {
                                                                    //const ocultoA = util.obtenerIdAsignados(dato.OcultoA)
                                                                    //if(!ocultoA.results.includes(usuarioActual.Id)){
                                                                    if (dato.Visible) {
                                                                        switch (fila.IdTarea.ID) {
                                                                            case 287:
                                                                                return (dato.IdTarea.Subcluster === "Entrega para diseño de material de ventas" ?
                                                                                    <div key={dato.ID} style={{ paddingLeft: "5%" }}>
                                                                                        <div className="row">
                                                                                            {this.filaMarketing(dato, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual)}
                                                                                        </div>
                                                                                    </div> : null)
                                                                            case 288:
                                                                                return (dato.IdTarea.Subcluster === "Material de ventas fabricado" ?
                                                                                    <div key={dato.ID} style={{ paddingLeft: "5%" }}>
                                                                                        <div className="row">
                                                                                            {this.filaMarketing(dato, attach_icon, more_details_icon, usuarioActual, webUrl, fila.UrlDocumentos, Columna, nombreTerreno, plus_icon, assignedTo_icon, DateFnsUtils, es, gruposUsuarioActual)}
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
                            <div className='terreno'>{props.tituloTerreno + ': ' + nombreTerreno}</div>
                            {filaBody}
                            <div key={filaBody.length} style={{ paddingLeft: "4%" }} onClick={() => { this.onAbrirModal(nombreTerreno, 271, false, null, null, { Tarea: { ID: 271 }, info: datosPITerr }, this.state.idVentana, "lg", "500px") }}>
                                <div className="row" >
                                    <div className="row item-personal" style={{ width: "99%", backgroundColor: "#F8F8F8" }} >
                                        +  Agregar nueva actividad personal
                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        <div>
                            {filaBody}
                            <div key={0} style={{ paddingLeft: "4%" }} onClick={() => { this.onAbrirModal(nombreTerreno, 271, false, null, null, { Tarea: { ID: 271 }, info: datosPITerr }, this.state.idVentana, "lg", "500px") }}>
                                <div className="row" >
                                    <div className="row item-personal" style={{ width: "99%", backgroundColor: "#F8F8F8" }} >
                                        +  Agregar nueva actividad personal
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                    : null
            }
        }

        return (
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <div className='col-sm-12'>
                    <Backdrop abierto={!this.state.backdrop.cargado} mensaje={this.state.backdrop.mensaje} />
                    {this.state.cargado ?
                        <div className='container-fluid'>
                            <Encabezado rfs={tieneRFS} idPITerr={!tieneRFS ? idProyecto : idTerreno} terreno={nombreTerreno}
                                maco={MACO} idVentana={this.state.idVentana} disabled={this.state.disabled} cambiarVentana={this.onCambiarVentana} totalAdmin={totalAdmin}
                                totalNorm={totalNorm} totalProy={totalProy} cambioMaco={this.onCambiarMaco} usuarioActual = {usuarioActual} gruposUsuarioActual = {gruposUsuarioActual}
                                filtros={filtrosTabla} seguridad= {seguridad} />
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