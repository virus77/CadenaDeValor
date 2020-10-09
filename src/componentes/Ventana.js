//#region Componentes
import React, { Component, createRef } from 'react';
import SeleccionRFS from './SeleccionRFS'
import ActividadFicticia from './ActividadFicticia'
import Detalle from './Detalle.js'
import EditarCluster from './EditarCluster.js'
import PeoplePicker from './PeoplePicker'
import UserPicker from './UserPicker'
import Backdrop from '../componentes/Backdrop';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
//#endregion
//#region Librerías externas
import update from 'immutability-helper';
import $ from "jquery";
import moment from 'moment';
import "@pnp/sp/sites";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups/web";
import "@pnp/sp/files";
import "@pnp/sp/files/web";
import "@pnp/sp/folders";
import "@pnp/sp/security";
//#endregion
//#region Scripts
import util from '../js/util'
import CRUD from '../js/CRUD';
//#endregion
//#region Estilos
import '../estilos/modal.css';
//#endregion

class Ventana extends Component {
    constructor(props) {
        super(props)
        this.form = createRef()
        this.validate = this.validate.bind(this)
        this.initialState = {
            backdrop: {abierto: true, mensaje: 'Cargando...'},
            idTarea: this.props.abrir.filaSeleccionada.Tarea !== undefined ? this.props.abrir.filaSeleccionada.Tarea.ID : (this.props.abrir.filaSeleccionada.IdTarea !== undefined ? this.props.abrir.filaSeleccionada.IdTarea.ID: this.props.abrir.filaSeleccionada.ID),
            campos: [],
            catalogoEstatus: [],
            usuarios: [],
            ejecutado: false,
            usuarioAsignados: props.abrir.id === 270 ? props.datos.valor : [],
            usuariosSelecionados: [],
            radioChecked: props.datos.valor,
            archivosCargados: [],
            lista: this.props.abrir.filaSeleccionada.Lista,
            esIframe: this.props.abrir.filaSeleccionada.IdTarea !== undefined ? this.props.abrir.filaSeleccionada.IdTarea.AbrirLink : 0,
            archivosValidos: ['jpg', 'jpeg', 'png', 'pdf', 'zip', 'rar', 'xls', 'xlsx'],
            catalogo: [],
            camposLista: [],
            refs: {},
            datosTramite: [],
            editablePorUsuario: true,
            contieneAdjunto : false
        }
        this.onGuardar = this.onGuardar.bind(this);
        this.onEnviar = this.onEnviar.bind(this);
        this.state = this.initialState
    }
    //#region Eventos de botones
    async onGuardar(datos) {
        const {webs} = this.props
        this.setState({backdrop: {abierto: true, mensaje: 'Guardando...'}})
        //Si los datos de la ventana no son de una tarea de Flujo tareas...
        if (!this.props.abrir.esTarea) {
            switch (this.props.abrir.id) {
                //Establece el MACO para el/los terrenos
                case 268:
                    if (!this.props.rfs) {
                        const items = await webs.cdt.lists.getByTitle("Terrenos").items.filter('IdProyectoInversionId eq ' + this.props.idPITerr + ' and Empadronamiento eq null').get();

                        if (items.length > 0) {
                            for (var i = 0; i < items.length; i++) {
                                await CRUD.updateListItem(webs.cdt, "Terrenos", items[i].ID, { MACO: this.state.radioChecked })
                            }
                        }
                        this.props.evento({ tarea: 0, dato: this.state.radioChecked })
                    } else {
                        const items = await webs.cdt.lists.getByTitle("Terrenos").items.filter('ID eq ' + this.props.idPITerr).get();

                        if (items.length > 0) {
                            await CRUD.updateListItem(webs.cdt, "Terrenos", items[0].ID, { MACO: this.state.radioChecked })
                        }
                        this.props.evento(this.state.radioChecked)
                        this.onCerrar()
                    }
                    break;
                case 270:
                    //Establece los usuarios asignados del modal de Asignado a
                    if (this.state.campos[0].valor.length > 0) {
                        this.props.evento({ tarea: 0, dato: this.state })
                    }
                    break;
                case 271:
                    //Establece la actividad ficticia creada en el cluster correspondiente
                    this.props.evento({ tarea: 271, dato: datos })
                    break;
                case 272:
                    //Establece el nuevo estatus en la actividad correspondiente
                    this.props.evento({ tarea: 272, dato: datos })
                    break;
                case 289:
                    //Establece las actividades que puede ver el usuario en el clúster de marketing
                    this.props.evento({ tarea: 289, dato: datos })
                    break;
                default:
                    break;
            }
            this.onCerrar()
        }
        else {
            let { camposLista } = this.state
            //Si los datos de la ventana  sí son de una tarea de Flujo tareas...
            //let camposLista = util.groupBy(this.state.camposLista, 'listaPrincipal')
            const listas = []
            for (let prop in camposLista) {
                listas.push(prop)
            }

            await this.guardarDatos(listas, camposLista).then(()=>{
                if(this.props.abrir.filaSeleccionada.Lista === 'Flujo Tareas'){
                    this.props.evento({ tarea: this.props.abrir.filaSeleccionada.IdTarea.ID, dato: this.state.catalogoEstatus.find(x=> x.ID === 2), contieneAdjunto: this.state.contieneAdjunto })
                }else{
                    this.props.evento({ tarea: this.state.datosTramite[0].IdTareaId, dato: this.state.catalogoEstatus.find(x=> x.ID === 2), contieneAdjunto: this.state.contieneAdjunto })
                }
                this.onCerrar()
            })
        }
    }

    async onEnviar(datos) {
        const {webs} = this.props
        const { idTarea, radioChecked } = this.state
        switch (idTarea) {
            case 24:
                if (radioChecked !== null) {
                    const idNuevaTarea = this.state.radioChecked === 'Subdivisión' ? 25 : (this.state.radioChecked === 'Relotificación' ? 35 : (this.state.radioChecked === 'Fusión' ? 30 : 0))
                    const totalTerrenos = await this.obtenerTotalTerrenosPI()
                    let guardar = true
                    let mensajeError = ''
                    //Valida si existe la cantidad suficiente de terrenos para generar una tarea
                    switch (idNuevaTarea) {
                        case 0:
                            guardar = true
                            mensajeError = ''
                            break;
                        case 25:
                            if (totalTerrenos < 1) {
                                guardar = false
                                mensajeError = 'El proyecto de inversión debe tener por lo menos 1 terreno para poder subdividir.'
                            } else {
                                guardar = true
                                mensajeError = ''
                            }
                            break;
                        case 30:
                        case 35:
                            if (totalTerrenos <= 1) {
                                guardar = false
                                mensajeError = 'El proyecto de inversión debe tener por lo menos 2 terrenos para poder ' + (idNuevaTarea === 30 ? 'fusionar.' : 'relotificar.')
                            } else {
                                guardar = true
                                mensajeError = ''
                            }
                            break;
                        default:
                            guardar = false
                            mensajeError = 'Debe seleccionar una opción'
                            break;
                    }
                    if (guardar) {
                        this.setState({backdrop: {abierto: true, mensaje: 'Guardando...'}})
                        //Guarda el tipo de RFSN seleccionado
                        const json = {
                            IdProyectoInversionId: this.props.abrir.filaSeleccionada.ProyectoInversion.ID,
                            IdFlujoId: this.props.abrir.id, FRSN: this.state.radioChecked
                        }
                        await CRUD.createListItem(webs.cdt, this.state.campos[0].ListaDeGuardado, json).then(async () => {
                            //Actualiza el estatus del elemento de la EG
                            await CRUD.updateListItem(webs.cdt, "EstrategiaGestion", this.props.abrir.filaSeleccionada.ID, {EstatusId: 3}).then(async () => {
                                //Establece la tarea como Enviada
                                await CRUD.updateListItem(webs.cdt, "Flujo Tareas", this.props.abrir.id, {EstatusId: 3, EstatusAnteriorId: 3}).then(async () => {
                                    //Verifica si se creará una nueva tarea, dependiento del valor de RFNS seleccionado
                                    if (idNuevaTarea !== 0) {
                                        const datosNuevaTarea = await webs.cdt.lists.getByTitle('Tareas').items.getById(idNuevaTarea).get();
                                        //Crea la nueva tarea en Flujo Tareas
                                        const jsonFT = {
                                            IdProyectoInversionId: this.props.abrir.filaSeleccionada.ProyectoInversion.ID,
                                            IdTareaId: idNuevaTarea,
                                            NivelId: datosNuevaTarea.NivelId,
                                            GrupoResponsableId: datosNuevaTarea.GrupoId,
                                            AsignadoA: { results: [] },
                                            EstatusId: 1,
                                            EstatusAnteriorId: 1,
                                            Visible: true
                                        }
                                        await CRUD.createListItem(webs.cdt, "Flujo Tareas", jsonFT).then(async result => {
                                            //Crea el elemento en la estrategia de gestión
                                            const jsonEG = {
                                                ProyectoInversionId: this.props.abrir.filaSeleccionada.ProyectoInversion.ID,
                                                TareaId: idNuevaTarea,
                                                GrupoResponsableId: datosNuevaTarea.GrupoId,
                                                Seleccionado: false,
                                                IdFlujoTareasId: result.data.Id,
                                                EstatusId: 1,
                                                OrdenEG: datosNuevaTarea.OrdenEG
                                            }
                                            await CRUD.createListItem(webs.cdt, "EstrategiaGestion", jsonEG).catch(error => {
                                                alert('ERROR AL CREAR LA TAREA ' + idNuevaTarea + ' EN LA E.G.: ' + error)
                                            })
                                            //Establecer estado para nueva tarea creada
                                            //Manda el ID de la tarea actual y el dato para saber si deberá genera la EG
                                            this.props.evento({ tarea: this.props.abrir.filaSeleccionada.Tarea.ID, dato: false })
                                        }).catch(error => {
                                            alert('ERROR AL CREAR LA TAREA ' + idNuevaTarea + ' : ' + error)
                                        })
                                    } else {
                                        //Sino pasa por RFS (Ninguno), crea el resto de la EG
                                        //Manda el ID de la tarea actual y el dato para saber si deberá genera la EG
                                        this.props.evento({ tarea: idTarea, dato: true })
                                    }
                                }).catch(error => {
                                    alert('ERROR AL ACTUALIZAR LA TAREA ' + this.props.abrir.id + ' : ' + error)
                                })
                            }).catch(error => {
                                alert('ERROR AL ACTUALIZAR EL ELEMENTO ' + this.props.abrir.filaSeleccionada.ID + ' EN LA E.G: ' + error)
                            })
                        }).catch(error => {
                            alert('ERROR AL INTENTAR GUARDAR EN LA LISTA  ' + this.state.campos[0].ListaDeGuardado + ': ' + error)
                        })
                        this.props.cerrar();

                    } else {
                        alert(mensajeError)
                    }
                } else {
                    alert('Seleccione un valor')
                }
                break;
            case 25:
            case 30:
            case 35:
                this.setState({backdrop: {abierto: true, mensaje: 'Guardando...'}})
                //Actualiza el estatus del elemento de la EG
                await CRUD.updateListItem(webs.cdt, "EstrategiaGestion", this.props.abrir.filaSeleccionada.ID, {EstatusId: 3}).then(() => {
                    //Manda el ID de la tarea actual y el dato para saber si deberá genera la EG
                    this.props.evento({ tarea: idTarea, dato: datos })
                    this.props.cerrar();
                }).catch(error => {
                    alert('ERROR AL ACTUALIZAR EL ELEMENTO ' + this.props.abrir.filaSeleccionada.ID + ' EN LA E.G: ' + error)
                })
                break;
            default:
                const valido = this.form.current.reportValidity()
                if(valido){
                    this.setState({backdrop: {abierto: true, mensaje: 'Guardando...'}})
                    let {camposLista} = this.state
                    const listas = []
                    for (let prop in camposLista) {
                        listas.push(prop)
                    }

                    await this.guardarDatos(listas, camposLista).then(async () => {
                        if (this.props.abrir.filaSeleccionada.Lista === 'Flujo Tareas') {
                            await util.crearBitacoras(this.props.abrir.filaSeleccionada.IdTarea.ID, this.props.abrir.filaSeleccionada.IdTerreno, this.props.abrir.filaSeleccionada.IdProyectoInversion, this.props.abrir.filaSeleccionada.IdTarea.TareaCrear, webs)
                            this.props.evento({ tarea: this.props.abrir.filaSeleccionada.ID, dato: this.state.catalogoEstatus.find(x=> x.ID === 3), contieneAdjunto: this.state.contieneAdjunto })
                        }else{
                            this.props.evento({ tarea: this.state.datosTramite[0].IdTareaId, dato: this.state.catalogoEstatus.find(x=> x.ID === 3), contieneAdjunto: this.state.contieneAdjunto })
                        }
                        this.onCerrar()
                    })
                    this.onCerrar()
                } else {
                    this.form.current.reportValidity()
                }
                break;
        }
    }

    guardarDatos = async (listas, camposLista) => {
        const {webs} = this.props
        await util.asyncForEach(listas, async lista => {
            if (lista !== 'Documentos' && lista !== 'null' && lista !== '0') {
                let newCamposLista = camposLista[lista]
                let json = {}

                let idElemento = util.obtenerIdActualizarPorLista(this.props.abrir.filaSeleccionada, newCamposLista[0].listaPrincipalIN)
                if (lista === 'Relación Fechas Aprobación Terreno') {
                    await util.asyncForEach(newCamposLista, async campoLista => {
                        json = {}
                        const filaIndice = this.state.campos.findIndex(campo => campo.TituloInternoDelCampo === campoLista.campo)
                        let campoRef = this.state.campos[filaIndice]
                        campoLista.valor = campoRef.valor
                        const valor = util.returnDataByFieldType(campoRef.valor, campoLista.tipo)
                        if (valor !== '') {
                            json.Title = idElemento.toString()
                            json.Fecha = valor
                            json.Campo = campoLista.campo
                        }
                        const datos = await webs.cdt.lists.getByTitle(lista).items.select('ID', 'Fecha', 'Campo').filter("Title eq '" + idElemento + "' and Campo eq '" + campoLista.campo + "'").get()
                        if (datos.length === 0) {
                            if (Object.keys(json).length > 0) {
                                await CRUD.createListItem(webs.cdt, lista, json).catch(error => {
                                    alert('ERROR AL INSERTAR EN LA LISTA ' + lista + ': ' + error)
                                })
                            }
                        }else{
                            if(Object.keys(json).length > 0){
                                await CRUD.updateListItem(webs.cdt, lista, datos[0].ID, json).catch(error=>{
                                    alert('ERROR AL ACTUALIZAR LA LISTA ' + lista + ': ' + error)
                                })
                            }
                        }
                    })
                } else if (lista === 'Fechas paquete de trámites') {
                    const tramites = this.state.campos.filter(x => x.Tramite === 'Trámite')
                    await util.asyncForEach(tramites, async tramite => {
                        if (this.props.abrir.filaSeleccionada.Lista === 'Flujo Tareas') { json = { 'IdFlujoId': idElemento, 'Title': this.props.abrir.filaSeleccionada.IdTerreno.Title, 'IdDocTaskId': tramite.IdRTD, 'IdDocTramiteId': tramite.IdTramite } }
                        else if (this.props.abrir.filaSeleccionada.Lista === 'Fechas paquete de trámites') { json = { 'IdFlujoId': idElemento, 'Title': this.state.datosTramite[0].IdTerreno.Title, 'IdDocTaskId': tramite.IdRTD, 'IdDocTramiteId': tramite.IdTramite } }
                        const camposFPT = newCamposLista.filter(x => x.campo.includes(tramite.TituloInternoDelCampo))
                        await util.asyncForEach(camposFPT, async campoFPT => {
                            const filaIndice = this.state.campos.findIndex(campo => campo.TituloInternoDelCampo === campoFPT.campo)
                            let campoRef = this.state.campos[filaIndice]
                            if(campoFPT.tipo === 'CheckBox' && campoRef.valor === undefined){
                                campoRef.valor = false
                            }
                            json[util.obtenerNodoJSON(campoFPT.campo, 'IN')] = campoFPT.campo
                            if(campoRef.valor !== null && campoRef.valor !== undefined){
                                const valor = util.returnDataByFieldType(campoRef.valor , campoFPT.tipo)
                                if(valor !== ''){
                                    json[util.obtenerNodoJSON(campoFPT.campo, 'Fecha')] = valor
                                }
                            }
                        })

                        const datos = await webs.cdt.lists.getByTitle(lista).items
                        .select('FechaDeIngreso', 'FechaDeLaPrevencion', 'FechaDeResolucion', 'FechaVigencia', 'InternalNameFdeI', 'InternalNameFdeI',
                            'InternalNameFdeLaP', 'InternalNameFdeR', 'InternalNameFdeV', 'IdDocTaskId', 'IdDocTramiteId', 'ID')
                        .filter('IdFlujoId eq ' + idElemento + ' and IdDocTaskId eq ' + tramite.IdRTD + ' and IdDocTramiteId eq ' + tramite.IdTramite).get()

                        if(datos.length === 0){
                            if(Object.keys(json).length > 0){
                                await CRUD.createListItem(webs.cdt, lista, json).catch(error => {
                                    alert('ERROR AL INSERTAR EN LA LISTA ' + lista + ': ' + error)
                                })
                            }
                        }else{
                            if(Object.keys(json).length > 0){
                                await CRUD.updateListItem(webs.cdt, lista, datos[0].ID, json).catch(error=>{
                                    alert('ERROR AL ACTUALIZAR LA LISTA ' + lista + ': ' + error)
                                })
                            }
                        }
                    })
                } else if (lista === 'Relación DRO´s Proyectos deptos') {
                    await util.asyncForEach(newCamposLista, async campoLista => {
                        json = {}
                        const filaIndice = this.state.campos.findIndex(campo => campo.TituloInternoDelCampo === campoLista.campo)
                        let campoRef = this.state.campos[filaIndice]
                            if(campoRef.valor !== null && campoRef.valor !== undefined){    
                            campoLista.valor = campoRef.valor
                            const valor = util.returnDataByFieldType(campoRef.valor, campoLista.tipo)
                            if(valor >0){
                                json.Title = this.props.abrir.filaSeleccionada.IdTerreno.Title
                                json.CategoriaId = valor
                                json.IdResponsable = campoLista.campo
                            }
                            const datos = await webs.cdt.lists.getByTitle(lista).items.filter("Title eq '" + this.props.abrir.filaSeleccionada.IdTerreno.Title + "' and IdResponsable eq '" + campoLista.campo + "'")
                            .get()
                            .catch(error=>{
                                alert('ERROR AL CONSULTAR DATOS EN LA LISTA ' + lista + ': ' + error)
                            })
                            if(datos.length === 0){
                                if(Object.keys(json).length > 0){
                                    await CRUD.createListItem(webs.cdt, lista, json).catch(error => {
                                        alert('ERROR AL INSERTAR EN LA LISTA ' + lista + ': ' + error)
                                    })
                                }
                            }else{
                                if(Object.keys(json).length > 0){
                                    await CRUD.updateListItem(webs.cdt, lista, datos[0].ID, json).catch(error=>{
                                        alert('ERROR AL ACTUALIZAR LA LISTA ' + lista + ': ' + error)
                                    })
                                }
                            }
                        }
                    })
                } else if (lista === 'Relación Bancos Proyectos Deptos') {
                    const datos = await webs.cdt.lists.getByTitle(lista).items.filter("IdFlujo eq " + this.props.abrir.filaSeleccionada.ID)
                    .get()
                    .catch(error => {
                        alert('ERROR AL CONSULTAR DATOS EN LA LISTA ' + lista + ': ' + error)
                    })

                    if(datos.length > 0){
                        if(Object.keys(json).length > 0){
                            await util.asyncForEach(datos, async dato =>{
                                await CRUD.deleteListItem(webs.cdt, lista, dato.Id)
                            })
                        }
                    }
                    await util.asyncForEach(newCamposLista, async (campoLista) => {
                        campoLista.valor = this.state.campos.find(x => x.TituloInternoDelCampo === campoLista.campo).valor
                        if(campoLista.valor !== undefined){
                            await util.asyncForEach(campoLista.valor, async (valor) => {
                                json = {}
                                if (valor > 0) {
                                    json.Title = this.props.abrir.filaSeleccionada.IdTerreno.Title
                                    json.IdFlujo = this.props.abrir.filaSeleccionada.ID
                                    json.NombreDelBancoId = valor
                                }
                                if (Object.keys(json).length > 0) {
                                    await CRUD.createListItem(webs.cdt, lista, json).catch(error => {
                                        alert('ERROR AL INSERTAR EN LA LISTA ' + lista + ': ' + error)
                                    })
                                }
                            })
                        }
                    })
                } else if(lista === 'RelacionTerrenoInteresados'){
                    await util.asyncForEach(newCamposLista, async campoLista => {
                        json = {}
                        const filaIndice = this.state.campos.findIndex(campo => campo.TituloInternoDelCampo === campoLista.campo)
                        let campoRef = this.state.campos[filaIndice]
                        campoLista.valor = campoRef.valor
                        if (campoRef.valor !== '' && campoRef.valor !== null && campoRef.valor !== undefined) {
                            json.IdFlujoId = idElemento
                            json.Title = campoLista.campo
                            json.InteresadosId = campoLista.tipo === 'PeoplePicker' ? util.obtenerIdAsignados(campoRef.valor) : (campoRef.valor.Id !== undefined ? { results: [campoRef.valor.Id] } : { results: [] })
                            
                            const datos = await webs.cdt.lists.getByTitle(lista).items
                            .select('ID', 'IdFlujoId', 'Title', 'Interesados/Id', 'Interesados/Title')
                            .filter("IdFlujoId eq " + idElemento + " and Title eq '" + campoLista.campo + "'")
                            .expand('Interesados')
                            .get()
                            .catch(error => {
                                alert('ERROR AL CONSULTAR DATOS EN LA LISTA ' + lista + ': ' + error)
                            })
                            if (datos.length === 0) {
                                if (Object.keys(json).length > 0) {
                                    await CRUD.createListItem(webs.cdt, lista, json).catch(error => {
                                        alert('ERROR AL INSERTAR EN LA LISTA ' + lista + ': ' + error)
                                    })
                                }
                            }else{
                                if(Object.keys(json).length > 0){
                                    await CRUD.updateListItem(webs.cdt, lista, datos[0].ID, json).catch(error=>{
                                        alert('ERROR AL ACTUALIZAR LA LISTA ' + lista + ': ' + error)
                                    })
                                }
                            }
                        }
                    })
                } else {
                    newCamposLista.map((campoLista) => {
                        const filaIndice = this.state.campos.findIndex(campo => campo.TituloInternoDelCampo === campoLista.campo)
                        let campoRef = this.state.campos[filaIndice]
                        if(campoRef.valor !== null && campoRef.valor !== undefined){
                            campoLista.valor = campoRef.valor
                            if(campoLista.tipo === 'CheckBox'){
                                json[campoLista.campo] = util.returnDataByFieldType(campoRef.valor, campoLista.tipo)
                            }
                            else if(campoLista.valor !== ''){
                                json[campoLista.campo] = util.returnDataByFieldType(campoRef.valor, campoLista.tipo)
                            }
                            return campoLista
                        }
                    })
                    if((this.state.idTarea === 20 || this.state.idTarea === 28 || this.state.idTarea === 33 || this.state.idTarea === 38) && lista === 'Terrenos'){
                        if(json.Calle !== undefined && json.NoExterior !== undefined){
                            json.NombredelTerreno2 = json.Calle + ' - ' + json.NoExterior
                        }
                    }else if(this.state.idTarea === 215 || this.state.idTarea === 248){
                        const consultaConsecutivo = await webs.cdt.lists.getByTitle("Historico de registro de cambio").items
                        .select("ID", "Consecutivo")
                        .filter("(Title eq '" + this.props.abrir.filaSeleccionada.IdProyectoInversion.Title + "') and (" + (this.state.idTarea === 215 ? "Terreno eq null" : "Terreno eq '" + this.props.abrir.filaSeleccionada.IdTerreno.Title + "'") + ")")
                        .orderBy("Consecutivo")
                        .top(1000)
                        .get()

                        const jsonHRC = {
                            Consecutivo: consultaConsecutivo.length + 1,
                            Title: this.props.abrir.filaSeleccionada.IdProyectoInversion.Title,
                            Terreno: this.state.idTarea === 215 ? '' : this.props.abrir.filaSeleccionada.IdTerreno.Title,
                            NombreSolicitudCambio: json.NombreSolicitudCambio,
                            GrupoResponsable: json.GrupoResponsable !== undefined ? this.state.catalogo[0].datos.find(x=> x.Id === json.GrupoResponsable).Title : '',
                            FechaAutorizacionCambios: json.FechaAutorizacionCambios,
                            ComentariosRegistroCambio: json.ComentariosSolicitudCambio
                        }
                        await CRUD.createListItem(webs.cdt, 'Historico de registro de cambio', jsonHRC).catch(error => {
                            alert('ERROR AL INSERTAR EN LA LISTA ' + lista + ': ' + error)
                        })
                    }
                    if(Object.keys(json).length > 0){
                        await CRUD.updateListItem(webs.cdt, lista, idElemento, json).catch(error=>{
                            alert('ERROR AL ACTUALIZAR LA LISTA ' + lista + ': ' + error)
                        })
                    }
                }
            }
        })
    }

    onCerrar = () => {
        this.setState(this.initialState)
        this.props.cerrar()
    }
    //#endregion

    //#region Funciones
    obtenerCampos = async id => {
        const {webs} = this.props
        let { refs, camposLista, catalogo, archivosCargados, idTarea, datosTramite } = this.state
        let catalogoEstatus = await webs.cdt.lists.getByTitle('Estatus').items
        .select('ID', 'Title')
        .filter("Categoria eq 'Automático'")
        .get()
        .catch(error => {
            alert('ERROR AL CONSULTAR DATOS DE LOS ESTATUS: ' + error)
        })

        if (!this.props.abrir.esTarea) {
            if (id > 0) {
                //Obtiene los campos a pintar en el formulario
                await webs.cdt.lists.getByTitle('Relación campos documentos trámites tareas').items
                .select('Tarea/ID', 'Tarea/Title', 'Title', 'TituloInternoDelCampo', 'TipoDeCampo', 'ListaDeGuardado', 'Editable',
                    'ListaDeGuardadoIN', 'ListaDeGuardadoSecundario', 'ListaDeGuardadoSecundarioIN', 'Catalogos', 'Ordenamiento',
                    'Requerido', 'Tramite', 'Activo', 'Boton', 'IdRTD', 'IdTramite', 'IdDocumento', 'Url', 'EstiloColumna',
                    'Accion', 'Parametros')
                .filter('(TareaId eq ' + id + ') and (Activo eq 1)')
                .expand('Tarea')
                .orderBy('Ordenamiento', true).get()
                .then(async (campos)=>{
                    let users = []
                    if (this.props.abrir.id === 270) {
                        users = await webs.cdt.siteUsers();
                        if(this.props.abrir.idVentana !== 4){
                            if (this.props.abrir.gruposUsuarioActual.some(x => x.ID === this.props.abrir.filaSeleccionada.GrupoResponsable.ID && !x.AdminAreaGanttId.some(x => x === this.props.abrir.usuarioActual.Id) && x.RespAreaGanttId.some(x => x === this.props.abrir.usuarioActual.Id))) {
                                users = users.filter(x => x.Id === this.props.abrir.usuarioActual.Id)
                            }
                        }
                        campos.map((campo)=>{
                            campo.valor = this.state.usuarioAsignados
                            return campo
                        })
                    }
                    this.setState({ campos: campos, usuarios: users, catalogoEstatus: catalogoEstatus, backdrop: {abierto : false, mensaje: ''}})
                }).catch(error => {
                    alert('ERROR AL CONSULTAR DATOS EN LA LISTA: ' + error)
                })
            }
        } else {
            const filtroConsulta = this.props.abrir.filaSeleccionada.Lista === undefined ? '(TareaId eq ' + this.props.abrir.filaSeleccionada.Tarea.ID + ') and (Activo eq 1)'
                : (this.props.abrir.filaSeleccionada.Lista === 'Flujo Tareas' ? '(TareaId eq ' + this.props.abrir.filaSeleccionada.IdTarea.ID + ') and (Activo eq 1)'
                    : (this.props.abrir.filaSeleccionada.Lista === 'Fechas paquete de trámites' ? (this.props.abrir.filaSeleccionada.IdDocTaskId !== null ? 'IdRTD eq ' + this.props.abrir.filaSeleccionada.IdDocTaskId : 'IdTramite eq ' + this.props.abrir.filaSeleccionada.IdDocTramite.ID)
                        : '(TareaId eq ' + this.props.abrir.filaSeleccionada.Tarea + ') and (Activo eq 1)'))
            //Obtiene los campos a pintar en el formulario
            await webs.cdt.lists.getByTitle('Relación campos documentos trámites tareas').items
                .select('Tarea/ID', 'Tarea/Title', 'Title', 'TituloInternoDelCampo', 'TipoDeCampo', 'ListaDeGuardado', 'Editable',
                    'ListaDeGuardadoIN', 'ListaDeGuardadoSecundario', 'ListaDeGuardadoSecundarioIN', 'Catalogos', 'Ordenamiento',
                    'Requerido', 'Tramite', 'Activo', 'Boton', 'IdRTD', 'IdTramite', 'IdDocumento', 'Url', 'EstiloColumna',
                    'Accion', 'Parametros')
                .filter(filtroConsulta)
                .expand('Tarea')
                .orderBy('Ordenamiento', true)
                .get()
                .then(async (campos) => {
                    const catalogos = campos.filter(x => x.Catalogos)
                    if (catalogos.length > 0) {
                        await util.asyncForEach(catalogos, async cat => {
                            const results = cat.Parametros !== null ? await this[cat.Catalogos](cat.Parametros) : await this[cat.Catalogos]()
                            catalogo.push({ campo: cat.TituloInternoDelCampo, datos: results })
                        })
                    }
                    campos.map((campo) => {
                        campo.RequeridoOriginal = campo.Requerido
                        campo.EditableOriginal = campo.Editable
                        refs[campo.TituloInternoDelCampo] = this[campo.TituloInternoDelCampo] = createRef()
                        if (!camposLista.some(x => x.campo === campo.TituloInternoDelCampo)) {
                            camposLista.push({ idTarea: campo.Tarea.ID, campo: campo.TituloInternoDelCampo, tipo: campo.TipoDeCampo, listaPrincipal: campo.ListaDeGuardado, listaPrincipalIN: campo.ListaDeGuardadoIN, listaSecundaria: campo.ListaDeGuardadoSecundaria, listaSecundariaIN: campo.ListaDeGuardadoSecundariaIN, Tramite: campo.Tramite, valor: '' })
                        }
                        return
                    })

                    camposLista = util.groupBy(this.state.camposLista, 'listaPrincipal')
                    let listas = []
                    for (let prop in camposLista) {
                        listas.push(prop)
                    }

                    if (this.props.abrir.filaSeleccionada.Lista === 'Fechas paquete de trámites') {
                        datosTramite = await webs.cdt.lists.getByTitle('Flujo Tareas').items
                        .select('ID', 'IdProyectoInversion/ID', 'IdProyectoInversion/Title', 'IdTerreno/ID', 'IdTerreno/Title',
                            'Nivel/ID', 'Nivel/Title', 'IdTareaId')
                        .filter('ID eq ' + this.props.abrir.filaSeleccionada.IdFlujoId)
                        .expand('IdProyectoInversion', 'IdTerreno', 'Nivel')
                        .get()
                        .catch(error => {
                            alert('ERROR AL OBTENER LOS DATOS PRELIMINARES DEL TRÁMITE: ' + error)
                        })
                    }
                    const obtenerDatos = async () => {
                        let noAplicaGeneral = false
                        await util.asyncForEach(listas, async lista => {
                            if (lista !== 'Documentos' && lista !== 'null') {
                                let elementos = camposLista[lista]
                                const camposSelect = elementos.map((campoLista) => {
                                    return campoLista.campo
                                }).join(',')
                                let idElemento = util.obtenerIdActualizarPorLista(this.props.abrir.filaSeleccionada, elementos[0].listaPrincipalIN)
                                if (lista === 'Relación Fechas Aprobación Terreno') {
                                    const datos = await webs.cdt.lists.getByTitle(lista).items.select('Fecha', 'Campo').filter('Title eq ' + idElemento.toString()).get()
                                    if (datos.length > 0) {
                                        campos.map((campo) => {
                                            const newCampo = datos.find(x => x.Campo === campo.TituloInternoDelCampo)
                                            if (newCampo !== undefined) {
                                                campo.valor = util.returnDataByFieldType(newCampo.Fecha, campo.TipoDeCampo)
                                            }
                                            return campo
                                        })
                                    }
                                } else if (lista === 'Fechas paquete de trámites') {
                                    const tramites = campos.filter(x => x.Tramite === 'Trámite')
                                    await util.asyncForEach(tramites, async tramite => {
                                        const datos = await webs.cdt.lists.getByTitle(lista).items
                                        .select('FechaDeIngreso', 'FechaDeLaPrevencion', 'FechaDeResolucion', 'FechaVigencia', 'InternalNameFdeI', 'InternalNameFdeI',
                                            'InternalNameFdeLaP', 'InternalNameFdeR', 'InternalNameFdeV', 'IdDocTaskId', 'IdDocTramiteId', 'ID', 'NoAplica')
                                        .filter('IdFlujoId eq ' + idElemento + ' and IdDocTaskId eq ' + tramite.IdRTD + ' and IdDocTramiteId eq ' + tramite.IdTramite)
                                        .get()
                                        .catch(error => {
                                            alert('ERROR AL LEER LA LISTA ' + lista + ': ' + error)
                                        })

                                        let noAplica = false
                                        if (datos.length > 0) {
                                            campos.map((campo) => {
                                                if ((campo.TipoDeCampo === 'Date' || campo.TipoDeCampo === 'CheckBox') && campo.TituloInternoDelCampo.substring(4) === tramite.TituloInternoDelCampo) {
                                                    campo.valor = util.obtenerValorCampoFPT(campo.TituloInternoDelCampo, datos[0])
                                                    if (typeof campo.valor === 'boolean') {
                                                        noAplica = campo.valor
                                                    } else {
                                                        if (noAplica) {
                                                            campo.Editable = false
                                                        }
                                                    }
                                                } else if (campo.TipoDeCampo === 'File' && (campo.TituloInternoDelCampo === tramite.TituloInternoDelCampo || campo.TituloInternoDelCampo.substring(4) === tramite.TituloInternoDelCampo) && noAplica) {
                                                    campo.Editable = false
                                                    campo.Requerido = false
                                                }
                                                return campo
                                            })
                                        }
                                    })
                                } else if (lista === 'Relación DRO´s Proyectos deptos') {
                                    const datos = await webs.cdt.lists.getByTitle(lista).items.filter("Title eq '" + this.props.abrir.filaSeleccionada.IdTerreno.Title + "'")
                                    .get()
                                    .catch(error => {
                                        alert('ERROR AL CONSULTAR DATOS EN LA LISTA ' + lista + ': ' + error)
                                    })
                                    if (datos.length > 0) {
                                        campos.map((campo) => {
                                            const newCampo = datos.find(x => x.IdResponsable === campo.TituloInternoDelCampo)
                                            if (newCampo !== undefined) {
                                                campo.valor = util.returnDataByFieldType(newCampo.CategoriaId, campo.TipoDeCampo)
                                            }
                                            return campo
                                        })
                                    }
                                } else if (lista === 'Relación Bancos Proyectos Deptos') {
                                    const datos = await webs.cdt.lists.getByTitle(lista).items.select('NombreDelBancoId').filter('IdFlujo eq ' + this.props.abrir.filaSeleccionada.ID).get()
                                    if (datos.length > 0) {
                                        campos.map((campo) => {
                                            if (campo.TituloInternoDelCampo === elementos[0].campo) {
                                                campo.valor = datos.map((dato) => { return dato.NombreDelBancoId })
                                            }
                                            return campo
                                        })
                                    }
                                } else if (lista === 'RelacionTerrenoInteresados') {                                    
                                    const datos = await webs.cdt.lists.getByTitle(lista).items
                                    .select('ID', 'IdFlujoId', 'Title', 'Interesados/Id', 'Interesados/Title')
                                    .filter("IdFlujoId eq " + idElemento)
                                    .expand('Interesados')
                                    .get()
                                    .catch(error => {
                                        alert('ERROR AL CONSULTAR DATOS EN LA LISTA ' + lista + ': ' + error)
                                    })
                                    if (datos.length > 0) {
                                        campos.map((campo) => {
                                            if(campo.ListaDeGuardado === lista){
                                                if (datos.some(x=> x.Title === campo.TituloInternoDelCampo)) {
                                                    campo.valor = campo.TipoDeCampo === 'PeoplePicker' ? datos.find(x=> x.Title === campo.TituloInternoDelCampo).Interesados : (datos.find(x=> x.Title === campo.TituloInternoDelCampo).Interesados !== undefined ? datos.find(x=> x.Title === campo.TituloInternoDelCampo).Interesados[0] : [])
                                                }
                                                else{
                                                    campo.TipoDeCampo === 'PeoplePicker' ? campo.valor = [] : campo.valor = ''
                                                }
                                            }
                                            return campo
                                        })
                                    }
                                } else {
                                    await webs.cdt.lists.getByTitle(lista).items.getById(idElemento).select(camposSelect).get().then((datos) => {
                                        campos.map((campo) => {
                                            const valor = datos[campo.TituloInternoDelCampo]
                                            if (valor !== undefined) {
                                                campo.valor = util.returnDataByFieldType(valor, campo.TipoDeCampo)
                                                if (typeof campo.valor === 'boolean') {
                                                    noAplicaGeneral = campo.valor
                                                }
                                            }
                                            if (typeof campo.valor !== 'boolean' && noAplicaGeneral) {
                                                campo.Editable = false
                                                campo.Requerido = false
                                            }
                                            return campo
                                        })
                                    }).catch(error => {
                                        alert('ERROR AL CONSULTAR DATOS EN LA LISTA ' + lista + ': ' + error)
                                    })
                                }
                            } else if (lista === 'Documentos') {
                                const urlDoctos = this.props.abrir.filaSeleccionada.Lista === 'Fechas paquete de trámites' ?
                                    this.props.abrir.filaSeleccionada.PI + '/' + this.props.abrir.filaSeleccionada.Title :
                                    (this.props.abrir.filaSeleccionada.Nivel.ID === 1 ? this.props.abrir.filaSeleccionada.IdProyectoInversion.Title : this.props.abrir.filaSeleccionada.IdProyectoInversion.Title + '/' + this.props.abrir.filaSeleccionada.IdTerreno.Title)
                                let elementos = camposLista[lista]
                                await util.asyncForEach(elementos, async elementos => {
                                    const result = await this.obtenerDocumentosCargados(urlDoctos, elementos.campo)
                                    if (result !== undefined) { archivosCargados.push({ nombreInterno: result.Title, archivo: result.Name, icono: '/CompraDeTerreno/images/iconos/' + result.extension + '.png', url: result.ServerRelativeUrl, requerido: false }) }
                                })
                            }
                        })
                    }
                    if(idTarea === 24 || idTarea === 25 || idTarea === 30 || idTarea === 35 || idTarea === 271 || idTarea === 272 || idTarea === 289){
                        this.setState({ campos: campos, catalogoEstatus: catalogoEstatus, backdrop: {abierto : false, mensaje: ''} })
                    }else{
                        await obtenerDatos().then(async()=>{
                            const idsAsignados = util.obtenerIdAsignados(this.props.abrir.filaSeleccionada.AsignadoA)
                            const existeAsignado = idsAsignados.results.includes(this.props.abrir.usuarioActual.Id)
                            const esAdministrador = this.props.abrir.filaSeleccionada.esAdministrador
                            let { usuarios } = this.state
                            if(idTarea === 45 || idTarea === 152){
                                usuarios = await webs.cdt.siteUsers()
                            }
                            this.setState({ campos: campos, catalogoEstatus: catalogoEstatus, catalogo: catalogo, refs: refs,
                                camposLista: camposLista, archivosCargados: archivosCargados, datosTramite: datosTramite,
                                editablePorUsuario: (esAdministrador || existeAsignado), backdrop: {abierto : false, mensaje: ''},
                                contieneAdjunto: archivosCargados.length > 0 ? true : false, usuarios: usuarios
                            })
                        })
                    }
                }).catch(error => {
                    alert('ERROR AL OBTENER LOS CAMPOS DE LA VENTANA: ' + error)
                })
        }
    }

    obtenerDatosGuardados = async (id) => {
        const {webs} = this.props
        const item = await webs.cdt.lists.getByTitle("RFSN").items
        .filter('IdFlujoId eq ' + id + 'and IdTerrenoId eq null')
        .get()
        .catch(error => {
            alert('ERROR AL CONSULTAR DATOS EN LA LISTA RFSN: ' + error)
        })
        if (item.length > 0) {
            this.setState({ radioChecked: item[0].FRSN })
        }
    }

    obtenerDocumentosCargados = async (url, documento) => {
        const {webs} = this.props
        let result = {}
        await webs.cdv.getFolderByServerRelativeUrl('/Documents/' + url).files.get().then(items => {
            result = items.find(x => x.Title === documento)
            if (result !== undefined) {
                result.extension = result.Name.split('.').pop()
                result.rootURL = result.ServerRelativeUrl
            }
        }).catch(error => {
            alert('ERROR AL INTENTAR OBTENER LOS DOCUMENTOS DESDE ' + url + ': ' + error)
        })
        
        return result
    }

    obtenerPosiciones = usuarios => {
        var items = this.state.usuarioAsignados.map((usuario) => {
            if (usuario.Id !== undefined) { return usuarios[usuarios.findIndex((obj => obj.Id === usuario.Id))] }
            else if (usuario.ID !== undefined) { return usuarios[usuarios.findIndex((obj => obj.Id === usuario.ID))] }
            return usuario
        })
        this.setState({ usuarioAsignados: items })
    }

    obtenerTotalTerrenosPI = async () => {
        const {webs} = this.props
        const terrenos = await webs.cdt.lists.getByTitle("Terrenos").items.filter('IdProyectoInversionId eq ' + this.props.abrir.filaSeleccionada.ProyectoInversion.ID + ' and Empadronamiento eq null').get();
        return terrenos.length
    }

    respaldarValores = () => {
        let datosActualizados = []
        for (let ref in this.state.refs) {
            const valor = this.state.refs[ref].current !== null ? (this.state.refs[ref].current.type === 'checkbox' ? (this.state.refs[ref].current.checked ? true : false) : this.state.refs[ref].current.value) : ''
            if (valor !== '') {
                const filaIndice = this.state.campos.findIndex(campo => campo.TituloInternoDelCampo === ref)
                let campoActual = this.state.campos[filaIndice]
                campoActual.valor = valor
                datosActualizados = update(this.state.campos, { $splice: [[filaIndice, 1, campoActual]] })
            }
        }
        return datosActualizados
    }

    validate() {
        this.form.current.reportValidity()
    }
    //#endregion

    //#region Métodos de ciclo de vida
    async componentDidMount() {
        const { archivosCargados } = this.state
        if (this.props.abrir.abierto) {
           if (this.props.abrir.filaSeleccionada.Tarea !== undefined) {
                //Cuando la tarea viene de estrategia de gestión
                if (this.props.abrir.filaSeleccionada.Tarea.ID === 24) {
                    if (this.props.abrir.filaSeleccionada.Estatus.ID === 3) {
                        this.obtenerDatosGuardados(this.props.abrir.id)
                    }
                } else if (this.props.abrir.filaSeleccionada.Tarea.ID === 269) {
                    const urlDoctos = !this.props.abrir.filaSeleccionada.esRFS ? this.props.abrir.filaSeleccionada.ProyectoInversion.title : this.props.abrir.filaSeleccionada.ProyectoInversion.title + '/' + this.props.abrir.filaSeleccionada.Terreno.title
                    const result = await this.obtenerDocumentosCargados(urlDoctos, 'EGAutorizada')
                    if (result !== undefined) { archivosCargados.push({ nombreInterno: result.Title, archivo: result.Name, icono: '/CompraDeTerreno/images/iconos/' + result.extension + '.png', url: result.ServerRelativeUrl }) }
                }
            }
            this.obtenerCampos(this.props.abrir.id)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.usuarioAsignados.length !== nextState.usuarioAsignados.length) {
            return false
        } else {
            return true
        }
    }
    //#endregion

    //#region  Eventos de controles
    onCambiar = (e) =>{
        let {campos} = this.state

        const filaIndice = campos.findIndex(campo => campo.TituloInternoDelCampo === e.target.id)
        let campoActual = campos[filaIndice]
        campoActual.valor = e.target.value
        let datosActualizados = update(this.state.campos, { $splice: [[filaIndice, 1, campoActual]] })

        this.setState({ campos: datosActualizados })
        if(campoActual.Accion !== null){
            this[campoActual.Accion](campoActual.Parametros)
        }
    }

    async onCargarArchivo(e, nombreDocumento) {
        const {webs} = this.props
        const { archivosCargados } = this.state
        if (window.confirm('¿Desea adjuntar el archivo "' + e.target.files[0].name + '"?')) {
            const { id, name } = e.target
            const archivo = e.target.files[0]
            const extension = archivo.name.split('.').pop()
            if (!this.props.abrir.esTarea) {
                const urlCargar = !this.props.abrir.filaSeleccionada.esRFS ? this.props.abrir.filaSeleccionada.ProyectoInversion.title : this.props.abrir.filaSeleccionada.ProyectoInversion.title + '/' + this.props.abrir.filaSeleccionada.Terreno.title
                await webs.cdv.getFolderByServerRelativeUrl('/Documents/' + urlCargar + '/').files.add(nombreDocumento + '.' + extension, archivo, true)
                    .then(async (docto) => {
                        const item = await docto.file.getItem()
                        await item.update({
                            Title: nombreDocumento
                        })
                            .then(async () => {
                                let index = archivosCargados.findIndex(x => x.nombreInterno === nombreDocumento)
                                if (index === -1) {
                                    archivosCargados.push({ nombreInterno: nombreDocumento, archivo: docto.data.Name, icono: '/CompraDeTerreno/images/iconos/' + extension + '.png', url: docto.data.ServerRelativeUrl })
                                }
                                alert('Su archivo se cargó correctamente')
                                this.setState({ archivosCargados: archivosCargados })
                            })
                    }).catch(error => {
                        alert('ERROR AL CARGAR EL ARCHIVO: ' + error)
                    })
            } else {
                this.uploadFile(name.toString(), id, 'Fu' + id, archivo, extension)
            }
        }
    }

    onSeleccionar = e => {
        const { id } = e.target;
        this.setState({ radioChecked: id });
    }

    onSeleccionarItems = (items) => {
        const filaIndice = this.state.campos.findIndex(x => x.TituloInternoDelCampo === items.idCampo)
        let campoActual = this.state.campos[filaIndice]
        if(!items.nulo){
            campoActual.valor = items
        }else{
            campoActual.valor = []
        }
        let datosActualizados = update(this.state.campos, { $splice: [[filaIndice, 1, campoActual]] })
        this.setState({ campos: datosActualizados })
    }

    onSeleccionMultiple = (event) => {
        const filaIndice = this.state.campos.findIndex(x => x.TituloInternoDelCampo === event.target.name)
        let campoActual = this.state.campos[filaIndice]
        campoActual.valor = event.target.value
        let datosActualizados = update(this.state.campos, { $splice: [[filaIndice, 1, campoActual]] })
        this.setState({ campos: datosActualizados })
    }

    uploadFile = (IdDocumento, IdControl, href, archivo, extension) => {
        let { archivosValidos, idTarea, archivosCargados } = this.state
        let IdProyectoInversion, IdTerreno, Nivel, ID
        if (this.props.abrir.filaSeleccionada.Lista === 'Flujo Tareas') {
            IdProyectoInversion = this.props.abrir.filaSeleccionada.IdProyectoInversion
            IdTerreno = this.props.abrir.filaSeleccionada.IdTerreno
            Nivel = this.props.abrir.filaSeleccionada.Nivel
            ID = this.props.abrir.filaSeleccionada.ID
        } else if (this.props.abrir.filaSeleccionada.Lista === 'Fechas paquete de trámites') {
            IdProyectoInversion = this.state.datosTramite[0].IdProyectoInversion
            IdTerreno = this.state.datosTramite[0].IdTerreno
            Nivel = this.state.datosTramite[0].Nivel
            ID = this.state.datosTramite[0].ID
            idTarea = this.state.datosTramite[0].IdTareaId
        }
        if (!archivosValidos.includes(extension)) {
            alert('Archivo con extensión inválida: "' + extension + '"')
        }
        else {
            let datosActualizados = this.respaldarValores()
            let formData = new FormData()
            formData.append("file", archivo)
            const url = this.props.abrir.url + '/CompraDeTerreno/_layouts/15/IQC.CadenaValor.CompraDeTerreno.Services/HandlerFileUpload.ashx?' + idTarea + "|" + IdDocumento + "|" + IdProyectoInversion.ID + "|" + (IdTerreno === undefined ? 0 : IdTerreno.ID) + "|" + 0 + "|" + 0 + "|" + IdProyectoInversion.Title + "|" + (IdTerreno === undefined ? '' : IdTerreno.Title) + "|" + '' + "|" + '' + "|" + (Nivel.ID === 1 ? 'I' : (Nivel.ID === 2 ? 'T' : 'C')) + "|" + IdControl + "|" + href + "|" + ID + ""
            $.ajax({
                type: 'POST',
                url: url,
                data: formData,
                dataType: 'json',
                async: false,
                crossDomain: true,
                contentType: false,
                processData: false,
                success: function (data) {
                    let resultUrl = new URL(data)
                    let index = archivosCargados.findIndex(x => x.nombreInterno === IdControl)
                    if (index === -1) {
                        archivosCargados.push({ nombreInterno: IdControl, archivo: IdControl + '.' + extension, icono: resultUrl.origin + '/CompraDeTerreno/images/iconos/' + extension + '.png', url: data, requerido: false })
                    }
                    alert('Su archivo se cargó correctamente')
                },
                error: function (error) {
                    alert('ERROR AL INTENTAR CARGAR EL ARCHIVO: ' + error.responseText);
                }
            })
            if(datosActualizados.length>0)
            {this.setState({archivosCargados: archivosCargados, campos: datosActualizados, contieneAdjunto : true })}
            else
            {this.setState({archivosCargados: archivosCargados, contieneAdjunto : true })}
        }
    }
    //#endregion

    //#region  Funciones genericas
    obtenerGrupos = async () => {
        const {webs} = this.props
        return await webs.cdt.siteGroups();
    }

    obtenerSiNo = async () => {
        return await [{ Id: 0, Title: 'Sí' }, { Id: 1, Title: 'No' }]
    }

    obtenerDRO = async (params) => {
        const {webs} = this.props
        return await webs.cdt.lists.getByTitle("DRO´s").items.filter("Title eq '" + params + "'").get().catch(error => {
            alert('ERROR AL INTENTAR OBTENER LOS DROS DE ' + params + ': ' + error)
        })
    }

    obtenerEmpresas = async (params) => {
        const {webs} = this.props
        return await webs.cdt.lists.getByTitle("Empresas").items.filter("Activo eq " + parseInt(params)).get().catch(error => {
            alert('ERROR AL INTENTAR OBTENER LAS EMPRESAS: ' + error)
        })
    }

    CatBancos = async () => {
        const {webs} = this.props
        return await webs.cdt.lists.getByTitle("Catálogo de bancos").items.get().catch(error => {
            alert('ERROR AL INTENTAR OBTENER EL CATÁLOGO DE BANCOS: ' + error)
        })
    }

    habilitarCampos = (parametros) => {
        let datosActualizados = this.respaldarValores()
        const newParametros = parametros.split(',')
        for (let parametro in newParametros) {
            const filaIndice = this.state.campos.findIndex(campo => campo.TituloInternoDelCampo === newParametros[parametro])
            let campoActual = this.state.campos[filaIndice]
            campoActual.Editable = !campoActual.Editable
            datosActualizados = update(this.state.campos, { $splice: [[filaIndice, 1, campoActual]] })
        }
        this.setState({ campos: datosActualizados })
    }

    noAplica = (parametros) => {
        const newParametros = parametros.split(',')
        let checkSeleccionado = false
        let datosActualizados = this.state.campos.map((campo) => {
            if (campo.TituloInternoDelCampo.includes(newParametros[0])) {
                if (campo.TipoDeCampo !== 'CheckBox') {
                    if (checkSeleccionado) {
                        campo.Editable = false
                        campo.Requerido = false
                        campo.valor = ''
                    } else {
                        campo.Editable = campo.EditableOriginal
                        campo.Requerido = campo.RequeridoOriginal
                    }
                }
                else {
                    campo.valor = this.state.refs[campo.TituloInternoDelCampo].current.checked
                    checkSeleccionado = campo.valor
                }
            }
            return campo
        })
        this.setState({ campos: datosActualizados })
    }

    sumarVigencia = (parametros) => {
        let {campos} = this.state
        //let datosActualizados = this.respaldarValores()
        const newParametros = parametros.split(',')

        const campoRef = campos.findIndex(campo => campo.TituloInternoDelCampo === newParametros[0])
        let FdeR = campos[campoRef]
        let FdeV = moment(FdeR.valor).add(parseInt(newParametros[2]), 'M')
        FdeV = moment(FdeV._d).format('YYYY-MM-DD')

        const filaIndice = campos.findIndex(campo => campo.TituloInternoDelCampo === newParametros[1])
        let campoActual = campos[filaIndice]
        campoActual.valor = FdeV
        let datosActualizados = update(this.state.campos, { $splice: [[filaIndice, 1, campoActual]] })

        this.setState({ campos: datosActualizados })
    }

    calcularEficiencia = (parametros) => {
        let datosActualizados = this.respaldarValores()
        const newParametros = parametros.split(',')

        const m2VendiblesReal = this.state.refs[newParametros[0]].current.value
        const m2ConstruccionReal = this.state.refs[newParametros[1]].current.value
        let eficienciaReal = 0.0

        if (m2VendiblesReal !== '' && m2ConstruccionReal !== '') {
            if (parseFloat(m2VendiblesReal) > 0 && parseFloat(m2ConstruccionReal)) {
                eficienciaReal = ((parseFloat(m2VendiblesReal) / parseFloat(m2ConstruccionReal)) * 100).toFixed(2)

                const indiceM2VendiblesReal = this.state.campos.findIndex(campo => campo.TituloInternoDelCampo === newParametros[0])
                const indiceM2ConstruccionReal = this.state.campos.findIndex(campo => campo.TituloInternoDelCampo === newParametros[1])
                const indiceEficienciaReal = this.state.campos.findIndex(campo => campo.TituloInternoDelCampo === newParametros[2])

                let campoM2VendiblesReal = this.state.campos[indiceM2VendiblesReal]
                campoM2VendiblesReal.valor = parseFloat(m2VendiblesReal)
                let campoM2ConstruccionReal = this.state.campos[indiceM2ConstruccionReal]
                campoM2ConstruccionReal.valor = parseFloat(m2ConstruccionReal)
                let campoEficienciaReal = this.state.campos[indiceEficienciaReal]
                campoEficienciaReal.valor = eficienciaReal

                datosActualizados = update(this.state.campos, { $splice: [[indiceM2VendiblesReal, 1, campoM2VendiblesReal]] })
                datosActualizados = update(this.state.campos, { $splice: [[indiceM2ConstruccionReal, 1, campoM2ConstruccionReal]] })
                datosActualizados = update(this.state.campos, { $splice: [[indiceEficienciaReal, 1, campoEficienciaReal]] })

                this.setState({ campos: datosActualizados })
            }
        }
    }
    //#endregion

    render() {
        var boton = '';
        var ID = 0;
        const {abrir, webs} = this.props
        let { idTarea, archivosCargados, esIframe, catalogo, editablePorUsuario } = this.state

        const Formulario = () => {
            const formulario = this.state.campos.map((campo, index) => {
                boton = campo.Boton;
                ID = campo.ID;
                let cat = campo.TipoDeCampo === 'Select' || campo.TipoDeCampo === 'SelectText' || campo.TipoDeCampo === 'SelectMultiple' ? catalogo.filter(x => x.campo === campo.TituloInternoDelCampo) : []
                if (esIframe === '1') {
                    return (
                        <div key={0} className="form-group col-md-12">
                            <iframe is='x-frame-bypass' src={this.props.abrir.url + this.props.abrir.filaSeleccionada.UrlTarea} width='100%'></iframe>
                        </div>)
                } else {
                    return (
                        <div key={index} className={campo.EstiloColumna}>
                            {(() => {
                                switch (campo.TipoDeCampo) {
                                    case 'Button':
                                        return <div key={campo.ID} className="form-group">
                                            <label></label>
                                            <button className="btn btn-light" type={campo.TipoDeCampo} name={campo.TituloInternoDelCampo} disabled={!campo.Editable} onClick={() => { this[campo.Accion](campo.Parametros) }}>{campo.Title}</button>
                                        </div>
                                    case 'CheckBox':
                                        return <div key={campo.ID} className="form-group">
                                            <label>{campo.Title}</label>
                                            <input style={{ width: '15px' }} className="form-control form-control-md" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} checked={campo.valor} disabled={!campo.Editable} onChange={campo.Accion !== null ? () => { this[campo.Accion](campo.Parametros) } : null} />
                                        </div>
                                    case 'Date':
                                        return <div key={campo.ID} className="form-group">
                                            <label>{campo.Title}</label>
                                            <input className={'form-control form-control-md' + (campo.Requerido ? ' is-invalid' : '')} type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} defaultValue={campo.valor} required={campo.Requerido} disabled={!campo.Editable} onBlur= {this.onCambiar} />
                                        </div>
                                    case 'File':
                                        return <div key={campo.ID} className="form-group">
                                            <label>{campo.Title}</label>
                                            <div className={"custom-file file-width"}>
                                                <input type={campo.TipoDeCampo} className="custom-file-input" name={campo.IdDocumento} id={campo.TituloInternoDelCampo} onChange={(e) => this.onCargarArchivo(e, campo.TituloInternoDelCampo)} lang='es' required={util.esRequerido(archivosCargados, campo)} disabled={!campo.Editable} />
                                                <label className="custom-file-label" htmlFor={campo.TituloInternoDelCampo}></label>
                                            </div>
                                            {util.obtenerDatosDocumento(archivosCargados, campo) !== undefined ?
                                                <img alt='' src={archivosCargados.length > 0 ? archivosCargados.find(x => x.nombreInterno === campo.TituloInternoDelCampo).icono : null}
                                                    title={archivosCargados.length > 0 ? archivosCargados.find(x => x.nombreInterno === campo.TituloInternoDelCampo).archivo : ''}
                                                    onClick={() => window.open(archivosCargados.find(x => x.nombreInterno === campo.TituloInternoDelCampo).url, "_blank")}
                                                    style={{ float: 'right' }}></img>
                                                : null}
                                        </div>
                                    case 'hr':
                                        return <hr key={campo.ID} className="form-group" />
                                    case 'Label':
                                        return <div key={campo.ID} className="form-group">
                                            <label>{campo.Title}</label>
                                        </div>
                                    case 'Link':
                                        return <div key={campo.ID} className="form-group">
                                            <a href={util.ensamblarURL(campo.Url, this.props.abrir.filaSeleccionada, this.props.abrir.url)} target='_blank' rel="noopener noreferrer" disabled={campo.Activo}>{campo.Title}</a>
                                        </div>
                                    case 'LinkPE':
                                        return <div key={campo.ID} className="form-group">
                                            <label>{campo.Title}</label><br />
                                            <a href={util.ensamblarURLPE(campo.Url, this.props.abrir.filaSeleccionada, campo.TituloInternoDelCampo, this.props.abrir.url)} target='_blank' rel="noopener noreferrer" disabled={campo.Activo}>Ir a la carpeta</a>
                                        </div>
                                    case 'Number':
                                        return <div key={campo.ID} className="form-group">
                                            <label>{campo.Title}</label>
                                            <input className={'form-control form-control-md' + (campo.Requerido ? ' is-invalid' : '')} step='.01' type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} defaultValue={campo.valor} required={campo.Requerido} disabled={!campo.Editable} onBlur={this.onCambiar} />
                                        </div>
                                    case 'PeoplePicker':
                                        return <div key={campo.ID} className="form-group">
                                            <label>{campo.Title}</label>
                                            <PeoplePicker id= {campo.TituloInternoDelCampo} usuarios={this.state.usuarios} itemsSeleccionados={campo.valor} seleccionarItems={this.onSeleccionarItems} disabled={!this.props.abrir.esTarea ? false : (this.props.abrir.filaSeleccionada.Estatus.ID === 3 ? true : false)} />
                                        </div>
                                    case 'Radio':
                                        return <div key={campo.ID} className="form-group">
                                            <input className="form-radio" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} checked={this.state.radioChecked === campo.TituloInternoDelCampo} onChange={this.onSeleccionar} ref={this[campo.TituloInternoDelCampo]} required={campo.Requerido} disabled={!campo.Editable} />
                                            <label htmlFor="radio-one">{campo.Title}</label>
                                        </div>
                                    case 'Select':
                                        return <div key={campo.ID} className="form-group">
                                            <label>{campo.Title}</label>
                                            <select className="form-control form-control-md" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} onBlur={this.onCambiar} defaultValue={campo.valor} required={campo.Requerido} disabled={!campo.Editable}>
                                                <option key={0} value={0}>Selecione...</option>
                                                {cat[0].datos.map((item) => {
                                                    return <option key={item.Id} value={item.Id}>{idTarea !== 45 && idTarea !== 152 ? item.Title : item.Responsable}</option>
                                                })}
                                            </select>
                                        </div>
                                    case 'SelectText':
                                        return <div key={campo.ID} className="form-group">
                                            <label>{campo.Title}</label>
                                            <select className="form-control form-control-md" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} onBlur={this.onCambiar} defaultValue={campo.valor} required={campo.Requerido} disabled={!campo.Editable}>
                                                <option key={0} value={0}>Selecione...</option>
                                                {cat[0].datos.map((item) => {
                                                    return <option key={item.Id} value={item.Title}>{item.Title}</option>
                                                })}
                                            </select>
                                        </div>
                                    case 'SelectMultiple':
                                        const valores = campo.valor === undefined ? [] : campo.valor
                                        return <div key={campo.ID} className="form-group">
                                            <label>{campo.Title}</label>
                                            <FormControl style={{ width: '100%' }}>
                                                <Select
                                                    labelId="demo-mutiple-checkbox-label"
                                                    id={campo.TituloInternoDelCampo}
                                                    name={campo.TituloInternoDelCampo}
                                                    multiple
                                                    value={valores}
                                                    onChange={this.onSeleccionMultiple}
                                                    input={<Input />}
                                                    renderValue={() => 'Múltiples seleccionados'}
                                                    ref={this[campo.TituloInternoDelCampo]}
                                                >
                                                    {cat[0].datos.map((item) => (
                                                        <MenuItem key={item.Id} value={item.Id}>
                                                            <Checkbox checked={valores.indexOf(item.Id) > -1} />
                                                            <ListItemText primary={item.Title} />
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </div>
                                    case 'SelectYesNo':
                                        return <div key={campo.ID} className="form-group">
                                            <label>{campo.Title}</label>
                                            <select className="form-control form-control-md" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} onBlur={this.onCambiar} defaultValue={campo.valor} required={campo.Requerido} disabled={!campo.Editable}>
                                                <option key={0} value={'0'}>Selecione...</option>
                                                <option key={1} value={'1'}>Sí</option>
                                                <option key={2} value={'2'}>No</option>
                                            </select>
                                        </div>
                                    case 'SelectYN':
                                        return <div key={campo.ID} className="form-group">
                                            <label>{campo.Title}</label>
                                            <select className="form-control form-control-md" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} onBlur={this.onCambiar} defaultValue={campo.valor} required={campo.Requerido} disabled={!campo.Editable}>
                                                <option key={0} value={0}>Selecione...</option>
                                                <option key={1} value={true}>Sí</option>
                                                <option key={2} value={false}>No</option>
                                            </select>
                                        </div>
                                    case 'Text':
                                        return <div key={campo.ID} className="form-group">
                                            <label>{campo.Title}</label>
                                            <input className={'form-control form-control-md' + (campo.Requerido ? ' is-invalid' : '')} type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} maxLength={campo.Parametros} ref={this[campo.TituloInternoDelCampo]} onBlur={this.onCambiar} defaultValue={campo.valor} required={campo.Requerido} disabled={!campo.Editable} />
                                        </div>
                                    case 'TextArea':
                                        return <div key={campo.ID} className="form-group">
                                            <label>{campo.Title}</label>
                                            <textarea className={'form-control form-control-md' + (campo.Requerido ? ' is-invalid' : '')} rows={1} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} onBlur={this.onCambiar} defaultValue={campo.valor} required={campo.Requerido} disabled={!campo.Editable}></textarea>
                                        </div>
                                    case 'UserPicker':
                                        return <div key={campo.ID} className="form-group">
                                            <label>{campo.Title}</label>
                                            <UserPicker id= {campo.TituloInternoDelCampo} usuarios={this.state.usuarios} itemsSeleccionados={campo.valor} seleccionarItems={this.onSeleccionarItems} disabled={!this.props.abrir.esTarea ? false : (this.props.abrir.filaSeleccionada.Estatus.ID === 3 ? true : false)} />
                                        </div>
                                    default:
                                        break;
                                }
                            })()}
                        </div>
                    )
                }
            });
            return <div className='form-row col-md-12 align-items-end'>{formulario}</div>
        }

        const Botones = () => {
            switch (boton) {
                case "Enviar":
                    return (
                        <div key={ID} className="row">
                            <input type="button" className="btn btn-info btn-md" onClick={this.onEnviar} value='Enviar' />
                        </div>
                    )
                case "GuardarEnviar":
                    return (
                        <div key={ID} className="row">
                            <input type='button' className="btn btn-info btn-md" onClick={this.onEnviar} value='Enviar ' />
                            <input type="button" className="btn btn-info btn-md" onClick={this.onGuardar} value='Guardar' />
                        </div>
                    )
                case "Guardar":
                    return (
                        <div key={ID} className="row">
                            <input type="button" className="btn btn-info btn-md" onClick={this.onGuardar} value='Guardar' />
                        </div>
                    )
                default:
                    break;
            }
        }

        const closeBtn = <button className="close" onClick={this.onCerrar}>X</button>
        return (
            <div>
                {this.state.campos.length > 0 && !this.state.backdrop.abierto ?
                    <Modal isOpen={abrir.abierto} size={abrir.size}>
                        <ModalHeader className='encabezado' close={closeBtn}>{this.state.campos[0].Tarea.Title}</ModalHeader>
                        <form action='' className={idTarea !== 24 && idTarea !== 25 && idTarea !== 30 && idTarea !== 35 && idTarea !== 268 && idTarea !== 271 && idTarea !== 272 && idTarea !== 289 ? 'was-validated' : ''} ref={this.form} onSubmit={e => e.preventDefault()}>
                            <div className='datoTerreno'>{abrir.terreno}</div>
                            <fieldset disabled={!abrir.esTarea ? false : (abrir.filaSeleccionada.Estatus.ID === 3 || !editablePorUsuario ? true : false)}>
                                <ModalBody className='form-row'>
                                    {
                                        idTarea === 25 || idTarea === 30 || idTarea === 35 ?
                                            <SeleccionRFS datos={abrir.filaSeleccionada} tipo={this.state.campos[0].TituloInternoDelCampo} datosRetorno={this.onEnviar} cerrar={this.onCerrar} webs={webs} />
                                            : (idTarea === 271 ? <ActividadFicticia datos={abrir.filaSeleccionada} esTarea={abrir.esTarea} datosRetorno={this.onGuardar} cerrar={this.onCerrar} usuarioActual={abrir.usuarioActual} gruposUsuarioActual={abrir.gruposUsuarioActual} webs={webs} />
                                                : (idTarea === 272 ? <Detalle datos={abrir.filaSeleccionada} datosRetorno={this.onGuardar} cerrar={this.onCerrar} webs={webs} />
                                                    : (idTarea === 289 ? <EditarCluster datos={abrir.filaSeleccionada} datosRetorno={this.onGuardar} cerrar={this.onCerrar} webs={webs} /> : <Formulario />)))
                                    }
                                </ModalBody>
                                <ModalFooter>
                                    {
                                        idTarea === 25 || idTarea === 30 || idTarea === 35 || idTarea === 271 || idTarea === 272 || idTarea === 289 ? null
                                        : <Botones />
                                    }
                                </ModalFooter>
                            </fieldset>
                        </form>
                    </Modal>
                    :
                    <Backdrop abierto={this.state.backdrop.abierto} mensaje={this.state.backdrop.mensaje} />
                }
            </div>
        );
    }
}

export default Ventana;