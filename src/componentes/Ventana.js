import React, { Component, createRef } from 'react';
import SeleccionRFS from './SeleccionRFS'
import ActividadFicticia from './ActividadFicticia'
import Detalle from './Detalle.js'
import EditarCluster from './EditarCluster.js'
import PeoplePicker from './UserPicker'
import update from 'immutability-helper';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { sp } from "@pnp/sp";
import { Web } from "@pnp/sp/webs";
import $ from "jquery";
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
import util from '../js/util'
import '../estilos/modal.scss';
import moment from 'moment';

import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';

const currentWeb = Web(window.location.protocol + '//' + window.location.host + "/CompraDeTerreno/")

class Ventana extends Component {
    constructor(props) {
        super(props)
        this.form = createRef()
        this.validate = this.validate.bind(this)
        this.initialState = {
            idTarea: this.props.abrir.filaSeleccionada.Tarea !== undefined ? this.props.abrir.filaSeleccionada.Tarea.ID : (this.props.abrir.filaSeleccionada.IdTarea !== undefined ? this.props.abrir.filaSeleccionada.IdTarea.ID: this.props.abrir.filaSeleccionada.ID),
            campos: [],
            catalogoEstatus: [],
            usuarios: [],
            ejecutado: false,
            usuarioAsignados: props.abrir.id === 270 ? props.datos.valor : [],
            radioChecked: props.datos.valor,
            archivosCargados:[],
            lista: this.props.abrir.filaSeleccionada.Lista,
            esIframe: this.props.abrir.filaSeleccionada.IdTarea !== undefined ? this.props.abrir.filaSeleccionada.IdTarea.AbrirLink : 0,
            archivosValidos: ['jpg', 'jpeg', 'png', 'pdf', 'zip', 'rar', 'xls', 'xlsx'],
            catalogo: [],
            camposLista:[],
            refs: {},
            datosTramite: [],
            editablePorUsuario: true
        }
        this.onGuardar = this.onGuardar.bind(this);
        this.onEnviar = this.onEnviar.bind(this);
        this.state = this.initialState
    }
    //#region Eventos de botones
    async onGuardar(datos) {
        //Si los datos de la ventana no son de una tarea de Flujo tareas...
        if(!this.props.abrir.esTarea){
            switch (this.props.abrir.id) {
                //Establece el MACO para el/los terrenos
                case 268:
                    if (!this.props.rfs) {
                        const items = await sp.web.lists.getByTitle("Terrenos").items.filter('IdProyectoInversionId eq ' + this.props.idPITerr + ' and Empadronamiento eq null').get();
    
                        if (items.length > 0) {
                            for (var i = 0; i < items.length; i++) {
                                await sp.web.lists.getByTitle("Terrenos").items.getById(items[i].ID).update({
                                    MACO: this.state.radioChecked
                                });
                            }
                        }
                        this.props.evento({ tarea: 0, dato: this.state.radioChecked })
                    } else {
                        const items = await sp.web.lists.getByTitle("Terrenos").items.filter('ID eq ' + this.props.idPITerr).get();
    
                        if (items.length > 0) {
                            await sp.web.lists.getByTitle("Terrenos").items.getById(items[0].ID).update({
                                MACO: this.state.radioChecked
                            });
                        }
                        this.props.evento(this.state.radioChecked)
                        this.onCerrar()
                    }
                    break;
                case 270:
                    //Establece los usuarios asignados del modal de Asignado a
                    this.props.evento({ tarea: 0, dato: this.state })
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
        else{
            let {camposLista} = this.state
            //Si los datos de la ventana  sí son de una tarea de Flujo tareas...
            //let camposLista = util.groupBy(this.state.camposLista, 'listaPrincipal')
            const listas = []
            for(let prop in camposLista){
                listas.push(prop)
            }

            await this.guardarDatos(listas, camposLista).then(()=>{
                if(this.props.abrir.filaSeleccionada.Lista === 'Flujo Tareas'){
                    this.props.evento({ tarea: this.props.abrir.filaSeleccionada.IdTarea.ID, dato: this.state.catalogoEstatus.find(x=> x.ID == 2) })
                }else{
                    this.props.evento({ tarea: this.state.datosTramite[0].IdTareaId, dato: this.state.catalogoEstatus.find(x=> x.ID == 2) })
                }
                this.onCerrar()
            })
        }
    }

    async onEnviar(datos) {
        const { idTarea, radioChecked } = this.state
        //switch (this.props.abrir.filaSeleccionada.Tarea.ID) {
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
                        //Guarda el tipo de RFSN seleccionado
                        await sp.web.lists.getByTitle(this.state.campos[0].ListaDeGuardado).items.add({
                            IdProyectoInversionId: this.props.abrir.filaSeleccionada.ProyectoInversion.ID,
                            IdFlujoId: this.props.abrir.id,
                            FRSN: this.state.radioChecked
                        }).then(async () => {
                            //Actualiza el estatus del elemento de la EG
                            await sp.web.lists.getByTitle("EstrategiaGestion").items.getById(this.props.abrir.filaSeleccionada.ID).update({
                                EstatusId: 3
                            }).then(async () => {
                                //Establece la tarea como Enviada
                                await sp.web.lists.getByTitle("Flujo Tareas").items.getById(this.props.abrir.id).update({
                                    EstatusId: 3,
                                    EstatusAnteriorId: 3
                                }).then(async () => {
                                    //Verifica si se creará una nueva tarea, dependiento del valor de RFNS seleccionado
                                    if (idNuevaTarea !== 0) {
                                        const datosNuevaTarea = await sp.web.lists.getByTitle('Tareas').items.getById(idNuevaTarea).get();
                                        //Crea la nueva tarea en Flujo Tareas
                                        await sp.web.lists.getByTitle("Flujo Tareas").items.add({
                                            IdProyectoInversionId: this.props.abrir.filaSeleccionada.ProyectoInversion.ID,
                                            IdTareaId: idNuevaTarea,
                                            NivelId: datosNuevaTarea.NivelId,
                                            GrupoResponsableId: datosNuevaTarea.GrupoId,
                                            AsignadoA: { results: [] },
                                            EstatusId: 1,
                                            EstatusAnteriorId: 1,
                                            Visible: true,
                                        }).then(async result => {
                                            //Crea el elemento en la estrategia de gestión
                                            await sp.web.lists.getByTitle("EstrategiaGestion").items.add({
                                                ProyectoInversionId: this.props.abrir.filaSeleccionada.ProyectoInversion.ID,
                                                TareaId: idNuevaTarea,
                                                GrupoResponsableId: datosNuevaTarea.GrupoId,
                                                Seleccionado: false,
                                                IdFlujoTareasId: result.data.Id,
                                                EstatusId: 1,
                                                OrdenEG: datosNuevaTarea.OrdenEG
                                            })
                                            //Establecer estado para nueva tarea creada
                                            //Manda el ID de la tarea actual y el dato para saber si deberá genera la EG
                                            this.props.evento({ tarea: this.props.abrir.filaSeleccionada.Tarea.ID, dato: false })
                                        }).catch(error => {
                                            alert('Error al guardar: ' + error)
                                        })
                                    } else {
                                        //Sino pasa por RFS (Ninguno), crea el resto de la EG
                                        //Manda el ID de la tarea actual y el dato para saber si deberá genera la EG
                                        this.props.evento({ tarea: idTarea, dato: true })
                                    }
                                }).catch(error => {
                                    alert('Error al guardar: ' + error)
                                })
                            }).catch(error => {
                                alert('Error al guardar: ' + error)

                            })

                        }).catch(error => {
                            alert('Error al guardar: ' + error)
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
                //Actualiza el estatus del elemento de la EG
                await sp.web.lists.getByTitle("EstrategiaGestion").items.getById(this.props.abrir.filaSeleccionada.ID).update({
                    EstatusId: 3
                }).then(() => {
                    //Manda el ID de la tarea actual y el dato para saber si deberá genera la EG
                    this.props.evento({ tarea: idTarea, dato: datos })
                    this.props.cerrar();
                })
                break;
            default:
                const valido = this.form.current.reportValidity()
                if(valido){
                    let {camposLista} = this.state
                    const listas = []
                    for(let prop in camposLista){
                        listas.push(prop)
                    }
                    
                    await this.guardarDatos(listas, camposLista).then(async()=>{
                        if(this.props.abrir.filaSeleccionada.Lista === 'Flujo Tareas'){
                            await util.crearBitacoras(this.props.abrir.filaSeleccionada.IdTarea.ID, this.props.abrir.filaSeleccionada.IdTerreno, this.props.abrir.filaSeleccionada.IdProyectoInversion, this.props.abrir.filaSeleccionada.IdTarea.TareaCrear)
                            this.props.evento({ tarea: this.props.abrir.filaSeleccionada.ID, dato: this.state.catalogoEstatus.find(x=> x.ID == 3) })
                        }else{
                            this.props.evento({ tarea: this.state.datosTramite[0].IdTareaId, dato: this.state.catalogoEstatus.find(x=> x.ID == 3) })
                        }
                        this.onCerrar()
                    })
                }else{
                    this.form.current.reportValidity()
                }
                break;
        }
    }

    onCerrar = () => {
        this.setState(this.initialState)
        this.props.cerrar()
    }
    //#endregion

    guardarDatos = async (listas, camposLista) => {
        await util.asyncForEach(listas, async lista=>{
            if(lista!== 'Documentos' && lista!== 'null'){
                let newCamposLista = camposLista[lista]
                let json = {}
                
                let idElemento = util.obtenerIdActualizarPorLista(this.props.abrir.filaSeleccionada, newCamposLista[0].listaPrincipalIN)
                if(lista === 'Relación Fechas Aprobación Terreno'){
                    await util.asyncForEach(newCamposLista, async campoLista =>{
                        json = {}
                        const campoRef = this.state.refs[campoLista.campo]
                        campoLista.valor = campoRef.current.value
                        const valor = util.returnDataByFieldType(campoRef.current.value, campoLista.tipo)
                        if(valor !== ''){
                            json.Title = idElemento.toString()
                            json.Fecha = valor
                            json.Campo = campoLista.campo
                        }
                        const datos = await sp.web.lists.getByTitle(lista).items.select('Fecha','Campo').filter('ID eq ' + idElemento).get()
                        if(datos.length === 0){
                            if(Object.keys(json).length > 0){
                                await sp.web.lists.getByTitle(lista).items.add(json)
                                .catch(error=>{
                                    alert('Error al insertar en la lista ' + lista + ': ' + error)
                                })
                            }
                        }else{
                            await sp.web.lists.getByTitle(lista).items.getById(idElemento).update(json)
                            .catch(error=>{
                                alert('Error al actualizar la lista ' + lista + ': ' + error)
                            })
                        }
                    })
                }else if(lista === 'Fechas paquete de trámites'){
                    const tramites = this.state.campos.filter(x=>x.Tramite == 'Trámite')
                    await util.asyncForEach(tramites, async tramite =>{
                        if(this.props.abrir.filaSeleccionada.Lista === 'Flujo Tareas')
                        { json = {'IdFlujoId': idElemento, 'Title': this.props.abrir.filaSeleccionada.IdTerreno.Title, 'IdDocTaskId': tramite.IdRTD, 'IdDocTramiteId': tramite.IdTramite} }
                        else if(this.props.abrir.filaSeleccionada.Lista === 'Fechas paquete de trámites')
                        { json = {'IdFlujoId': idElemento, 'Title': this.state.datosTramite[0].IdTerreno.Title, 'IdDocTaskId': tramite.IdRTD, 'IdDocTramiteId': tramite.IdTramite} }
                        const camposFPT = newCamposLista.filter(x=>x.campo.includes(tramite.TituloInternoDelCampo))
                        await util.asyncForEach(camposFPT, async campoFPT =>{
                            const campoRef = this.state.refs[campoFPT.campo]
                            json[util.obtenerNodoJSON(campoFPT.campo, 'IN')] = campoFPT.campo
                            const valor = util.returnDataByFieldType(campoFPT.tipo !== 'CheckBox' ? campoRef.current.value : campoRef.current.checked , campoFPT.tipo)
                            if(valor !== ''){
                                json[util.obtenerNodoJSON(campoFPT.campo, 'Fecha')] = valor
                            }
                        })

                        const datos = await sp.web.lists.getByTitle(lista).items
                        .select('FechaDeIngreso','FechaDeLaPrevencion','FechaDeResolucion','FechaVigencia','InternalNameFdeI','InternalNameFdeI',
                                'InternalNameFdeLaP','InternalNameFdeR','InternalNameFdeV','IdDocTaskId','IdDocTramiteId', 'ID')
                        .filter('IdFlujoId eq ' + idElemento + ' and IdDocTaskId eq ' + tramite.IdRTD + ' and IdDocTramiteId eq ' + tramite.IdTramite).get()

                        if(datos.length === 0){
                            await sp.web.lists.getByTitle(lista).items.add(json)
                            .catch(error=>{
                                alert('Error al insertar en la lista ' + lista + ': ' + error)
                            })
                        }else{
                            await sp.web.lists.getByTitle(lista).items.getById(datos[0].ID).update(json)
                            .catch(error=>{
                                alert('Error al actualizar la lista ' + lista + ': ' + error)
                            })
                        }
                    })
                }else if(lista === 'Relación DRO´s Proyectos deptos'){
                    await util.asyncForEach(newCamposLista, async campoLista =>{
                        json = {}
                        const campoRef = this.state.refs[campoLista.campo]
                        campoLista.valor = campoRef.current.value
                        const valor = util.returnDataByFieldType(campoRef.current.value, campoLista.tipo)
                        if(valor >0){
                            json.Title = this.props.abrir.filaSeleccionada.IdTerreno.Title
                            json.CategoriaId = valor
                            json.IdResponsable = campoLista.campo
                        }
                        const datos = await sp.web.lists.getByTitle(lista).items.filter("Title eq '" + this.props.abrir.filaSeleccionada.IdTerreno.Title + "' and IdResponsable eq '" + campoLista.campo + "'")
                        .get()
                        .catch(error=>{
                            alert('Error al consultar datos en la lista ' + lista + ': ' + error)
                        })
                        if(datos.length === 0){
                            if(Object.keys(json).length > 0){
                                await sp.web.lists.getByTitle(lista).items.add(json)
                                .catch(error=>{
                                    alert('Error al insertar en la lista ' + lista + ': ' + error)
                                })
                            }
                        }else{
                            await sp.web.lists.getByTitle(lista).items.getById(datos[0].ID).update(json)
                            .catch(error=>{
                                alert('Error al actualizar la lista ' + lista + ': ' + error)
                            })
                        }
                    })
                }else if(lista === 'Relación Bancos Proyectos Deptos'){
                    const datos = await sp.web.lists.getByTitle(lista).items.filter("IdFlujo eq " + this.props.abrir.filaSeleccionada.ID)
                    .get()
                    .catch(error=>{
                        alert('Error al consultar datos en la lista ' + lista + ': ' + error)
                    })

                    if(datos.length > 0){
                        await util.asyncForEach(datos, async dato =>{
                            await sp.web.lists.getByTitle(lista).items.getById(dato.Id).delete()
                        })
                    }
                    await util.asyncForEach(newCamposLista, async (campoLista) =>{
                        campoLista.valor = this.state.campos.find(x=> x.TituloInternoDelCampo === campoLista.campo).valor
                        await util.asyncForEach(campoLista.valor, async (valor) =>{
                            json = {}
                            if(valor >0){
                                json.Title = this.props.abrir.filaSeleccionada.IdTerreno.Title
                                json.IdFlujo = this.props.abrir.filaSeleccionada.ID
                                json.NombreDelBancoId = valor
                            }
                            if(Object.keys(json).length > 0){
                                await sp.web.lists.getByTitle(lista).items.add(json)
                                .catch(error=>{
                                    alert('Error al insertar en la lista ' + lista + ': ' + error)
                                })
                            }
                        })
                    })
                }else{
                    newCamposLista.map((campoLista)=>{
                        const campoRef = this.state.refs[campoLista.campo]
                        campoLista.valor = campoRef.current.value
                        json[campoLista.campo] = util.returnDataByFieldType(campoRef.current.value, campoLista.tipo)
                        return campoLista
                    })
                    if((this.state.idTarea === 20 || this.state.idTarea === 28 || this.state.idTarea === 33 || this.state.idTarea === 38) && lista === 'Terrenos'){
                        json.NombredelTerreno2 = json.Calle + ' - ' + json.NoExterior
                    }else if(this.state.idTarea === 98){
                        json.LinkFichasVenta = 'Documents/' + this.props.abrir.filaSeleccionada.IdProyectoInversion.Title + '/' + this.props.abrir.filaSeleccionada.IdTerreno.Title + '/' + json.ClaveDesarrollo + '/Fichas de venta'
                        json.LinkMemoriaAcabados = 'Documents/' + this.props.abrir.filaSeleccionada.IdProyectoInversion.Title + '/' + this.props.abrir.filaSeleccionada.IdTerreno.Title + '/' + json.ClaveDesarrollo + '/Memoria de acabados'
                        json.LinkFichasDesarrollo = 'Documents/' + this.props.abrir.filaSeleccionada.IdProyectoInversion.Title + '/' + this.props.abrir.filaSeleccionada.IdTerreno.Title + '/' + json.ClaveDesarrollo + '/Fichas del desarrollo'
                    }
                    await sp.web.lists.getByTitle(lista).items.getById(idElemento).update(json)
                    .catch(error=>{
                        alert('Error al actualizar la lista ' + lista + ': ' + error)
                    })
                }
            }
        })
    }

    validate() {
        this.form.current.reportValidity()
    }

    obtenerTotalTerrenosPI = async () => {
        const terrenos = await sp.web.lists.getByTitle("Terrenos").items.filter('IdProyectoInversionId eq ' + this.props.abrir.filaSeleccionada.ProyectoInversion.ID + ' and Empadronamiento eq null').get();
        return terrenos.length
    }

    obtenerCampos = async id => {
        let {refs, camposLista, catalogo, archivosCargados, idTarea, datosTramite} = this.state
        let catalogoEstatus = await sp.web.lists.getByTitle('Estatus').items
        .select('ID', 'Title')
        .filter("Categoria eq 'Automático'")
        .get()

        if (!this.props.abrir.esTarea) {
            if (id > 0) {
                //Obtiene los campos a pintar en el formulario
                let campos = await sp.web.lists.getByTitle('Relación campos documentos trámites tareas').items
                    .select('Tarea/ID', 'Tarea/Title', 'Title', 'TituloInternoDelCampo', 'TipoDeCampo', 'ListaDeGuardado', 'Editable',
                        'ListaDeGuardadoIN', 'ListaDeGuardadoSecundario', 'ListaDeGuardadoSecundarioIN', 'Catalogos', 'Ordenamiento',
                        'Requerido', 'Tramite', 'Activo', 'Boton', 'IdRTD', 'IdTramite', 'IdDocumento', 'Url', 'EstiloColumna',
                        'Accion', 'Parametros')
                    .filter('(TareaId eq ' + id + ') and (Activo eq 1)')
                    .expand('Tarea')
                    .orderBy('Ordenamiento', true).get()
                this.setState({ campos: campos, catalogoEstatus: catalogoEstatus })
            }
        } else {
            const filtroConsulta = this.props.abrir.filaSeleccionada.Lista === undefined ? '(TareaId eq ' + this.props.abrir.filaSeleccionada.Tarea.ID + ') and (Activo eq 1)'
            : (this.props.abrir.filaSeleccionada.Lista === 'Flujo Tareas' ? '(TareaId eq ' + this.props.abrir.filaSeleccionada.IdTarea.ID + ') and (Activo eq 1)'
                : (this.props.abrir.filaSeleccionada.Lista === 'Fechas paquete de trámites' ? (this.props.abrir.filaSeleccionada.IdDocTaskId !== null ? 'IdRTD eq ' + this.props.abrir.filaSeleccionada.IdDocTaskId : 'IdTramite eq ' + this.props.abrir.filaSeleccionada.IdDocTramite.ID)
                    : '(TareaId eq ' + this.props.abrir.filaSeleccionada.Tarea+ ') and (Activo eq 1)'))
            //Obtiene los campos a pintar en el formulario
            await sp.web.lists.getByTitle('Relación campos documentos trámites tareas').items
                .select('Tarea/ID', 'Tarea/Title', 'Title', 'TituloInternoDelCampo', 'TipoDeCampo', 'ListaDeGuardado', 'Editable',
                    'ListaDeGuardadoIN', 'ListaDeGuardadoSecundario', 'ListaDeGuardadoSecundarioIN', 'Catalogos', 'Ordenamiento',
                    'Requerido', 'Tramite', 'Activo', 'Boton', 'IdRTD', 'IdTramite', 'IdDocumento', 'Url', 'EstiloColumna',
                    'Accion', 'Parametros')
                .filter(filtroConsulta)
                .expand('Tarea')
                .orderBy('Ordenamiento', true)
                .get()
                .then(async (campos)=>{
                    const catalogos = campos.filter(x=> x.Catalogos)
                    if(catalogos.length >0){
                        await util.asyncForEach(catalogos, async cat=>{
                            const results = cat.Parametros !== null ? await this[cat.Catalogos](cat.Parametros) : await this[cat.Catalogos]()
                            catalogo.push({campo: cat.TituloInternoDelCampo, datos: results})
                        })
                    }
                    campos.map((campo)=>{
                        refs[campo.TituloInternoDelCampo] = this[campo.TituloInternoDelCampo] = createRef()
                        if(!camposLista.some(x=>x.campo === campo.TituloInternoDelCampo)){
                            camposLista.push({idTarea: campo.Tarea.ID, campo: campo.TituloInternoDelCampo, tipo: campo.TipoDeCampo, listaPrincipal: campo.ListaDeGuardado, listaPrincipalIN: campo.ListaDeGuardadoIN, listaSecundaria: campo.ListaDeGuardadoSecundaria, listaSecundariaIN: campo.ListaDeGuardadoSecundariaIN, Tramite: campo.Tramite, valor: ''})
                        }
                        return
                    })

                    camposLista = util.groupBy(this.state.camposLista, 'listaPrincipal')
                    const listas = []
                    for(let prop in camposLista){
                        listas.push(prop)
                    }

                    if(this.props.abrir.filaSeleccionada.Lista === 'Fechas paquete de trámites'){
                        datosTramite = await sp.web.lists.getByTitle('Flujo Tareas').items
                        .select('ID', 'IdProyectoInversion/ID', 'IdProyectoInversion/Title', 'IdTerreno/ID', 'IdTerreno/Title',
                                'Nivel/ID', 'Nivel/Title', 'IdTareaId')
                        .filter('ID eq ' + this.props.abrir.filaSeleccionada.IdFlujoId)
                        .expand('IdProyectoInversion','IdTerreno','Nivel')
                        .get()
                        .catch(error =>{
                            alert('Error al obtener los datos preliminares del trámite: ' + error)
                        })
                    }
                    const obtenerDatos = async () => {
                        await util.asyncForEach(listas, async lista=>{
                            if(lista!== 'Documentos' && lista!== 'null'){
                                let elementos = camposLista[lista]
                                const camposSelect = elementos.map((campoLista)=>{
                                    return campoLista.campo
                                }).join(',')
                                let idElemento = util.obtenerIdActualizarPorLista(this.props.abrir.filaSeleccionada, elementos[0].listaPrincipalIN)
                                if(lista === 'Relación Fechas Aprobación Terreno'){
                                    const datos = await sp.web.lists.getByTitle(lista).items.select('Fecha','Campo').filter('Title eq ' + idElemento.toString()).get()
                                    if(datos.length > 0){
                                        campos.map((campo)=>{
                                            const newCampo = datos.find(x=> x.Campo === campo.TituloInternoDelCampo)
                                            if(newCampo !== undefined){
                                                campo.valor = util.returnDataByFieldType(newCampo.Fecha, campo.TipoDeCampo)
                                            }
                                            return campo
                                        })
                                    }
                                }else if(lista === 'Fechas paquete de trámites'){
                                    const tramites = campos.filter(x=>x.Tramite == 'Trámite')
                                    await util.asyncForEach(tramites, async tramite =>{
                                        const datos = await sp.web.lists.getByTitle(lista).items
                                        .select('FechaDeIngreso','FechaDeLaPrevencion','FechaDeResolucion','FechaVigencia','InternalNameFdeI','InternalNameFdeI',
                                                'InternalNameFdeLaP','InternalNameFdeR','InternalNameFdeV','IdDocTaskId','IdDocTramiteId', 'ID', 'NoAplica')
                                        .filter('IdFlujoId eq ' + idElemento + ' and IdDocTaskId eq ' + tramite.IdRTD + ' and IdDocTramiteId eq ' + tramite.IdTramite)
                                        .get()
                                        .catch(error=>{
                                            alert('Error al leer la lista ' + lista + ': ' + error)
                                        })
                                        
                                        let noAplica = false
                                        if(datos.length>0){
                                            campos.map((campo)=>{
                                                if((campo.TipoDeCampo === 'Date' || campo.TipoDeCampo === 'CheckBox') && campo.TituloInternoDelCampo.substring(4) === tramite.TituloInternoDelCampo){
                                                    campo.valor = util.obtenerValorCampoFPT(campo.TituloInternoDelCampo, datos[0])
                                                    if(typeof campo.valor === 'boolean'){
                                                        noAplica = campo.valor
                                                    }else{
                                                        if(noAplica){
                                                            campo.Editable = false
                                                        }
                                                    }
                                                }else if(campo.TipoDeCampo === 'File' && (campo.TituloInternoDelCampo === tramite.TituloInternoDelCampo || campo.TituloInternoDelCampo.substring(4) === tramite.TituloInternoDelCampo) && noAplica){
                                                    campo.Editable = false
                                                    campo.Requerido = false
                                                }
                                                return campo
                                            })
                                        }
                                    })
                                }else if(lista === 'Relación DRO´s Proyectos deptos'){
                                    const datos = await sp.web.lists.getByTitle(lista).items.filter("Title eq '" + this.props.abrir.filaSeleccionada.IdTerreno.Title + "'")
                                    .get()
                                    .catch(error=>{
                                        alert('Error al consultar datos en la lista ' + lista + ': ' + error)
                                    })
                                    if(datos.length > 0){
                                        campos.map((campo)=>{
                                            const newCampo = datos.find(x=> x.IdResponsable === campo.TituloInternoDelCampo)
                                            if(newCampo !== undefined){
                                                campo.valor = util.returnDataByFieldType(newCampo.CategoriaId, campo.TipoDeCampo)
                                            }
                                            return campo
                                        })
                                    }
                                }else if(lista === 'Relación Bancos Proyectos Deptos'){
                                    const datos = await sp.web.lists.getByTitle(lista).items.select('NombreDelBancoId').filter('IdFlujo eq ' + this.props.abrir.filaSeleccionada.ID).get()
                                    if(datos.length > 0){
                                        campos.map((campo)=>{
                                            if(campo.TituloInternoDelCampo === elementos[0].campo){
                                                campo.valor = datos.map((dato)=>{ return dato.NombreDelBancoId })
                                            }
                                            return campo
                                        })
                                    }
                                }else{
                                    await sp.web.lists.getByTitle(lista).items.getById(idElemento).select(camposSelect).get().then((datos)=>{
                                        campos.map((campo)=>{
                                            const valor = datos[campo.TituloInternoDelCampo]
                                            if(valor!== undefined)
                                            {campo.valor = util.returnDataByFieldType(valor, campo.TipoDeCampo)}
                                            return campo
                                        })
                                    })
                                }
                            }else if(lista === 'Documentos'){
                                const urlDoctos = this.props.abrir.filaSeleccionada.Lista === 'Fechas paquete de trámites' ?
                                    this.props.abrir.filaSeleccionada.PI + '/' + this.props.abrir.filaSeleccionada.Title :
                                    (this.props.abrir.filaSeleccionada.Nivel.ID === 1 ? this.props.abrir.filaSeleccionada.IdProyectoInversion.Title : this.props.abrir.filaSeleccionada.IdProyectoInversion.Title + '/' + this.props.abrir.filaSeleccionada.IdTerreno.Title)
                                let elementos = camposLista[lista]
                                await util.asyncForEach(elementos, async elementos=>{
                                    const result = await this.obtenerDocumentosCargados(urlDoctos, elementos.campo)
                                    if(result!== undefined)
                                    { archivosCargados.push({nombreInterno: result.Title, archivo: result.Name, icono: result.rootURL +  '/CompraDeTerreno/images/iconos/' + result.extension + '.png', url: result.rootURL + result.ServerRelativeUrl, requerido: false }) }
                                })
                            }
                        })
                    }
                    if(idTarea === 24 || idTarea === 25 || idTarea === 30 || idTarea === 35 || idTarea === 271 || idTarea === 272 || idTarea === 289){
                        this.setState({ campos: campos, catalogoEstatus: catalogoEstatus })
                    }else{
                        await obtenerDatos().then(()=>{
                            const existeGrupo = this.props.abrir.gruposUsuarioActual.some(x=> x.ID === this.props.abrir.filaSeleccionada.GrupoResponsable.ID)
                            const idsAsignados = util.obtenerIdAsignados(this.props.abrir.filaSeleccionada.AsignadoA)
                            const existeAsignado = idsAsignados.results.includes(this.props.abrir.usuarioActual.Id)
                            this.setState({ campos: campos, catalogoEstatus: catalogoEstatus, catalogo: catalogo, refs: refs, camposLista: camposLista, archivosCargados: archivosCargados, datosTramite: datosTramite, editablePorUsuario: (existeGrupo || existeAsignado) })
                        })
                    }
                })
                .catch(error =>{
                    alert('Error al obtener los campos de la ventana: ' + error)
                })
        }
    }

    //#region Métodos de ciclo de vida
    async componentDidMount() {
        const {archivosCargados} = this.state
        if (this.props.abrir.abierto) {
            if (this.props.abrir.id === 270) {
                const users = await sp.web.siteUsers();
                this.obtenerPosiciones(users)
                this.setState({ usuarios: users })
            } else if (this.props.abrir.filaSeleccionada.Tarea !== undefined){
                //Cuando la tarea viene de estrategia de gestión
                if (this.props.abrir.filaSeleccionada.Tarea.ID === 24) {
                    if (this.props.abrir.filaSeleccionada.Estatus.ID === 3) {
                        this.obtenerDatosGuardados(this.props.abrir.id)
                    }
                } else if (this.props.abrir.filaSeleccionada.Tarea.ID === 269){
                    const urlDoctos = !this.props.abrir.filaSeleccionada.esRFS ? this.props.abrir.filaSeleccionada.ProyectoInversion.title : this.props.abrir.filaSeleccionada.ProyectoInversion.title + '/' + this.props.abrir.filaSeleccionada.Terreno.title
                    const result = await this.obtenerDocumentosCargados(urlDoctos, 'EGAutorizada')
                    if(result!== undefined)
                    { archivosCargados.push({nombreInterno: result.Title, archivo: result.Name, icono: result.rootURL +  '/CompraDeTerreno/images/iconos/' + result.extension + '.png', url: result.rootURL + result.ServerRelativeUrl }) }
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
    onSeleccionarItems = items => {
        this.setState({ usuarioAsignados: items })
    }

    onSeleccionar = e => {
        const { id } = e.target;
        this.setState({ radioChecked: id });
    }

    onSeleccionMultiple = (event) => {
        const filaIndice = this.state.campos.findIndex(x=> x.TituloInternoDelCampo === event.target.name)
        let campoActual = this.state.campos[filaIndice]
        campoActual.valor = event.target.value
        let datosActualizados = update(this.state.campos, { $splice: [[filaIndice, 1, campoActual]] })
        this.setState({campos: datosActualizados})
    }

    obtenerPosiciones = usuarios => {
        var items = this.state.usuarioAsignados.map((usuario) => {
            if (usuario.Id !== undefined) { return usuarios[usuarios.findIndex((obj => obj.Id === usuario.Id))] }
            else if (usuario.ID !== undefined) { return usuarios[usuarios.findIndex((obj => obj.Id === usuario.ID))] }
            return usuario
        })
        this.setState({ usuarioAsignados: items })
    }

    obtenerDatosGuardados = async (id) => {
        const item = await sp.web.lists.getByTitle("RFSN").items
            .filter('IdFlujoId eq ' + id + 'and IdTerrenoId eq null')
            .get()
        if (item.length > 0) {
            this.setState({ radioChecked: item[0].FRSN })
        }
    }

    obtenerDocumentosCargados = async (url, documento) =>{
        let result = {}
        const rootweb = await sp.web.getParentWeb()
        let webCdV = Web(rootweb.data.Url)
        await webCdV.getFolderByServerRelativeUrl('/Documents/' + url).files.get().then(items=>{
            result = items.find(x=> x.Title === documento)
            if(result !== undefined){
                result.extension = result.Name.split('.').pop()
                result.rootURL = rootweb.data.Url
            }
        })
        return result
    }

    obtenerGrupos = async () =>{
        return await sp.web.siteGroups();
    }

    obtenerSiNo = async () =>{
        return await [{Id: 0, Title: 'Sí'}, {Id: 1, Title: 'No'}]
    }

    obtenerDRO = async (params) =>{
        return await sp.web.lists.getByTitle("DRO´s").items.filter("Title eq '" + params + "'").get()
    }

    obtenerEmpresas = async (params) =>{
        return await sp.web.lists.getByTitle("Empresas").items.filter("Activo eq " + parseInt(params)).get()
    }

    CatBancos = async () =>{
        return await sp.web.lists.getByTitle("Catálogo de bancos").items.get()
    }

    respaldarValores = ()=>{
        let datosActualizados = []
        for(let ref in this.state.refs){
            const valor = this.state.refs[ref].current !== null ? this.state.refs[ref].current.value : ''
            if(valor !== ''){
                const filaIndice = this.state.campos.findIndex(campo => campo.TituloInternoDelCampo === ref)
                let campoActual = this.state.campos[filaIndice]
                campoActual.valor = valor
                datosActualizados = update(this.state.campos, { $splice: [[filaIndice, 1, campoActual]] })
            }
        }
        return datosActualizados
    }

    habilitarCampos = (parametros) =>{
        let datosActualizados = this.respaldarValores()
        const newParametros = parametros.split(',')
        for(let parametro in newParametros){
            const filaIndice = this.state.campos.findIndex(campo => campo.TituloInternoDelCampo === newParametros[parametro])
            let campoActual = this.state.campos[filaIndice]
            campoActual.Editable = !campoActual.Editable
            datosActualizados = update(this.state.campos, { $splice: [[filaIndice, 1, campoActual]] })
        }
        this.setState({ campos: datosActualizados })
    }

    noAplica = (parametros) =>{
        //Verificar que cuando hay más de 2 checks de no aplica, limpia todas las fechas de todos los trámites
        const newParametros = parametros.split(',')
        let datosActualizados = this.state.campos.map((campo)=>{
            if(campo.TipoDeCampo !== 'CheckBox'){
                if(campo.TituloInternoDelCampo.includes(newParametros[0])){
                    campo.Editable = !campo.Editable
                    if(campo.Tramite === 'Trámite' && newParametros[1] === 'true')
                    { campo.Requerido = !campo.Requerido }
                    campo.valor = ''
                }
            }
            else{
                if(campo.TituloInternoDelCampo.includes(newParametros[0])){
                    campo.valor = this.state.refs[campo.TituloInternoDelCampo].current.checked
                }
            }
            return campo
        })
        this.setState({ campos: datosActualizados })
    }

    sumarVigencia = (parametros) =>{
        let datosActualizados = this.respaldarValores()
        const newParametros = parametros.split(',')

        const campoRef = this.state.refs[newParametros[0]]
        const FdeR = campoRef.current.value
        let FdeV = moment(FdeR).add(parseInt(newParametros[2]), 'M')
        FdeV = moment(FdeV._d).format('YYYY-MM-DD')

        const filaIndice = this.state.campos.findIndex(campo => campo.TituloInternoDelCampo === newParametros[1])
        let campoActual = this.state.campos[filaIndice]
        campoActual.valor = FdeV
        datosActualizados = update(this.state.campos, { $splice: [[filaIndice, 1, campoActual]] })

        this.setState({ campos: datosActualizados })
    }

    calcularEficiencia = (parametros) =>{
        let datosActualizados = this.respaldarValores()
        const newParametros = parametros.split(',')

        const m2VendiblesReal = this.state.refs[newParametros[0]].current.value
        const m2ConstruccionReal = this.state.refs[newParametros[1]].current.value
        let eficienciaReal = 0.0

        if(m2VendiblesReal !== '' && m2ConstruccionReal !== ''){
            if(parseFloat(m2VendiblesReal) > 0 && parseFloat(m2ConstruccionReal)){
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

    async onCargarArchivo(e, nombreDocumento) {
        const {archivosCargados} = this.state
        if (window.confirm('¿Desea adjuntar el archivo "' + e.target.files[0].name + '"?')) {
            const {id, name} = e.target
            const archivo = e.target.files[0]
            const extension = archivo.name.split('.').pop()
            if(!this.props.abrir.esTarea){
                const rootweb = await sp.web.getParentWeb()
                let webCdV = Web(rootweb.data.Url)
                const urlCargar = !this.props.abrir.filaSeleccionada.esRFS ? this.props.abrir.filaSeleccionada.ProyectoInversion.title : this.props.abrir.filaSeleccionada.ProyectoInversion.title + '/' + this.props.abrir.filaSeleccionada.Terreno.title
                await webCdV.getFolderByServerRelativeUrl('/Documents/' + urlCargar + '/').files.add(nombreDocumento + '.' + extension, archivo, true)
                .then(async (docto)=>{
                    const item = await docto.file.getItem()
                    await item.update({
                        Title: nombreDocumento
                    })
                    .then(async ()=>{
                        let index = archivosCargados.findIndex(x=> x.nombreInterno === nombreDocumento)
                        if(index === -1){
                            archivosCargados.push({nombreInterno: nombreDocumento, archivo: docto.data.Name, icono: rootweb.data.Url +  '/CompraDeTerreno/images/iconos/' + extension + '.png', url: rootweb.data.Url + docto.data.ServerRelativeUrl })
                        }
                        alert('Su archivo se cargó correctamente')
                        this.setState({archivosCargados: archivosCargados })
                    })
                })
                .catch(error =>{
                    alert('Error al cargar el archivo: ' + error)
                })
            }else{
                this.uploadFile(name.toString(), id, 'Fu' + id, archivo, extension)
            }
        }
    }

    uploadFile = (IdDocumento, IdControl, href, archivo, extension) => {
        let { archivosValidos, idTarea, archivosCargados } = this.state
        let IdProyectoInversion, IdTerreno, Nivel, ID
        if(this.props.abrir.filaSeleccionada.Lista === 'Flujo Tareas'){
            IdProyectoInversion = this.props.abrir.filaSeleccionada.IdProyectoInversion
            IdTerreno = this.props.abrir.filaSeleccionada.IdTerreno
            Nivel = this.props.abrir.filaSeleccionada.Nivel
            ID = this.props.abrir.filaSeleccionada.ID
        }else if(this.props.abrir.filaSeleccionada.Lista === 'Fechas paquete de trámites'){
            IdProyectoInversion = this.state.datosTramite[0].IdProyectoInversion
            IdTerreno = this.state.datosTramite[0].IdTerreno
            Nivel = this.state.datosTramite[0].Nivel
            ID = this.state.datosTramite[0].ID
            idTarea = this.state.datosTramite[0].IdTareaId
        }
        if(!archivosValidos.includes(extension)){
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
                success: function (data){
                    let resultUrl = new URL(data)
                    let index = archivosCargados.findIndex(x=> x.nombreInterno === IdControl)
                    if(index === -1){
                        archivosCargados.push({nombreInterno: IdControl, archivo: IdControl + '.' + extension, icono: resultUrl.origin +  '/CompraDeTerreno/images/iconos/' + extension + '.png', url: data, requerido: false })
                    }
                    alert('Su archivo se cargó correctamente')
                },
                error: function(error){
                    alert(error.responseText);
                }
            })
            if(datosActualizados.length>0)
            {this.setState({archivosCargados: archivosCargados, campos: datosActualizados })}
            else
            {this.setState({archivosCargados: archivosCargados })}
        }
    }
    
    render() {
        var boton = '';
        var ID = 0;
        let { idTarea, archivosCargados, esIframe, catalogo, editablePorUsuario } = this.state

        const Formulario = () => {
            const formulario =  this.state.campos.map((campo, index) => {
                boton = campo.Boton;
                ID = campo.ID;
                let cat = campo.TipoDeCampo === 'Select' || campo.TipoDeCampo === 'SelectText' || campo.TipoDeCampo === 'SelectMultiple' ? catalogo.filter(x=>x.campo === campo.TituloInternoDelCampo) : []
                if(esIframe === '1'){
                    return(
                    <div key={0} className="form-group col-md-12">
                        <iframe is='x-frame-bypass' src={this.props.abrir.url + this.props.abrir.filaSeleccionada.UrlTarea} width='100%'></iframe>
                    </div>)
                }else{
                    return (
                        <div key={index} className={campo.EstiloColumna}>
                            {(() => {
                                switch (campo.TipoDeCampo) {
                                    case 'Button':
                                        return  <div key={campo.ID} className="form-group">
                                                    <label></label>
                                                    <button className="btn btn-light" type={campo.TipoDeCampo} name={campo.TituloInternoDelCampo} disabled={!campo.Editable} onClick={()=>{this[campo.Accion](campo.Parametros)}}>{campo.Title}</button>
                                                </div>
                                    case 'CheckBox':
                                        return  <div key={campo.ID}>
                                                    <label>{campo.Title}</label>
                                                    <input className="form-radio" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} checked={campo.valor} required={campo.Requerido} disabled={!campo.Editable} onChange={campo.Accion !== null ? ()=>{this[campo.Accion](campo.Parametros)} : null} />
                                                </div>
                                    case 'Date':
                                        return <div key={campo.ID} className="form-group">
                                                    <label>{campo.Title}</label>
                                                    <input className="form-control form-control-sm" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} defaultValue={campo.valor} required={campo.Requerido} disabled={!campo.Editable} onChange={campo.Accion !== null ? ()=>{this[campo.Accion](campo.Parametros)} : null} />
                                                </div>
                                    case 'File':
                                        return  <div key={campo.ID} className="form-group">
                                                    <label>{campo.Title + ": "}</label>
                                                    <div className={"custom-file " + (util.esRequerido(archivosCargados,campo) ? 'div_invalid' : 'div_required')}>
                                                        <input type={campo.TipoDeCampo} className="custom-file-input" name={campo.IdDocumento} id={campo.TituloInternoDelCampo} onChange={(e) => this.onCargarArchivo(e, campo.TituloInternoDelCampo)} lang='es' required={util.esRequerido(archivosCargados,campo)} disabled={!campo.Editable} />
                                                        <label className="custom-file-label" htmlFor={campo.TituloInternoDelCampo}></label>
                                                        {util.obtenerDatosDocumento(archivosCargados, campo) !== undefined?
                                                            <img alt='' src={archivosCargados.length> 0 ? archivosCargados.find(x=> x.nombreInterno === campo.TituloInternoDelCampo).icono : null}
                                                            title={archivosCargados.length >0 ? archivosCargados.find(x=> x.nombreInterno === campo.TituloInternoDelCampo).archivo : ''}
                                                            onClick={()=>window.open(archivosCargados.find(x=> x.nombreInterno === campo.TituloInternoDelCampo).url, "_blank")} ></img>
                                                        :null}
                                                    </div>
                                                </div>
                                    case 'hr':
                                        return <hr key={campo.ID} className="form-group" />
                                    case 'Label':
                                        return  <div key={campo.ID} className="form-group">
                                                    <label>{campo.Title}</label>
                                                </div>
                                    case 'Link':
                                        return  <div key={campo.ID} className="form-group">
                                                    <a href={util.ensablarURL(campo.Url, this.props.abrir.filaSeleccionada, this.props.abrir.url)} target='_blank' disabled={campo.Activo}>{campo.Title}</a>
                                                </div>
                                    case 'LinkPE':
                                        return  <div key={campo.ID} className="form-group">
                                                    <label>{campo.Title}</label><br />
                                                    <a href={util.ensablarURLPE(campo.Url, this.props.abrir.filaSeleccionada, campo.TituloInternoDelCampo)} target='_blank' disabled={campo.Activo}>Ir a la carpeta</a>
                                                </div>
                                    case 'Number':
                                        return  <div key={campo.ID} className="form-group">
                                                    <label>{campo.Title}</label>
                                                    <input className="form-control form-control-sm" step='.01' type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} defaultValue={campo.valor} required={campo.Requerido} disabled={!campo.Editable} onBlur={campo.Accion !== null ? ()=>{this[campo.Accion](campo.Parametros)} : null} />
                                                </div>
                                    case 'PeoplePicker':
                                        return  <div key={campo.ID} className="form-group">
                                                    <label>{campo.Title}</label>
                                                    <PeoplePicker usuarios={this.state.usuarios} itemsSeleccionados={this.state.usuarioAsignados} seleccionarItems={this.onSeleccionarItems} disabled = {!this.props.abrir.esTarea ? false : (this.props.abrir.filaSeleccionada.Estatus.ID === 3 ? true : false)} />
                                                </div>
                                    case 'Radio':
                                        return  <div key={campo.ID} className="form-group">
                                                    <input className="form-radio" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} checked={this.state.radioChecked === campo.TituloInternoDelCampo } onChange={this.onSeleccionar} ref={this[campo.TituloInternoDelCampo]} required={campo.Requerido} disabled={!campo.Editable} />
                                                    <label htmlFor="radio-one">{campo.Title}</label>
                                                </div>
                                    case 'Select':
                                        return  <div key={campo.ID} className="form-group">
                                                    <label>{campo.Title}</label>
                                                    <select className="form-control form-control-sm" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} defaultValue={campo.valor} required={campo.Requerido} disabled={!campo.Editable}>
                                                        <option key={0} value={0}>Selecione...</option>
                                                        {cat[0].datos.map((item) =>{
                                                            return <option key={item.Id} value={item.Id}>{idTarea !== 45 && idTarea !== 152 ? item.Title : item.Responsable}</option>
                                                        })}
                                                    </select>
                                                </div>
                                    case 'SelectText':
                                        return  <div key={campo.ID} className="form-group">
                                                    <label>{campo.Title}</label>
                                                    <select className="form-control form-control-sm" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} defaultValue={campo.valor} required={campo.Requerido} disabled={!campo.Editable}>
                                                        <option key={0} value={0}>Selecione...</option>
                                                        {cat[0].datos.map((item) =>{
                                                            return <option key={item.Id} value={item.Title}>{item.Title}</option>
                                                        })}
                                                    </select>
                                                </div>
                                    case 'SelectMultiple':
                                        const valores = campo.valor === undefined ? [] : campo.valor
                                        return  <div key={campo.ID} className="form-group">
                                                    <label>{campo.Title}</label>
                                                    <FormControl style={{ width:'100%' }}>
                                                        <InputLabel id="demo-mutiple-checkbox-label">Bancos...</InputLabel>
                                                        <Select
                                                            labelId="demo-mutiple-checkbox-label"
                                                            id={campo.TituloInternoDelCampo}
                                                            name={campo.TituloInternoDelCampo}
                                                            multiple
                                                            value={valores}
                                                            onChange = {this.onSeleccionMultiple}
                                                            input={<Input />}
                                                            renderValue={(selected) => 'Múltiples seleccionados'}
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
                                        return  <div key={campo.ID} className="form-group">
                                                    <label>{campo.Title}</label>
                                                    <select className="form-control form-control-sm" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} defaultValue={campo.valor} required={campo.Requerido} disabled={!campo.Editable}>
                                                        <option key={0} value={'0'}>Selecione...</option>
                                                        <option key={1} value={'1'}>Sí</option>
                                                        <option key={2} value={'2'}>No</option>
                                                    </select>
                                                </div>
                                    case 'SelectYN':
                                        return  <div key={campo.ID} className="form-group">
                                                    <label>{campo.Title}</label>
                                                    <select className="form-control form-control-sm" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} defaultValue={campo.valor} required={campo.Requerido} disabled={!campo.Editable}>
                                                        <option key={0} value={0}>Selecione...</option>
                                                        <option key={1} value={true}>Sí</option>
                                                        <option key={2} value={false}>No</option>
                                                    </select>
                                                </div>
                                    case 'Text':
                                        return  <div key={campo.ID} className="form-group">
                                                    <label>{campo.Title}</label>
                                                    <input className="form-control form-control-sm" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} defaultValue={campo.valor} required={campo.Requerido} disabled={!campo.Editable} />
                                                </div>
                                    case 'TextArea':
                                        return  <div key={campo.ID} className="form-group">
                                                    <label>{campo.Title}</label>
                                                    <textarea className="form-control form-control-sm" rows={1} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} defaultValue={campo.valor} required={campo.Requerido} disabled={!campo.Editable}></textarea>
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
                {this.state.campos.length > 0 ?
                    <Modal isOpen={this.props.abrir.abierto} size={this.props.abrir.size}>
                        <ModalHeader className='encabezado' close={closeBtn}>{this.state.campos[0].Tarea.Title}</ModalHeader>
                        <form action='' className= {idTarea !== 24 && idTarea !== 25 && idTarea !== 30 && idTarea !== 35 && idTarea !== 268 && idTarea !== 271 && idTarea !== 272 && idTarea !== 289 ?'formulario' : ''} ref={this.form} onSubmit={e => e.preventDefault()}>
                            <div className='datoTerreno'>{this.props.abrir.terreno}</div>
                            <fieldset disabled = {!this.props.abrir.esTarea ? false : (this.props.abrir.filaSeleccionada.Estatus.ID === 3 || !editablePorUsuario ? true : false)}>
                                <ModalBody className='form-row'>
                                    {
                                        idTarea === 25 || idTarea === 30 || idTarea === 35 ?
                                            <SeleccionRFS datos={this.props.abrir.filaSeleccionada} tipo={this.state.campos[0].TituloInternoDelCampo} datosRetorno={this.onEnviar} cerrar={this.onCerrar} />
                                            : (idTarea === 271 ? <ActividadFicticia datos={this.props.abrir.filaSeleccionada} esTarea={this.props.abrir.esTarea} datosRetorno={this.onGuardar} cerrar={this.onCerrar} usuarioActual = {this.props.abrir.usuarioActual} gruposUsuarioActual = {this.props.abrir.gruposUsuarioActual} />
                                                : (idTarea === 272 ? <Detalle datos={this.props.abrir.filaSeleccionada} datosRetorno={this.onGuardar} cerrar={this.onCerrar} />
                                                    : (idTarea === 289 ? <EditarCluster datos={this.props.abrir.filaSeleccionada} datosRetorno={this.onGuardar} cerrar={this.onCerrar} /> : <Formulario />)))
                                    }
                                </ModalBody>
                                <ModalFooter>
                                    {
                                        idTarea === 25 || idTarea === 30 || idTarea === 35 || idTarea === 271 || idTarea === 272 || idTarea === 289 ?
                                            null : <Botones />
                                    }
                                </ModalFooter>
                            </fieldset>
                        </form>
                    </Modal>
                    : null
                }
            </div>
        );
    }
}

export default Ventana;