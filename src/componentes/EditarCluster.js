import React, { Component } from 'react'
import Backdrop from '../componentes/Backdrop';
import update from 'immutability-helper';
import { sp } from "@pnp/sp";
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/sites";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import util from '../js/util'
import CRUD from '../js/CRUD';
import '../estilos/editarCluster.css';

const currentWeb = Web(window.location.protocol + '//' + window.location.host + "/CompraDeTerreno/")

class EditarCluster extends Component {
    constructor(props) {
        super(props)
        this.initialState = {
            backdrop: { abierto: true, mensaje: 'Cargando...' },
            usuarioActual: '',
            datos: [],
            t287completa: '',
            t288completa: '',
        }
        this.state = this.initialState
    }
    //#region Eventos genericos
    contieneUsuarioActual = (campo) => {
        const { usuarioActual } = this.state
        const ocultoA = util.obtenerIdAsignados(campo)
        return ocultoA.length === 0 ? false : (ocultoA.results.includes(usuarioActual.Id) ? true : false)
    }

    onSeleccionar = (e) => {
        const { name, checked } = e.target
        let { datos } = this.state

        const index = datos.findIndex(x => x.ID === parseInt(name))
        let newData = datos[index]

        newData.Visible = checked
        newData.Cambio = !newData.Cambio

        datos = update(this.state.datos, { $splice: [[index, 1, newData]] })
        this.setState({ datos: datos })
    }

    obtenerTareas = async () => {
        let usuarioActual = await currentWeb.currentUser.get()
        let tareas = await currentWeb.lists.getByTitle('Flujo Tareas').items
        .filter('(IdProyectoInversionId eq ' + this.props.datos.info.cluster.IdProyectoInversion.ID +
            ' and IdTerrenoId eq ' + this.props.datos.info.cluster.IdTerreno.ID + ' and Orden eq 3.14 and IdTarea/Subcluster ne null)')
        .select('ID', 'IdTarea/ID', 'IdTarea/Title', 'IdTarea/Subcluster', 'Orden', 'Visible', 'EstatusId')
        .expand('IdTarea')
        .get()
        .catch(error => {
            alert('ERROR AL CARGAR LA VENTANA: ' + error)
        })
        //Se realiza para tener el control de las tareas que se chequean/deschequean
        tareas = tareas.map((tarea) => {
            tarea.Cambio = false
            return tarea
        })
        this.setState({ usuarioActual: usuarioActual, datos: tareas, backdrop: { abierto: false, mensaje: '' } })
    }

    obtenerTareasCluster = async (IdTarea) => {
        await currentWeb.lists.getByTitle('Flujo Tareas').items
            .filter('(IdProyectoInversionId eq ' + this.props.datos.info.cluster.IdProyectoInversion.ID +
                ' and IdTerrenoId eq ' + this.props.datos.info.cluster.IdTerreno.ID + ' and IdTareaId eq ' + IdTarea + ')')
            .get()
            .then(async (fts) => {
                if (fts[0].EstatusId !== 1) {
                    await CRUD.updateListItem(currentWeb, 'Flujo Tareas', fts[0].ID, {EstatusId: 1}).catch(error=>{
                        alert('ERROR AL ACTUALIZAR EL ELEMENTO ' + fts[0].ID + ' DE LA LISTA FLUJO TAREAS: ' + error)
                    })
                }
            })
            .catch(error => {
                alert('ERROR AL INTENTAR OBTENER LOS DATOS DE LA TAREA ' + IdTarea + ': ' + error)
            })
    }
    //#endregion

    //#region Eventos de ciclo de vida
    componentWillMount() {
        this.obtenerTareas()
    }
    //#endregion

    //#region Eventos de botones
    onCerrar = () => {
        this.setState(this.initialState)
        this.props.cerrar()
    }

    onGuardar = async () => {
        let { datos } = this.state
        datos = datos.filter(x => x.Cambio)

        const guardar = async () => {
            if (datos.length > 0) {
                this.setState({ backdrop: { abierto: true, mensaje: 'Guardando...' } })
                await util.asyncForEach(datos, async dato => {
                    await CRUD.updateListItem(currentWeb, 'Flujo Tareas', dato.ID, {Visible: dato.Visible}).catch(error=>{
                        alert('ERROR AL ACTUALIZAR EL ELEMENTO ' + dato.ID + ' EN FLUJO TAREAS: ' + error)
                    })
                })

                let cluster287 = this.state.datos.filter(x => x.IdTarea.Subcluster === 'Entrega para diseño de material de ventas' && x.Visible);
                cluster287 = cluster287.length > 0 ? cluster287.some(x => x.EstatusId !== 3) : '';
                let cluster288 = this.state.datos.filter(x => x.IdTarea.Subcluster === 'Material de ventas fabricado' && x.Visible);
                cluster288 = cluster288.length > 0 ? cluster288.some(x => x.EstatusId !== 3) : '';

                if (cluster287 !== '') {
                    if (cluster287) {
                        await this.obtenerTareasCluster(287)
                    }
                }
                if (cluster288 !== '') {
                    if (cluster288) {
                        await this.obtenerTareasCluster(288)
                    }
                }
                this.setState({ backdrop: { abierto: false, mensaje: '' }, t287completa: !cluster287, t288completa: !cluster288 })
            }
        }
        await guardar()
            .then(() => {
                this.props.datosRetorno(this.state)
                this.onCerrar()
            })

        this.onCerrar()
    }
    //#endregion
    render() {
        return (
            <div style={{ width: '100%' }}>
                {!this.state.backdrop.abierto ?
                    <div>
                        <div className='form-row'>
                            <div className='col-sm-6 borde'>
                                <label style={{ fontSize: "18px" }} className='texto'>Entrega para diseño de material de ventas</label>
                                {this.state.datos.map((dato) => {
                                    return dato.IdTarea.Subcluster === 'Entrega para diseño de material de ventas' ?
                                        <div key={dato.ID}>
                                            <input style={{ height: '15px', width: '15px' }} type='checkbox' name={dato.ID} id={dato.ID} checked={dato.Visible} onChange={this.onSeleccionar} />
                                            <label style={{ paddingLeft: "5px" }} htmlFor={dato.ID} >{dato.IdTarea.Title}</label>
                                        </div>
                                        : null
                                })}
                            </div>
                            <div className='col-sm-6'>
                                <label style={{ fontSize: "18px" }} className='texto'>Material de ventas fabricado</label>
                                {this.state.datos.map((dato) => {
                                    return dato.IdTarea.Subcluster === 'Material de ventas fabricado' ?
                                        <div key={dato.ID}>
                                            <input style={{ height: '15px', width: '15px' }} type='checkbox' name={dato.ID} id={dato.ID} checked={dato.Visible} onChange={this.onSeleccionar} />
                                            <label style={{ paddingLeft: "5px" }} htmlFor={dato.ID} >{dato.IdTarea.Title}</label>
                                        </div>
                                        : null
                                })}
                            </div>
                        </div>
                        <hr />
                        <div className='row'>
                            <div className='col-sm-12 derecha'>
                                <input type="button" className="btn btn-info btn-md" value='Guardar' onClick={this.onGuardar} />
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

export default EditarCluster