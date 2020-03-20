import React, {Component} from 'react';
import '../estilos/modal.css';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
//import PeoplePicker from './PeoplePicker'
import PeoplePicker from './UserPicker'


class Ventana extends Component{
    constructor(props){
        super(props)
        this.initialState = {
            campos: [],
            usuarios: [],
            ejecutado:false,
            usuarioAsignados: []
        }
        this.onGuardar = this.onGuardar.bind(this);
        this.onEnviar = this.onEnviar.bind(this);
        this.state = this.initialState
    }
    

    onGuardar(idTarea) {
        switch(idTarea){
            case 268:
                break;
            default:
                break;
        }
        //event.preventDefault();
        alert('Guardando...')
    }

    onEnviar = () => {
        alert('Enviando...');
        this.props.cerrar();
    }

    onCerrar = ()=>{
        this.setState(this.initialState)
        this.props.cerrar()
    }
    
    obtenerCampos = async idTarea =>{
        const users = await sp.web.siteUsers();
        if(!this.props.abrir.esTarea){
            if(idTarea>0){
                //Obtiene los campos a pintar en el formulario
                var campos = await sp.web.lists.getByTitle('Relación campos documentos trámites tareas').items
                .select('Tarea/ID', 'Tarea/Title', 'Title', 'TituloInternoDelCampo', 'TipoDeCampo', 'ListaDeGuardado',
                    'ListaDeGuardadoSecundario', 'Catalogos', 'Ordenamiento', 'Requerido', 'Tramite', 'Activo', 'Boton')
                .filter('(TareaId eq ' + idTarea + ') and (Activo eq 1)')
                .expand('Tarea')
                .orderBy('Ordenamiento', true).get();
                //this.props.abrir.id = 0
                //const users = await sp.web.siteUsers();
                this.setState({campos: campos, usuarios: users})
                //Establece el estado el resultado de la consulta
                //this.setState({campos: campos})
            }
        }else{
            //this.props.abrir.id = 0
            alert('Tarea')
            //Consultar ID de elemento en con props.modal.id y leer la tarea y buscarla en Relación campos documentos trámites tareas
        }
    }

    componentDidMount(){
        if(this.props.abrir.abierto){
            this.obtenerCampos(this.props.abrir.id)
        }
    }
    
    shouldComponentUpdate(nextProps, nextState){
        if(this.state.usuarioAsignados.length !== nextState.usuarioAsignados.length){
            return false
        }else{
            return true
        }
    }

    seleccionarItems = items=>{
        this.setState({usuarioAsignados : items})
    }

    render(){
        var boton = "";
        var ID = 0;
        const Formulario = ()=>{
            const formulario = this.state.campos.map((campo)=>{
                boton = campo.Boton;
                ID = campo.ID;
                return(
                    <div>
                        {(() => {
                            switch(campo.TipoDeCampo) {
                                case 'Radio':
                                    return <div key={campo.ID}>
                                                <input type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} placeholder={campo.Title} />
                                                <label>{campo.Title}</label>
                                            </div>
                                case 'File':
                                    return <div key={campo.ID}>
                                                <label>{campo.Title}</label>
                                                <input type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} placeholder={campo.Title} />
                                            </div>
                                case 'PeoplePicker':
                                    return  <div key={campo.ID}>
                                                <label>{campo.Title}</label>
                                                <PeoplePicker usuarios={this.state.usuarios} seleccionarItems = {this.seleccionarItems} />
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
                        <div key={ID}>
                            <input type="button" className="btn btn-primary" onClick={this.onEnviar} value='Enviar' />
                        </div>
                    )
                case "GuardarEnviar":
                    return (
                        <div key={ID}>
                            <input type="button" className="btn btn-primary" onClick={this.onGuardar} value='Guardar' />
                            <input type='button' className="btn btn-danger" onClick={this.onEnviar} value='Enviar' />
                        </div>
                    )
                case "Guardar":
                    return (
                        <div key={ID}>
                            <input type="button" className="btn btn-primary" onClick={this.onGuardar} value='Guardar' />
                        </div>
                    )
                default:
                    break;
            }
        }
        return(
            <div>
                {this.state.campos.length>0 ?
                <Modal isOpen={this.props.abrir.abierto}>
                    <form onSubmit={this.handleSubmit}>
                        <ModalHeader className='encabezado'>{this.state.campos[0].Tarea.Title}</ModalHeader>
                        <ModalBody>
                            <fieldset>
                                {<Formulario />}
                            </fieldset>
                        </ModalBody>
                        <ModalFooter>
                            <Botones />
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