//#region Componentes
import React, { Component } from 'react';
import PeoplePicker from './PeoplePicker'
import Backdrop from '../componentes/Backdrop';
//#endregion
//#region Librerías externas
import moment from 'moment'
import "@pnp/sp/sites";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
//#endregion
//#region Scripts
import util from '../js/util'
import CRUD from '../js/CRUD';
//#endregion
//#region Estilos
import '../estilos/actividadFicticia.css';
//#endregion

var usuarioActual

class ActividadFicticia extends Component {
    constructor(props) {
        super(props)
        this.initialState = {
            backdrop: { abierto: true, mensaje: 'Cargando...' },
            usuarios: [],
            usuarioAsignados: [],
            ID: 0,
            IDEG: 0,
            NombreActividad: '',
            GrupoResponsable: '',
            LineaBase: '',
            FechaEstimada: '',
            Estatus: 0,
            Orden: '',
            OrdenEG: '',
            Creador: ''
        }
        this.state = this.initialState
    }

    //#region Métodos de ciclo de vida
    async componentDidMount() {
        const {webs} = this.props
        //Obtiene los datos del usuario actual
        usuarioActual = await webs.cdt.currentUser.get();
        const listaUsuarios = await webs.cdt.siteUsers()
        if (this.props.datos.info === undefined) {
            await webs.cdt.lists.getByTitle('Flujo Tareas').items
                .select('ID', 'NombreActividad', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'AsignadoA/ID', 'AsignadoA/Name',
                    'LineaBase', 'FechaEstimada', 'Estatus/ID', 'Estatus/Title', 'Author/ID', 'Author/Name')
                .filter('ID eq ' + (this.props.datos.IdFlujoTareasId !== undefined ? this.props.datos.IdFlujoTareasId : this.props.datos.Id))
                .expand('GrupoResponsable', 'AsignadoA', 'Estatus', 'Author')
                .get()
                .then(async (fts) => {
                    const asignados = this.obtenerPosiciones(listaUsuarios, fts[0].AsignadoA)
                    let idEG = 0
                    if (this.props.esTarea) { idEG = await this.obtenerIdEG(fts[0].ID) }
                    this.setState({
                        usuarios: listaUsuarios,
                        ID: fts[0].ID,
                        IDEG: !this.props.esTarea ? this.props.datos.ID : (idEG.length === 0 ? 0 : idEG[0].Id),
                        NombreActividad: fts[0].NombreActividad,
                        GrupoResponsable: fts[0].GrupoResponsable,
                        usuarioAsignados: asignados,
                        LineaBase: fts[0].LineaBase !== null ? moment(fts[0].LineaBase).format(moment.HTML5_FMT.DATE) : '',
                        FechaEstimada: fts[0].FechaEstimada !== null ? moment(fts[0].FechaEstimada).format(moment.HTML5_FMT.DATE) : '',
                        Estatus: fts[0].Estatus.ID,
                        Creador: fts[0].Author,
                        backdrop: { abierto: false, mensaje: '' }
                    })
                })
                .catch(error => {
                    alert('ERROR AL CARGAR LA INFORMACIÓN: ' + error)
                })
        }
        else {
            this.setState({
                usuarios: listaUsuarios,
                GrupoResponsable: this.props.datos.info.grupo,
                Orden: this.props.datos.info.tarea.Orden,
                OrdenEG: this.props.datos.info.tarea.OrdenEG,
                backdrop: { abierto: false, mensaje: '' }
            })
        }
    }
    //#endregion

    //#región Eventos de controles
    onCambiar = e => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    };

    onCambiarEstatus = e => {
        const { name } = e.target;
        this.setState({ Estatus: parseInt(name) === this.state.Estatus ? 0 : parseInt(name) });
    }

    onSeleccionarItems = items => {
        this.setState({ usuarioAsignados: items })
    }
    //#endregion

    //#region Eventos genericos

    actualizarFlujoTareas = async (lineaBase, fechaEstimada, usuariosAsignados) => {
        const {webs} = this.props
        let json = {}
        if (lineaBase !== '' && fechaEstimada !== '') {
            json = {
                NombreActividad: this.state.NombreActividad,
                GrupoResponsableId: this.state.GrupoResponsable.ID,
                AsignadoAId: usuariosAsignados,
                LineaBase: lineaBase,
                LineaBaseModificoId: usuarioActual.Id,
                FechaEstimada: fechaEstimada,
                EstatusId: this.state.Estatus === 0 ? 2 : this.state.Estatus,
                EstatusAnteriorId: this.state.Estatus === 0 ? 2 : this.state.Estatus
            }
            await CRUD.updateListItem(webs.cdt, "Flujo Tareas", this.state.ID, json).catch(error=>{
                alert('ERROR AL ACTUALIZAR EL ELEMENTO ' + this.state.ID + ': ' + error)
            })
        } else if (lineaBase !== '' && fechaEstimada === '') {
            json = {
                NombreActividad: this.state.NombreActividad,
                GrupoResponsableId: this.state.GrupoResponsable.ID,
                AsignadoAId: usuariosAsignados,
                LineaBase: lineaBase,
                LineaBaseModificoId: usuarioActual.Id,
                EstatusId: this.state.Estatus === 0 ? 2 : this.state.Estatus,
                EstatusAnteriorId: this.state.Estatus === 0 ? 2 : this.state.Estatus
            }
        } else if (lineaBase === '' && fechaEstimada !== '') {
            json = {
                NombreActividad: this.state.NombreActividad,
                GrupoResponsableId: this.state.GrupoResponsable.ID,
                AsignadoAId: usuariosAsignados,
                FechaEstimada: fechaEstimada,
                EstatusId: this.state.Estatus === 0 ? 2 : this.state.Estatus,
                EstatusAnteriorId: this.state.Estatus === 0 ? 2 : this.state.Estatus
            }
        } else if (lineaBase === '' && fechaEstimada === '') {
            json = {
                NombreActividad: this.state.NombreActividad,
                GrupoResponsableId: this.state.GrupoResponsable.ID,
                AsignadoAId: usuariosAsignados,
                EstatusId: this.state.Estatus === 0 ? 2 : this.state.Estatus,
                EstatusAnteriorId: this.state.Estatus === 0 ? 2 : this.state.Estatus
            }
        }
        if(Object.keys(json).length > 0){
            await CRUD.updateListItem(webs.cdt, "Flujo Tareas", this.state.ID, json).catch(error=>{
                alert('ERROR AL ACTUALIZAR EL ELEMENTO ' + this.state.ID + ': ' + error)
            })
        }
    }

    guardarFlujoTareas = async (lineaBase, fechaEstimada, usuariosAsignados) => {
        const {webs} = this.props
        let json = {}
        let result
        if (lineaBase !== '' && fechaEstimada !== '') {
            json = {
                IdProyectoInversionId: this.props.datos.info.idPI,
                IdTareaId: this.props.datos.Tarea.ID,
                NivelId: this.props.datos.info.tipo === 'PI' ? 1 : 2,
                IdTerrenoId: this.props.datos.info.idTerr === 0 ? null : this.props.datos.info.idTerr,
                NombreActividad: this.state.NombreActividad,
                GrupoResponsableId: this.state.GrupoResponsable.ID,
                AsignadoAId: usuariosAsignados,
                LineaBase: lineaBase,
                LineaBaseModificoId: usuarioActual.Id,
                FechaEstimada: fechaEstimada,
                EstatusId: this.state.Estatus === 0 ? 2 : this.state.Estatus,
                EstatusAnteriorId: this.state.Estatus === 0 ? 2 : this.state.Estatus,
                Orden: this.state.Orden
            }
        } else if (lineaBase !== '' && fechaEstimada === '') {
            json = {
                IdProyectoInversionId: this.props.datos.info.idPI,
                IdTareaId: this.props.datos.Tarea.ID,
                NivelId: this.props.datos.info.tipo === 'PI' ? 1 : 2,
                IdTerrenoId: this.props.datos.info.idTerr === 0 ? null : this.props.datos.info.idTerr,
                NombreActividad: this.state.NombreActividad,
                GrupoResponsableId: this.state.GrupoResponsable.ID,
                AsignadoAId: usuariosAsignados,
                LineaBase: lineaBase,
                LineaBaseModificoId: usuarioActual.Id,
                EstatusId: this.state.Estatus === 0 ? 2 : this.state.Estatus,
                EstatusAnteriorId: this.state.Estatus === 0 ? 2 : this.state.Estatus,
                Orden: this.state.Orden
            }
        } else if (lineaBase === '' && fechaEstimada !== '') {
            json = {
                IdProyectoInversionId: this.props.datos.info.idPI,
                IdTareaId: this.props.datos.Tarea.ID,
                NivelId: this.props.datos.info.tipo === 'PI' ? 1 : 2,
                IdTerrenoId: this.props.datos.info.idTerr === 0 ? null : this.props.datos.info.idTerr,
                NombreActividad: this.state.NombreActividad,
                GrupoResponsableId: this.state.GrupoResponsable.ID,
                AsignadoAId: usuariosAsignados,
                FechaEstimada: fechaEstimada,
                EstatusId: this.state.Estatus === 0 ? 2 : this.state.Estatus,
                EstatusAnteriorId: this.state.Estatus === 0 ? 2 : this.state.Estatus,
                Orden: this.state.Orden
            }
        } else if (lineaBase === '' && fechaEstimada === '') {
            json = {
                IdProyectoInversionId: this.props.datos.info.idPI,
                IdTareaId: this.props.datos.Tarea.ID,
                NivelId: this.props.datos.info.tipo === 'PI' ? 1 : 2,
                IdTerrenoId: this.props.datos.info.idTerr === 0 ? null : this.props.datos.info.idTerr,
                NombreActividad: this.state.NombreActividad,
                GrupoResponsableId: this.state.GrupoResponsable.ID,
                AsignadoAId: usuariosAsignados,
                EstatusId: this.state.Estatus === 0 ? 2 : this.state.Estatus,
                EstatusAnteriorId: this.state.Estatus === 0 ? 2 : this.state.Estatus,
                Orden: this.state.Orden
            }
        }
        if(Object.keys(json).length > 0){
            result = await CRUD.createListItem(webs.cdt, 'Flujo Tareas', json).catch(error => {
                alert('ERROR AL INSERTAR EN LA LISTA FLUJO DE TAREAS: ' + error)
            })
        }
        return result
    }

    obtenerIdEG = async (IdFlujoTareas) => {
        const {webs} = this.props
        let resultados = await webs.cdt.lists.getByTitle('EstrategiaGestion').items
        .select('ID')
        .filter('IdFlujoTareasId eq ' + IdFlujoTareas)
        .get()
        .catch(error => {
            alert('ERROR AL OBTENER LOS DATOS DEL FLUJO ' + IdFlujoTareas + ' EN LA E.G.: ' + error)
        })
        return resultados
    }

    obtenerPosiciones = (usuariosAsignados, usuarios) => {
        var items = usuarios.forEach((usuario) => {
            if (usuario.Id !== undefined) { return usuariosAsignados[usuariosAsignados.findIndex((obj => obj.Id === usuario.Id))] }
            else if (usuario.ID !== undefined) { return usuariosAsignados[usuariosAsignados.findIndex((obj => obj.Id === usuario.ID))] }
        })
        return items
    }
    //#endregion

    //#region Eventos de botones
    onCerrar = () => {
        this.setState(this.initialState)
        this.props.cerrar()
    }

    onEliminar = async () => {
        if (window.confirm('¿Está seguro de eliminar esta actividad?')) {
            const {webs} = this.props
            this.setState({ backdrop: { abierto: true, mensaje: 'Borrando la actividad...' } })
            await CRUD.deleteListItem(webs.cdt, "Flujo Tareas", this.state.ID).then(async () => {
                if (this.state.IDEG > 0) {
                    await CRUD.deleteListItem(webs.cdt, "EstrategiaGestion", this.state.IDEG).catch(error => {
                        alert('ERROR AL INTENTAR ELIMINAR EN ESTRATEGIA DE GESTIÓN EL ELEMENTO ' + this.state.IDEG + ': ' + error)
                    })
                }
                this.props.datosRetorno(this.state)
                this.onCerrar()
            }).catch(error => {
                alert('ERROR AL INTENTAR ELIMINAR EN FLUJO TAREAS EL ELEMENTO ' + this.state.ID + ': ' + error)
            })
        }
    }

    onGuardar = async () => {
        if (this.state.NombreActividad !== '' && this.state.usuarioAsignados.length > 0) {
            const {webs} = this.props
            if (this.state.ID === 0) {
                if (this.state.Orden !== null) {
                    this.setState({ backdrop: { abierto: true, mensaje: 'Guardando...' } })
                    const usuariosAsignados = util.obtenerIdAsignados(this.state.usuarioAsignados)
                    const fta = await this.guardarFlujoTareas(this.state.LineaBase, this.state.FechaEstimada, usuariosAsignados)
                    if (this.state.OrdenEG !== undefined) {
                        const json = {
                            ProyectoInversionId: this.props.datos.info.idPI,
                            TerrenoId: this.props.datos.info.idTerr === 0 ? null : this.props.datos.info.idTerr,
                            TareaId: this.props.datos.Tarea.ID,
                            NombreActividad: this.state.NombreActividad,
                            AsignadoAId: usuariosAsignados,
                            GrupoResponsableId: this.state.GrupoResponsable.ID,
                            Seleccionado: false,
                            IdFlujoTareasId: fta.data.Id,
                            EstatusId: this.state.Estatus === 0 ? 2 : this.state.Estatus,
                            OrdenEG: this.state.OrdenEG
                        }
                        await CRUD.createListItem(webs.cdt, 'EstrategiaGestion', json).then(() => {
                            this.props.datosRetorno(this.state)
                            this.onCerrar()
                        }).catch(error => {
                            alert('ERROR AL INSERTAR EN LA LISTA E.G.: ' + error)
                        })
                    } else {
                        this.props.datosRetorno(this.state)
                        this.onCerrar()
                    }
                } else {
                    alert('No se puede guardar la actividad a este nivel del clúster')
                }
            } else {
                this.setState({ backdrop: { abierto: true, mensaje: 'Guardando...' } })
                const usuariosAsignados = util.obtenerIdAsignados(this.state.usuarioAsignados)
                await this.actualizarFlujoTareas(this.state.LineaBase, this.state.FechaEstimada, usuariosAsignados).then(async () => {
                    if (this.state.OrdenEG !== undefined) {
                        if (this.state.IDEG > 0) {
                            const json = {
                                NombreActividad: this.state.NombreActividad,
                                AsignadoAId: usuariosAsignados,
                                GrupoResponsableId: this.state.GrupoResponsable.ID,
                                EstatusId: this.state.Estatus === 0 ? 2 : this.state.Estatus
                            }
                            await CRUD.updateListItem(webs.cdt, "EstrategiaGestion", this.state.IDEG, json).catch(error=>{
                                alert('ERROR AL ACTUALIZAR EL ELEMENTO ' + this.state.ID + ' EN LA E.G. : ' + error)
                            })
                        }
                        this.props.datosRetorno(this.state)
                        this.onCerrar()
                    } else {
                        this.props.datosRetorno(this.state)
                        this.onCerrar()
                    }
                }).catch(error => {
                    alert('ERROR AL GUARDAR EN FLUJO TAREAS: ' + error)
                })
            }
        } else {
            alert('Debe llenar todos los campos obligatorios')
        }
    }
    //#endregion

    render() {
        const { NombreActividad, GrupoResponsable, LineaBase, FechaEstimada, Estatus, usuarioAsignados, ID, Creador } = this.state
        const esCreador = Creador.ID === this.props.usuarioActual.Id ? true : false
        const esAsignado = usuarioAsignados.filter(x => x.Id === this.props.usuarioActual.Id).length > 0 ? true : false
        return (
            <div className='col-sm-12'>
                {!this.state.backdrop.abierto ?
                    <div>
                        <div className='form-row'>
                            <div className='col-sm-8 borde'>
                                <h6 className='texto'><span className='obligatorio'>*</span>Nombre de la actividad</h6>
                                <input type="text" name='NombreActividad' className='form-control' value={NombreActividad} onChange={this.onCambiar} maxLength={255} required disabled={ID === 0 || esCreador || (esCreador && !esAsignado) ? false : true} />
                                <br />
                                <h6 className='texto'>Grupo responsable</h6>
                                <input type="text" name='GrupoResponsable' className='form-control' value={GrupoResponsable.NombreCortoGantt} readOnly />
                                <br />
                                <h6 className='texto'><span className='obligatorio'>*</span>Asignado(s) a</h6>
                                <PeoplePicker usuarios={this.state.usuarios} itemsSeleccionados={usuarioAsignados} seleccionarItems={this.onSeleccionarItems} disabled={ID === 0 || esCreador || (esCreador && !esAsignado) ? false : true} />
                                <br />
                                <h6 className='texto'>Fecha compromiso</h6>
                                <input type="date" name='LineaBase' className='form-control' value={LineaBase} onChange={this.onCambiar} disabled={ID === 0 || esCreador || (esCreador && !esAsignado) ? false : true} />
                                <br />
                                <h6 className='texto'>Fecha estimada de entrega</h6>
                                <input type="date" name='FechaEstimada' className='form-control' value={FechaEstimada} onChange={this.onCambiar} disabled={ID === 0 || esCreador || esAsignado ? false : true} />
                            </div>
                            <div className='col-sm-4 centro'>
                                <h5 className='texto'>Estatus</h5>
                                <input type='button' name='3' className={Estatus === 3 ? "concluido btn-sm anchoBoton" : "btn btn-secondary btn-sm anchoBoton"} value='Concluido' onClick={this.onCambiarEstatus} disabled={ID === 0 || esCreador || esAsignado ? false : true} /><br /><br />
                                <input type='button' name='1' className={Estatus === 1 ? "pendiente btn-sm anchoBoton" : "btn btn-secondary btn-sm anchoBoton"} value='Pendiente' onClick={this.onCambiarEstatus} disabled={ID === 0 || esCreador || esAsignado ? false : true} /><br /><br />
                                <input type='button' name='5' className={Estatus === 5 ? "vencido btn-sm anchoBoton" : "btn btn-secondary btn-sm anchoBoton"} value='Vencido' onClick={this.onCambiarEstatus} disabled={ID === 0 || esCreador || esAsignado ? false : true} /><br /><br />
                                <input type='button' name='4' className={Estatus === 4 ? "rechazado btn-sm anchoBoton" : "btn btn-secondary btn-sm anchoBoton"} value='Rechazado' onClick={this.onCambiarEstatus} disabled={ID === 0 || esCreador || esAsignado ? false : true} /><br /><br />
                                <input type='button' name='6' className={Estatus === 6 ? "detenido btn-sm anchoBoton" : "btn btn-secondary btn-sm anchoBoton"} value='Detenido' onClick={this.onCambiarEstatus} disabled={ID === 0 || esCreador || esAsignado ? false : true} />
                            </div>
                        </div>
                        <hr />
                        <div className='row'>
                            <div className='col-sm-6 izquierda'>
                                {ID > 0 && esCreador ? <input type="button" className="btn btn-secondary btn-md" value='Eliminar' onClick={this.onEliminar} /> : null}
                            </div>
                            <div className='col-sm-6 derecha'>
                                {ID === 0 || esCreador || esAsignado ? <input type="button" className="btn btn-info btn-md" value='Guardar' onClick={this.onGuardar} /> : null}
                            </div>
                        </div>
                    </div>
                    :
                    <Backdrop abierto={this.state.backdrop.abierto} mensaje={this.state.backdrop.mensaje} />
                }
            </div>
        )
    }
}

export default ActividadFicticia