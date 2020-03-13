import React, {Component} from 'react';
import '../estilos/modal.css';
import Modal from "react-responsive-modal";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

class Ventana extends Component{
    constructor(props){
        super(props)
        this.initialState = {
            campos: []
        }
        this.state = this.initialState
    }
    
    obtenerCampos = async idTarea =>{
        if(idTarea>0){
            var campos = await sp.web.lists.getByTitle('Relación campos documentos trámites tareas').items
            .select('Tarea/ID','Tarea/Title','Title','TituloInternoDelCampo','TipoDeCampo','ListaDeGuardado','ListaDeGuardadoSecundario','Catalogos','Ordenamiento','Requerido','Tramite','Activo')
            .filter('TareaId eq ' + idTarea)
            .expand('Tarea')
            .orderBy('Ordenamiento', true).get();
            this.props.open[0].id = 0
            this.setState({campos: campos})
        }
    }

    render(){
        this.obtenerCampos(this.props.open[0].id)
        const Formulario = ()=>{
            const formulario = this.state.campos.map((campo)=>{
                return(
                    <div key={campo.ID}>
                        <input type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} />
                        <label>{campo.Title}</label>
                    </div>
                )
            });
            return formulario
        }
        return(
            <div>
                {this.state.campos.length>0 ? 
                    <Modal open={this.props.open[0].showModal} onClose={this.props.cerrar} closeOnEsc={false} closeOnOverlayClick={false} closeIconSize={20}>
                        <div className='encabezado'>{this.state.campos[0].Tarea.Title}</div>
                        <div className='datoTerreno'>{this.props.open[0].terreno}</div>
                        <div className='cuerpo'>
                            <fieldset>
                                <Formulario />
                            </fieldset>
                        </div>
                        <div className='pie'>
                            <input type='button' value='Guardar'></input>
                        </div>
                    </Modal>
                    : null
                }
            </div>
        );
    }
}

export default Ventana;