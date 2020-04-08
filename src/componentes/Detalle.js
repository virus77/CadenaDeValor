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
            campos: []
        }
        this.state = this.initialState
    }

    //#region Eventos de botones
    async onGuardar() {
    }

    onCerrar = ()=>{
        this.setState(this.initialState)
        this.props.cerrar()
    }
    //#endregion

    render(){
        return(
            <div>
                <div className='form-row align-items-center'>
                    <div className='col-sm-6'>
                        <h5 className='textoEncabezado'>Sobre la tarea</h5>
                        <h6 className='textoAgrupador'>Estatus manual</h6>
                        <input type="radio" id='detenido' name='estatus' value={6} />
                        <label htmlFor='detenido' className='texto'>Actividad detenida</label><br/>
                        <input type="radio" id='cancelado' name='estatus' value={7} />
                        <label htmlFor='cancelado' className='texto'>Actividad cancelada</label>
                    </div>
                    <div className='col-sm-6 bordeL'>
                        <h5 className='textoEncabezado'>Informativo</h5>
                        <div className='informativo'>
                            <label className='informativoTexto'>Id PI: </label>
                            <label className='informativoTexto'></label><br/>
                            <label className='informativoTexto'>Id T: </label>
                            <label className='informativoTexto'></label>
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
                        <input type="button" className="btn btn-danger btn-md" value='Cerrar' onClick={this.onCerrar} />
                    </div>
                </div>
            </div>
        )
    }
}

export default Detalle