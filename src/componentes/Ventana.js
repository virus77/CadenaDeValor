import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';
import '../estilos/modal.css';
//import Modal from "react-responsive-modal";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
<<<<<<< HEAD
import 'bootstrap/dist/css/bootstrap.css';

class Ventana extends Component {

    constructor(props) {
        super(props);
        this.state = { modal: false, name: '', team: '', country: '' };

        this.toggle = this.toggle.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);
        this.handleChangeTeam = this.handleChangeTeam.bind(this);
        this.handleChangeCountry = this.handleChangeCountry.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }
    handleChangeName(event) {
        this.setState({ name: event.target.value });
    }
    handleChangeTeam(event) {
        this.setState({ team: event.target.value });
    }
    handleChangeCountry(event) {
        this.setState({ country: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    render() {
        const { lgShow, setLgShow } = this.state
        return (
            <div>
                <h1>React Bootstrap Modal Example</h1>
                <Button color="success" onClick={this.toggle}>React Modal</Button>
                <Modal isOpen={this.state.modal}>
                    <form onSubmit={this.handleSubmit}>
                        <ModalHeader>IPL 2018</ModalHeader>
                        <ModalBody>
                            <div className="row">
                                <div className="form-group col-md-4">
                                    <label>Name:</label>
                                    <input type="text" value={this.state.name} onChange={this.handleChangeName} className="form-control" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="form-group col-md-4">
                                    <label>Team:</label>
                                    <input type="text" value={this.state.team} onChange={this.handleChangeTeam} className="form-control" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="form-group col-md-4">
                                    <label>Country:</label>
                                    <input type="text" value={this.country} onChange={this.handleChangeCountry} className="form-control" />
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <input type="submit" value="Submit" color="primary" className="btn btn-primary" />
                            <Button color="danger" onClick={this.toggle}>Cancel</Button>
                        </ModalFooter>
                    </form>
                </Modal>
                {/*  <Modal open={this.props.open[0].showModal} onClose={this.props.cerrar} closeOnEsc={false} closeOnOverlayClick={false} closeIconSize={20}>
                    <div className='encabezado'>{this.props.open[0].encabezado}</div>
                    <div className='datoTerreno'>{this.props.open[0].terreno}</div>
                    <div className='cuerpo'>
                        Aquí va el contenido
                    </div>
                    <div className='pie'>
                        <input type='button' value='Guardar'></input>
                    </div>
                </Modal>*/}
            </div >
=======
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
>>>>>>> f360dec2648f391192f05eb349422b33ab9022ed
        );
    }
}

export default Ventana;