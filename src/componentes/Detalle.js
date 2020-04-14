import React, {Component} from 'react';
import { sp } from "@pnp/sp";
import "@pnp/sp/sites";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import '../estilos/detalle.css';

class Detalle extends Component{
    constructor(props){
        super(props)
        this.initialState = {
            estatus: props.datos.info.Estatus,
            //estatusAnterior: props.datos.info.EstatusAnterior
        }
        this.state = this.initialState
    }

    //#region Eventos de botones
    async onGuardar() {
        alert('Temporalmente sin funcionalidad')
    }

    onCerrar = ()=>{
        this.setState(this.initialState)
        this.props.cerrar()
    }
    //#endregion

    onSeleccionarEstatus = e =>{
        const {checked, name, value} = e.target
        this.setState({estatus: {ID: checked ? value: 0, Title: checked ? name: ''}})
    }

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
                        <label className='texto'></label><br/>
                        <label className='texto'>F. últ. modificación de actividad: </label>
                        <label className='texto'></label><br/>
                        <label className='texto'>Actividad modificada por: </label>
                        <label className='texto'></label><br/>
                        <label className='texto'>Linea base modificada por: </label>
                        <label className='texto'></label>
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