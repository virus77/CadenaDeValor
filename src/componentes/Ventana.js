import React, {Component} from 'react';
import '../estilos/modal.css';
//import Modal from "react-responsive-modal";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
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
        this.onGuardar = this.onGuardar.bind(this);
        this.state = this.initialState
    }

    onGuardar(event) {
        //event.preventDefault();
        alert('Guardando...')
    }

    onCerrar = ()=>{
        this.setState(this.initialState)
        this.props.cerrar()
    }
    
    obtenerCampos = async idTarea =>{
        if(!this.props.open[0].esTarea){
            if(idTarea>0){
                //Obtiene los campos a pintar en el formulario
                var campos = await sp.web.lists.getByTitle('Relación campos documentos trámites tareas').items
                .select('Tarea/ID','Tarea/Title','Title','TituloInternoDelCampo','TipoDeCampo','ListaDeGuardado','ListaDeGuardadoSecundario','Catalogos','Ordenamiento','Requerido','Tramite','Activo')
                .filter('TareaId eq ' + idTarea)
                .expand('Tarea')
                .orderBy('Ordenamiento', true).get();
                //Establece el estado el resultado de la consulta
                this.setState({campos: campos})
            }
        }else{
            alert('Tarea')
            var a = this.props.open[0].id
            //Consultar ID de elemento en con props.modal.id y leer la tarea y buscarla en Relación campos documentos trámites tareas
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
                <Modal isOpen={this.props.open[0].showModal}>
                    <form onSubmit={this.handleSubmit}>
                        <ModalHeader className='encabezado'>{this.state.campos[0].Tarea.Title}</ModalHeader>
                        <ModalBody>
                            <fieldset>
                                <Formulario />
                            </fieldset>
                        </ModalBody>
                        <ModalFooter>
                            <input type="button" className="btn btn-primary" onClick={this.onGuardar} value='Guardar' />
                            <input type='button' className="btn btn-danger" onClick={this.onCerrar} value='Cerrar' />
                        </ModalFooter>
                    </form>
                </Modal>
                    : null
                }
            </div>
        );
    }
}

export default Ventana;