import React, { Component } from 'react';
import SeleccionRFS from './SeleccionRFS'
import ActividadFicticia from './ActividadFicticia'
import Detalle from './Detalle.js'
import PeoplePicker from './UserPicker'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { sp } from "@pnp/sp";

import "@pnp/sp/sites";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import '../estilos/modal.css';

class Ventana extends Component {
    constructor(props) {
        super(props)
        this.initialState = {
            idTarea: this.props.abrir.filaSeleccionada.Tarea !== undefined ? this.props.abrir.filaSeleccionada.Tarea.ID : this.props.abrir.filaSeleccionada.IdTarea.ID,
            campos: [],
            usuarios: [],
            ejecutado: false,
            usuarioAsignados: props.abrir.id === 270 ? props.datos.valor : [],
            radioChecked: props.datos.valor
        }
        this.onGuardar = this.onGuardar.bind(this);
        this.onEnviar = this.onEnviar.bind(this);
        this.state = this.initialState
    }

    //#region Eventos de botones
    async onGuardar() {
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
                this.props.evento({ tarea: 0, dato: this.state.usuarioAsignados })
                break;
            case 271:
                break;
            default:
                break;
        }
        this.onCerrar()
    }

    async onEnviar(datos) {
        const { idTarea, radioChecked } = this.state
        switch (this.props.abrir.filaSeleccionada.Tarea.ID) {
            case 24:
                if(radioChecked!== null){
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
                            }).then(async ()=>{
                                //Establece la tarea como Enviada
                                await sp.web.lists.getByTitle("Flujo Tareas").items.getById(this.props.abrir.id).update({
                                    EstatusId: 3
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
                                            Visible: true
                                        }).then(async result => {
                                            //Crea el elemento en la estrategia de gestión
                                            await sp.web.lists.getByTitle("EstrategiaGestion").items.add({
                                                ProyectoInversionId: this.props.abrir.filaSeleccionada.ProyectoInversion.ID,
                                                TareaId: idNuevaTarea,
                                                GrupoResponsableId: datosNuevaTarea.GrupoId,
                                                Seleccionado: false,
                                                IdFlujoTareasId: result.data.Id,
                                                EstatusId: 1
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
                }else{
                    alert('Seleccione un valor')
                }
                break;
            case 25:
            case 30:
            case 35:
                //Actualiza el estatus del elemento de la EG
                await sp.web.lists.getByTitle("EstrategiaGestion").items.getById(this.props.abrir.filaSeleccionada.ID).update({
                    EstatusId: 3
                }).then(()=>{
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
                        'ListaDeGuardadoSecundario', 'Catalogos', 'Ordenamiento', 'Requerido', 'Tramite', 'Activo', 'Boton')
                    .filter('(TareaId eq ' + id + ') and (Activo eq 1)')
                    .expand('Tarea')
                    .orderBy('Ordenamiento', true).get();
                this.setState({ campos: campos })
            }
        } else {
            //Obtiene los campos a pintar en el formulario
            let campos = await sp.web.lists.getByTitle('Relación campos documentos trámites tareas').items
                .select('Tarea/ID', 'Tarea/Title', 'Title', 'TituloInternoDelCampo', 'TipoDeCampo', 'ListaDeGuardado',
                    'ListaDeGuardadoSecundario', 'Catalogos', 'Ordenamiento', 'Requerido', 'Tramite', 'Activo', 'Boton')
                .filter('(TareaId eq ' + this.props.abrir.filaSeleccionada.Tarea.ID + ') and (Activo eq 1)')
                .expand('Tarea')
                .orderBy('Ordenamiento', true).get();
            this.setState({ campos: campos })
        }
    }

    //#region Métodos de ciclo de vida
    async componentDidMount() {
        if (this.props.abrir.abierto) {
            if (this.props.abrir.id === 270) {
                const users = await sp.web.siteUsers();
                this.obtenerPosiciones(users)
                this.setState({ usuarios: users })
            }else if(this.props.abrir.filaSeleccionada.Tarea.ID === 24){
                if(this.props.abrir.filaSeleccionada.EstatusId === 3){
                    this.obtenerDatosGuardados(this.props.abrir.id)
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
    };

    obtenerPosiciones = usuarios => {
        var items = this.state.usuarioAsignados.map((usuario) => {
            if (usuario.Id !== undefined) { return usuarios[usuarios.findIndex((obj => obj.Id === usuario.Id))] }
            else if (usuario.ID !== undefined) { return usuarios[usuarios.findIndex((obj => obj.Id === usuario.ID))] }
        })
        this.setState({ usuarioAsignados: items })
    }

    obtenerDatosGuardados = async (id) =>{
        const item = await sp.web.lists.getByTitle("RFSN").items
        .filter('IdFlujoId eq ' + id + 'and IdTerrenoId eq null')
        .get()
        if(item.length>0){
            this.setState({ radioChecked: item[0].FRSN })
        }
    }

    //FALTA TERMINAR
    async onCargarArchivo(e, nombreDocumento) {
        if (window.confirm('¿Está seguro que desea cargar el archivo "' + e.target.files[0].name + '"?')) {
            const archivo = e.target.files[0]
            var webCdV = await sp.web.getParentWeb();
            /*let reader = new FileReader()
            reader.readAsDataURL(archivo[0])

            reader.onload = async (e) =>{
                var webCdV = await sp.web.getParentWeb();
                webCdV = new Web(webCdV.data.Url)
                const formData = {file : e.target.result}

                return post(webCdV.data.parentUrl + '/Documents/I-04124/', formData, { crossdomain: true })
                .then(response =>{
                    alert("result: " + response)
                })
                
            }*/
            const file = await webCdV.web.getFolderByServerRelativeUrl("/Documentos/I-04124/").files.add(archivo.name, archivo, true)
            const item = await file.file.getItem();
            await item.update({
                Title: nombreDocumento
            }).then(() => {
                alert('Se cargó el archivo correctamente')
            }).catch((error) => {
                alert('Error: ' + error)
            })
        }
    }
    
    render() {
        var boton = '';
        var ID = 0;
        const { idTarea } = this.state

        const Formulario = () => {
            const formulario = this.state.campos.map((campo, index) => {
                boton = campo.Boton;
                ID = campo.ID;
                return (
                    <div key={index}>
                        {(() => {
                            switch (campo.TipoDeCampo) {
                                case 'CheckBox':
                                    return <div key={campo.ID}>
                                        <input className="form-radio" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} />
                                        <label>{campo.Title}</label>
                                    </div>
                                case 'Radio':
                                    return <div key={campo.ID}>
                                        <input className="form-radio" type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} checked={this.state.radioChecked === campo.TituloInternoDelCampo } onChange={this.onSeleccionar} />
                                        <label htmlFor="radio-one">{campo.Title}</label>
                                    </div>
                                case 'File':
                                    return <div key={campo.ID}>
                                        <label>{campo.Title}</label>
                                        <input type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} onChange={(e) => this.onCargarArchivo(e, campo.TituloInternoDelCampo)} />
                                    </div>
                                case 'PeoplePicker':
                                    return <div key={campo.ID}>
                                        <label>{campo.Title}</label>
                                        <PeoplePicker usuarios={this.state.usuarios} itemsSeleccionados={this.state.usuarioAsignados} seleccionarItems={this.onSeleccionarItems} />
                                    </div>
                                default:
                                    break;
                            }
                        })()}
                    </div>
                )
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
        return (
            <div>
                {this.state.campos.length > 0 ?
                    <Modal isOpen={this.props.abrir.abierto} size='lg'>
                        <form>
                            <ModalHeader
                                className='encabezado'>{this.state.campos[0].Tarea.Title}
                                <span style={{ paddingLeft: "500px", cursor: "pointer" }} onClick={this.onCerrar} aria-hidden="true">X</span>
                            </ModalHeader>
                            <div className='datoTerreno'>{this.props.abrir.terreno}</div>
                            <fieldset disabled = {this.props.abrir.filaSeleccionada.EstatusId === 3 ? true : false}>
                                <ModalBody>
                                        {
                                            idTarea === 25 || idTarea === 30 || idTarea === 35 ?
                                                <SeleccionRFS datos={this.props.abrir.filaSeleccionada} tipo={this.state.campos[0].TituloInternoDelCampo} datosRetorno={this.onEnviar} cerrar={this.onCerrar} />
                                                : (idTarea === 271 ? <ActividadFicticia datos={this.props.abrir.filaSeleccionada} datosRetorno={this.onGuardar} cerrar={this.onCerrar} />
                                                    : (idTarea === 272 ? <Detalle datos={this.props.abrir.filaSeleccionada} datosRetorno={this.onGuardar} cerrar={this.onCerrar} /> : <Formulario />))
                                        }
                                </ModalBody>
                                <ModalFooter>
                                    {
                                        idTarea === 25 || idTarea === 30 || idTarea === 35 || idTarea === 271 || idTarea === 272 ?
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