import React, {Component} from 'react';
import axios, {post} from 'axios';
import '../estilos/modal.css';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { sp } from "@pnp/sp";
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/sites";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import "@pnp/sp/files";
import "@pnp/sp/folders";
//import PeoplePicker from './PeoplePicker'
import PeoplePicker from './UserPicker'


class Ventana extends Component{
    constructor(props){
        super(props)
        this.initialState = {
            campos: [],
            usuarios: [],
            ejecutado:false,
            usuarioAsignados: props.abrir.id === 270 ? props.datos.valor : [],
            radioChecked: props.datos.valor
        }
        this.onGuardar = this.onGuardar.bind(this);
        this.onEnviar = this.onEnviar.bind(this);
        this.state = this.initialState
    }
    
    async onGuardar() {
        switch(this.props.abrir.id){
            case 268:
                if(this.props.esTerrenoOriginal){
                    const items = await sp.web.lists.getByTitle("Terrenos").items.filter('IdProyectoInversionId eq ' + this.props.idPITerr + ' and Empadronamiento eq null').get();
                    
                    if (items.length > 0) {
                        for(var i=0; i<items.length; i++){
                            await sp.web.lists.getByTitle("Terrenos").items.getById(items[i].ID).update({
                                MACO: this.state.radioChecked
                              });
                        }
                    }
                    this.props.evento(this.state.radioChecked)
                    this.onCerrar()
                }else{
                    const items = await sp.web.lists.getByTitle("Terrenos").items.filter('ID eq ' + this.props.idPITerr).get();
                    
                    if (items.length > 0) {
                        await sp.web.lists.getByTitle("Terrenos").items.getById(items[0].ID).update({
                            MACO: this.state.radioChecked
                          });
                    }
                    this.props.evento(this.state.radioChecked)
                    this.onCerrar()
                }
                break;
            default:
                break;
        }
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
                this.setState({campos: campos, [idTarea]: 'B'})
                //Establece el estado el resultado de la consulta
                //this.setState({campos: campos})
            }
        }else{
            //this.props.abrir.id = 0
            alert('Tarea')
            //Consultar ID de elemento en con props.modal.id y leer la tarea y buscarla en Relación campos documentos trámites tareas
        }
    }

    async componentDidMount(){
        if(this.props.abrir.abierto){
            this.obtenerCampos(this.props.abrir.id)
            if(this.props.abrir.id === 270){
                const users = await sp.web.siteUsers();
                this.obtenerPosiciones(users)
                this.setState({usuarios: users})
            }
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

    handleChange = e => {
        const {id} = e.target;
        this.setState({ radioChecked: id});
    };

    obtenerPosiciones = usuarios =>{
        var indices = this.state.usuarioAsignados.map((usuario)=>{
            return usuarios.findIndex((obj => obj.Id === usuario.ID))
        })
        this.setState({usuarioAsignados: indices})
    }

    //FALTA TERMINAR
    async onCargarArchivo(e, nombreDocumento){
        if (window.confirm('¿Está seguro que desea cargar el archivo "' + e.target.files[0].name + '"?')){
            const archivo = e.target.files[0]
            var webCdV = await sp.web.getParentWeb();
            /*let reader = new FileReader()
            reader.readAsDataURL(archivo[0])

            reader.onload = async (e) =>{
                var webCdV = await sp.web.getParentWeb();
                webCdV = new Web(webCdV.data.Url)
                const formData = {file : e.target.result}

                return post(webCdV.data.parentUrl + '/Documents/I-04124/', formData, { crossdomain: true })
                .then(response =>{
                    console.warn("result: " + response)
                })
                
            }*/
            const file = await webCdV.web.getFolderByServerRelativeUrl("/Documentos/I-04124/").files.add(archivo.name, archivo, true)
            const item = await file.file.getItem();
            await item.update({
                Title: nombreDocumento
            }).then(()=>{
                alert('Se cargó el archivo correctamente')
            }).catch((error)=>{
                alert('Error: ' + error)
            })
        }
    }
    render(){
        var boton = '';
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
                                                <input type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} checked={this.state.radioChecked === campo.TituloInternoDelCampo } onChange={this.handleChange} />
                                                <label>{campo.Title}</label>
                                            </div>
                                case 'File':
                                    return <div key={campo.ID}>
                                                <label>{campo.Title}</label>
                                                <input type={campo.TipoDeCampo} name={campo.Tarea.ID} id={campo.TituloInternoDelCampo} onChange={(e)=>this.onCargarArchivo(e, campo.TituloInternoDelCampo)} />
                                            </div>
                                case 'PeoplePicker':
                                    return  <div key={campo.ID}>
                                                <label>{campo.Title}</label>
                                                <PeoplePicker usuarios={this.state.usuarios} itemsSeleccionados = {this.state.usuarioAsignados} seleccionarItems = {this.seleccionarItems} />
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
                        <div key={ID} className="row">
                            <input type="button" className="btn btn-success btn-md" onClick={this.onEnviar} value='Enviar' />
                            <input type="button" className="btn btn-danger btn-md"  onClick={this.onCerrar} value='Cerrar' />
                        </div>
                    )
                case "GuardarEnviar":
                    return (
                        <div key={ID} className="row">
                            <input type='button' className="btn btn-success btn-md" onClick={this.onEnviar} value='Enviar ' />
                            <input type="button" className="btn btn-primary btn-md" onClick={this.onGuardar} value='Guardar' />
                            <input type="button" className="btn btn-danger btn-md"  onClick={this.onCerrar} value='Cerrar ' />
                        </div>
                    )
                case "Guardar":
                    return (
                        <div key={ID} className="row">
                            <input type="button" className="btn btn-primary btn-md" onClick={this.onGuardar} value='Guardar' />
                            <input type="button" className="btn btn-danger btn-md" onClick={this.onCerrar} value='Cerrar ' />
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