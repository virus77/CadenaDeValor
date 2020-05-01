import React, { Component, createRef } from 'react';
import {findDOMNode} from 'react-dom';
import SeleccionRFS from './SeleccionRFS'
import ActividadFicticia from './ActividadFicticia'
import Detalle from './Detalle.js'
import EditarCluster from './EditarCluster.js'
import PeoplePicker from './UserPicker'
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

const currentWeb = Web(window.location.protocol + '//' + window.location.host + "/CompraDeTerreno/")

class Ventana extends Component {
    constructor(props) {
        super(props)
        this.buttonRef = createRef()
        this.initialState = {
            idTarea: this.props.abrir.filaSeleccionada.Tarea !== undefined ? this.props.abrir.filaSeleccionada.Tarea.ID : (this.props.abrir.filaSeleccionada.IdTarea !== undefined ? this.props.abrir.filaSeleccionada.IdTarea.ID: this.props.abrir.filaSeleccionada.ID),
            campos: [],
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
            refs: {}
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
            //Si los datos de la ventana  sí son de una tarea de Flujo tareas...
            let camposLista = util.groupBy(this.state.camposLista, 'listaPrincipal')
            
            for(let prop in camposLista){
                if(prop!== 'Documentos'){
                    let campos = camposLista[prop]
                    let jsonu = {}
                    let idActualizar = util.obtenerIdActualizarPorLista(this.props.abrir.filaSeleccionada, campos[0].listaPrincipalIN)
                    campos.map((campoActual)=>{
                        const campoRef = this.state.refs[campoActual.campo]
                        campoActual.valor = campoRef.current.value
                        jsonu[campoActual.campo] = util.returnDataByFieldType(campoRef.current.value, campoActual.tipo)
                        return campoActual
                    })
                    await sp.web.lists.getByTitle(campos[0].listaPrincipal).items.getById(idActualizar).update(jsonu)
                    .then(()=>{
                        this.onCerrar()
                    })
                    .error(error=>{
                        alert(error)
                    })
                }
            }
        }
    }

    async onEnviar(datos) {
        const { idTarea, radioChecked } = this.state
        switch (this.props.abrir.filaSeleccionada.Tarea.ID) {
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
                break;
        }
    }

    onCerrar = () => {
        this.setState(this.initialState)
        this.props.cerrar()
    }
    //#endregion

    obtenerTotalTerrenosPI = async () => {
        const terrenos = await sp.web.lists.getByTitle("Terrenos").items.filter('IdProyectoInversionId eq ' + this.props.abrir.filaSeleccionada.ProyectoInversion.ID + ' and Empadronamiento eq null').get();
        return terrenos.length
    }

    obtenerCampos = async id => {
        if (!this.props.abrir.esTarea) {
            if (id > 0) {
                //Obtiene los campos a pintar en el formulario
                let campos = await sp.web.lists.getByTitle('Relación campos documentos trámites tareas').items
                    .select('Tarea/ID', 'Tarea/Title', 'Title', 'TituloInternoDelCampo', 'TipoDeCampo', 'ListaDeGuardado',
                        'ListaDeGuardadoIN', 'ListaDeGuardadoSecundario', 'ListaDeGuardadoSecundarioIN', 'Catalogos', 'Ordenamiento',
                        'Requerido', 'Tramite', 'Activo', 'Boton', 'IdRTD', 'IdTramite', 'IdDocumento', 'Url')
                    .filter('(TareaId eq ' + id + ') and (Activo eq 1)')
                    .expand('Tarea')
                    .orderBy('Ordenamiento', true).get()
                this.setState({ campos: campos })
            }
        } else {
            //Obtiene los campos a pintar en el formulario
            let campos = await sp.web.lists.getByTitle('Relación campos documentos trámites tareas').items
                .select('Tarea/ID', 'Tarea/Title', 'Title', 'TituloInternoDelCampo', 'TipoDeCampo', 'ListaDeGuardado',
                    'ListaDeGuardadoIN', 'ListaDeGuardadoSecundario', 'ListaDeGuardadoSecundarioIN', 'Catalogos', 'Ordenamiento',
                    'Requerido', 'Tramite', 'Activo', 'Boton', 'IdRTD', 'IdTramite', 'IdDocumento', 'Url')
                .filter('(TareaId eq ' + (this.props.abrir.filaSeleccionada.Tarea !== undefined ? this.props.abrir.filaSeleccionada.Tarea.ID : this.props.abrir.filaSeleccionada.IdTarea.ID) + ') and (Activo eq 1)')
                .expand('Tarea')
                .orderBy('Ordenamiento', true).get()
            
            let {catalogo} = this.state
            const catalogos = campos.filter(x=> x.Catalogos)
            if(catalogos.length >0){
                catalogo = await this[catalogos[0].Catalogos]()
            }
            this.setState({ campos: campos, catalogo: catalogo })
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
                    if (this.props.abrir.filaSeleccionada.EstatusId === 3) {
                        this.obtenerDatosGuardados(this.props.abrir.id)
                    }
                } else if (this.props.abrir.filaSeleccionada.Tarea.ID === 269){
                    const urlDoctos = !this.props.abrir.filaSeleccionada.esRFS ? this.props.abrir.filaSeleccionada.ProyectoInversion.title : this.props.abrir.filaSeleccionada.ProyectoInversion.title + '/' + this.props.abrir.filaSeleccionada.Terreno.title
                    const result = await this.obtenerDocumentosCargados(urlDoctos, archivosCargados)
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

    obtenerPosiciones = usuarios => {
        var items = this.state.usuarioAsignados.map((usuario) => {
            if (usuario.Id !== undefined) { return usuarios[usuarios.findIndex((obj => obj.Id === usuario.Id))] }
            else if (usuario.ID !== undefined) { return usuarios[usuarios.findIndex((obj => obj.Id === usuario.ID))] }
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

    obtenerDocumentosCargados = async (url) =>{
        let result = {}
        const rootweb = await sp.web.getParentWeb()
        let webCdV = Web(rootweb.data.Url)
        await webCdV.getFolderByServerRelativeUrl('/Documents/' + url).files.get().then(items=>{
            result = items.find(x=> x.Name === 'EGAutorizada.pdf')
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
        const { IdProyectoInversion, IdTerreno, Nivel, ID } = this.props.abrir.filaSeleccionada
        if(!archivosValidos.includes(extension)){
            alert('Archivo con extensión inválida: "' + extension + '"')
        }
        else {
            let formData = new FormData()
            formData.append("file", archivo)
            const url = 'http://con.quierocasa.com.mx:21520/CompraDeTerreno/_layouts/15/IQC.CompraDeTerrenoVS/HandlerFileUpload.ashx?' + idTarea + "|" + IdDocumento + "|" + IdProyectoInversion.ID + "|" + (IdTerreno === undefined ? 0 : IdTerreno.ID) + "|" + 0 + "|" + 0 + "|" + IdProyectoInversion.Title + "|" + (IdTerreno === undefined ? '' : IdTerreno.Title) + "|" + '' + "|" + '' + "|" + (Nivel.ID === 1 ? 'I' : (Nivel.ID === 2 ? 'T' : 'C')) + "|" + IdControl + "|" + href + "|" + ID + ""
            //fetch(siteUrl + 'CompraDeTerreno/_layouts/15/IQC.CadenaValor.CompraDeTerreno.Services/HandlerFileUpload.ashx?' + idTarea + "|" + IdDocumento + "|" + IdProyectoInversion + "|" + IdTerreno + "|" + IdProyecto + "|" + IdCondominio + "|" + ProyectoInversion + "|" + Terreno + "|" + Proyecto + "|" + Condominio + "|" + Nivel + "|" + IdControl + "|" + href + "|" + IdFlujo + "", {
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
                        archivosCargados.push({nombreInterno: IdControl, archivo: IdControl + '.' + extension, icono: resultUrl.origin +  '/CompraDeTerreno/images/iconos/' + extension + '.png', url: data })
                    }
                    alert('Su archivo se cargó correctamente')
                },
                error: function(error){
                    alert(error.responseText);
                }
            })
            this.setState({archivosCargados: archivosCargados })
        }
    }
    
    render() {
        var boton = '';
        var ID = 0;
        const { idTarea, archivosCargados, esIframe, catalogo, refs, camposLista } = this.state

        const Formulario = () => {
            const formulario =  this.state.campos.map((campo, index) => {
                boton = campo.Boton;
                ID = campo.ID;
                if(esIframe === '1'){
                    return(
                    <div key={0} className="form-group col-md-12">
                        <iframe is='x-frame-bypass' src={'http://con.quierocasa.com.mx:21520' + this.props.abrir.filaSeleccionada.UrlTarea} width='100%'></iframe>
                    </div>)
                }else{
                    return (
                        <div key={index} className="form-group col-md-4">
                            {(() => {
                                refs[campo.TituloInternoDelCampo] = this[campo.TituloInternoDelCampo] = createRef()
                                if(!camposLista.some(x=>x.campo === campo.TituloInternoDelCampo)){
                                    camposLista.push({campo: campo.TituloInternoDelCampo, tipo: campo.TipoDeCampo, listaPrincipal: campo.ListaDeGuardado, listaPrincipalIN: campo.ListaDeGuardadoIN, listaSecundaria: campo.ListaDeGuardadoSecundaria, listaSecundariaIN: campo.ListaDeGuardadoSecundariaIN, valor: ''})
                                }
                                switch (campo.TipoDeCampo) {
                                    case 'CheckBox':
                                        return  <div key={campo.ID}>
                                                    <input className="form-radio" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} required={campo.Requerido} />
                                                    <label>{campo.Title}</label>
                                                </div>
                                    case 'Date':
                                        return <div key={campo.ID}>
                                                    <label>{campo.Title}</label>
                                                    <input className="form-control form-control-sm" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} required={campo.Requerido} />
                                                </div>
                                    case 'File':
                                        return <div key={campo.ID}>
                                                    <label>{campo.Title + ": "}</label>
                                                    <input type={campo.TipoDeCampo} className="custom-file-input" name={campo.IdDocumento} id={campo.TituloInternoDelCampo} onChange={(e) => this.onCargarArchivo(e, campo.TituloInternoDelCampo)} lang='es' />
                                                    <label class="custom-file-label" for={campo.TituloInternoDelCampo}>{campo.Title}</label>
                                                    {<p>
                                                        <img alt='' src={archivosCargados.length> 0 ? archivosCargados.find(x=> x.nombreInterno === campo.TituloInternoDelCampo).icono : null} onClick={()=>window.open(archivosCargados.find(x=> x.nombreInterno === campo.TituloInternoDelCampo).url, "_blank")} ></img>
                                                        {archivosCargados.length >0 ? archivosCargados.find(x=> x.nombreInterno === campo.TituloInternoDelCampo).archivo : null}
                                                    </p>}
                                                </div>
                                    case 'Link':
                                        return <div key={campo.ID}>
                                                    <a href={campo.Url} target='_blank'>{campo.Title}</a>
                                                </div>
                                    case 'PeoplePicker':
                                        return  <div key={campo.ID}>
                                                    <label>{campo.Title}</label>
                                                    <PeoplePicker usuarios={this.state.usuarios} itemsSeleccionados={this.state.usuarioAsignados} seleccionarItems={this.onSeleccionarItems} />
                                                </div>
                                    case 'Radio':
                                        return <div key={campo.ID}>
                                                    <input className="form-radio" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} checked={this.state.radioChecked === campo.TituloInternoDelCampo } onChange={this.onSeleccionar} ref={this[campo.TituloInternoDelCampo]} required={campo.Requerido} />
                                                    <label htmlFor="radio-one">{campo.Title}</label>
                                                </div>
                                    case 'Select':
                                        return <div key={campo.ID}>
                                                    <label>{campo.Title}</label>
                                                    <select className="form-control form-control-sm" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} required={campo.Requerido}>
                                                        <option key={0} value={0}>Selecione...</option>
                                                        {catalogo.map((item) =>{
                                                            return <option key={item.Id} value={item.Id}>{item.Title}</option>
                                                        })}
                                                    </select>
                                                </div>
                                    case 'Text':
                                        return <div key={campo.ID}>
                                                    <label>{campo.Title}</label>
                                                    <input className="form-control form-control-sm" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} required={campo.Requerido}  />
                                                </div>
                                    case 'TextArea':
                                        return <div key={campo.ID}>
                                                    <label>{campo.Title}</label>
                                                    <textarea className="form-control form-control-sm" rows={4} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} ref={this[campo.TituloInternoDelCampo]} required={campo.Requerido} ></textarea>
                                                </div>
                                    default:
                                        break;
                                }
                            })()}
                        </div>
                    )
                }
            });
            return formulario
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
                        <ModalHeader className='encabezado' close={closeBtn}>
                            {this.state.campos[0].Tarea.Title}
                        </ModalHeader>
                        <form action=''>
                            <div className='datoTerreno'>{this.props.abrir.terreno}</div>
                            <fieldset disabled = {this.props.abrir.filaSeleccionada.EstatusId === 3 ? true : false}>
                                <ModalBody className='form-row'>
                                    {
                                        idTarea === 25 || idTarea === 30 || idTarea === 35 ?
                                            <SeleccionRFS datos={this.props.abrir.filaSeleccionada} tipo={this.state.campos[0].TituloInternoDelCampo} datosRetorno={this.onEnviar} cerrar={this.onCerrar} />
                                            : (idTarea === 271 ? <ActividadFicticia datos={this.props.abrir.filaSeleccionada} esTarea={this.props.abrir.esTarea} datosRetorno={this.onGuardar} cerrar={this.onCerrar} />
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