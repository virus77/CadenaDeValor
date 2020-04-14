import React, { Component } from 'react';
import PeoplePicker from './UserPicker'
import { sp } from "@pnp/sp";
import "@pnp/sp/sites";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import '../estilos/actividadFicticia.css';

class ActividadFicticia extends Component {
    constructor(props) {
        super(props)
        this.initialState = {
            campos: [],
            usuarios: [],
            usuarioAsignados: [],
            NombreActividad: '',
            GrupoResponsableId: 15,
            GrupoResponsable: 'CODI',
            LineaBase: '',
            FechaEstimada: '',
            Estatus: 0
        }
        this.state = this.initialState
    }

    //#region Métodos de ciclo de vida
    async componentDidMount() {
        let resultados = []
        if (!this.props.datos.Tarea.ID === 271) {
            resultados = await sp.web.lists.getByTitle('Flujo Tareas').items
                .select('ID', 'NombreActividad', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'AsignadoA/ID', 'AsignadoA/Name',
                    'LineaBase', 'FechaEstimada', 'Estatus/Title')
                .filter('ID eq' + this.props.datos.IdFlujoId)
                .expand('GrupoResponsable', 'AsignadoA', 'Estatus')
                .get()
        }
        const listaUsuarios = await sp.web.siteUsers();
        this.setState({ usuarios: listaUsuarios, datosTarea: resultados })
    }
    //#endregion

    //#región Eventos de controles
    onCambiar = e => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    };

    onCambiarEstatus = e => {
        const { name } = e.target;
        this.setState({ Estatus: name });
    }
    onSeleccionarItems = items => {
        this.setState({ usuarioAsignados: items })
    }
    //#endregion

    //#region Eventos de botones
    onCerrar = () => {
        this.setState(this.initialState)
        this.props.cerrar()
    }

    onGuardar = async () => {
        if (this.state.NombreActividad !== '' && this.state.usuarioAsignados.length > 0) {
            const usuariosAsignados = this.obtenerIdAsignados(this.state.usuarioAsignados)
            await sp.web.lists.getByTitle('Flujo Tareas').items.add({
                IdProyectoInversionId: this.props.IdPI,
                IdTareaId: this.props.datos.Tarea.ID,
                NivelId: 2,
                IdTerrenoId: this.props.IdTerr,
                NombreActividad: this.state.NombreActividad,
                GrupoResponsableId: this.state.GrupoResponsableId,
                AsignadoAId: usuariosAsignados,
                LineaBase: this.state.LineaBase,
                FechaEstimada: this.state.FechaEstimada,
                EstatusId: this.state.Estatus
            })
        }
    }
    //#endregion

    //#region Métodos generales
    obtenerIdAsignados = campo => {
        let val = { results: [] }
        if (campo !== undefined) {
            campo.map((registro) => {
                val.results.push((registro.Id || registro.ID))
            })
        }
        return val
    }
    //#endregion    
    render() {
        const { NombreActividad, GrupoResponsable, LineaBase, FechaEstimada, Estatus } = this.state
        return (
            <form>
                <div className='form-row align-items-center'>
                    <div className='col-sm-8 borde'>
                        <h6 className='texto'><span className='obligatorio'>*</span>Nombre de la actividad</h6>
                        <input type="text" name='NombreActividad' className='form-control' value={NombreActividad} onChange={this.onCambiar} maxLength={255} />
                        <h6 className='texto'>Grupo responsable</h6>
                        <input type="text" name='GrupoResponsable' className='form-control' value={GrupoResponsable} readOnly />
                        <h6 className='texto'><span className='obligatorio'>*</span>Asignado(s) a</h6>
                        <PeoplePicker usuarios={this.state.usuarios} itemsSeleccionados={this.state.usuarioAsignados} seleccionarItems={this.onSeleccionarItems} />
                        <h6 className='texto'>Fecha compromiso</h6>
                        <input type="date" name='LineaBase' className='form-control' value={LineaBase} onChange={this.onCambiar} />
                        <h6 className='texto'>Fecha estimada de entrega</h6>
                        <input type="date" name='FechaEstimada' className='form-control' value={FechaEstimada} onChange={this.onCambiar} />
                    </div>
                    <div className='col-sm-4'>
                        <h5 className='texto'>Estatus</h5>
                        <input type='button' name='1' className={Estatus === "1" ? "concluido btn-sm anchoBoton" : "btn btn-secondary btn-sm anchoBoton"} value='Concluido' onClick={this.onCambiarEstatus} /><br /><br />
                        <input type='button' name='2' className={Estatus === "2" ? "pendiente btn-sm anchoBoton" : "btn btn-secondary btn-sm anchoBoton"} value='Pendiente' onClick={this.onCambiarEstatus} /><br /><br />
                        <input type='button' name='3' className={Estatus === "3" ? "vencido btn-sm anchoBoton" : "btn btn-secondary btn-sm anchoBoton"} value='Vencido' onClick={this.onCambiarEstatus} /><br /><br />
                        <input type='button' name='4' className={Estatus === "4" ? "rechazado btn-sm anchoBoton" : "btn btn-secondary btn-sm anchoBoton"} value='Rechazado' onClick={this.onCambiarEstatus} /><br /><br />
                        <input type='button' name='5' className={Estatus === "5" ? "detenido btn-sm anchoBoton" : "btn btn-secondary btn-sm anchoBoton"} value='Detenido' onClick={this.onCambiarEstatus} />
                    </div>
                </div>
                <hr />
                <div className='row'>
                    <div className='col-sm-6 izquierda'>
                        <input type="button" className="btn btn-secondary btn-md" value='Eliminar' />
                    </div>
                    <div className='col-sm-6 derecha'>
                        <input type="button" className="btn btn-info btn-md" value='Guardar' onClick={this.onGuardar} />
                    </div>
                </div>
            </form>
        )
    }
}

export default ActividadFicticia