import React, {Component} from 'react';
import { sp } from "@pnp/sp";
import "@pnp/sp/sites";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import util from '../js/util'
import '../estilos/detalle.css';

class Detalle extends Component{
    constructor(props){
        super(props)
        this.initialState = {
            idElemento: props.datos.info.ID,
            estatusActual: props.datos.info.Estatus,
            estatus: props.datos.info.Estatus,
            estatusAnterior: props.datos.info.EstatusAnterior
        }
        this.state = this.initialState
    }

    //#region Eventos de botones
    onGuardar = async () =>{
        const {idElemento, estatusActual, estatus, estatusAnterior} = this.state
        if(estatusActual.ID !== estatus.ID){
            await sp.web.lists.getByTitle("Flujo Tareas").items.getById(idElemento).update({
                EstatusId: estatus.ID
              })
              .then(()=>{
                this.props.datosRetorno(this.state)
                this.onCerrar()
              })
        }else{
            this.onCerrar()
        }
    }

    onCerrar = ()=>{
        this.setState(this.initialState)
        this.props.cerrar()
    }
    //#endregion

    //#region Eventos de controles
    onSeleccionarEstatus = e =>{
        const {estatusAnterior} = this.state
        const {checked, name, value} = e.target
        this.setState({estatus: {ID: checked ? parseInt(value): estatusAnterior.ID, Title: checked ? name: estatusAnterior.Title}})
    }
    //#endregion

    render(){
        const {estatus} = this.state
        return(
            <div>
                <div className='form-row align-items-center'>
                    <div className='col-sm-6'>
                        <h5 className='textoEncabezado'>Sobre la tarea</h5>
                        <h6 className='textoAgrupador'>Estatus manual</h6>
                        <input type="checkbox" id='detenido' name='detenido' value={6} checked={estatus.Title.toLowerCase() === 'detenido' ? true :false} onChange={this.onSeleccionarEstatus} />
                        <label htmlFor='detenido' className='texto'>Actividad detenida</label><br/>
                        <input type="checkbox" id='cancelado' name='cancelado' value={7} checked={estatus.Title.toLowerCase() === 'cancelado' ? true :false} onChange={this.onSeleccionarEstatus} />
                        <label htmlFor='cancelado' className='texto'>Actividad cancelada</label>
                    </div>
                    <div className='col-sm-6 bordeL'>
                        <h5 className='textoEncabezado'>Informativo</h5>
                        <div className='informativo'>
                            <label className='informativoTexto'>Id PI: </label>
                            <label className='informativoTexto'><u>{this.props.datos.info.IdProyectoInversion.Title}</u></label><br/>
                            <label className='informativoTexto'>Id T: </label>
                            <label className='informativoTexto'><u>{ this.props.datos.info.IdTerreno !== undefined ? this.props.datos.info.IdTerreno.Title: ''}</u></label>
                        </div>
                        <label className='texto'>F. creación de actividad: </label>
                        <label className='textoU'>{util.spDate(this.props.datos.info.Created)}</label><br/>
                        <label className='texto'>F. últ. modificación de actividad: </label>
                        <label className='textoU'>{util.spDate(this.props.datos.info.Modified)}</label><br/>
                        <label className='texto'>Actividad modificada por: </label>
                        <label className='textoU'>{this.props.datos.info.Editor.Title}</label><br/>
                        <label className='texto'>Linea base modificada por: </label>
                        <label className='textoU'>{this.props.datos.info.LineaBaseModifico !== undefined ? this.props.datos.info.LineaBaseModifico.Title : ''}</label>
                    </div>
                </div>
                <hr />
                <div className='row'>
                    <div className='col-sm-12 derecha'>
                        <input type="button" className="btn btn-primary btn-md" value='Guardar' onClick={this.onGuardar} />
                    </div>
                </div>
            </div>
        )
    }
}

export default Detalle