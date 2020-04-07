import React, {Component} from 'react';
import { sp } from "@pnp/sp";
import update from 'immutability-helper';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/sites";
import '../estilos/modal.css';

class SeleccionRFS extends Component{
    constructor(props){
        super(props)
        this.initialState ={
            tituloPI: props.datos.ProyectoInversion.Title,
            idFlujoTareas: props.datos.IdFlujoTareasId,
            tipo: props.tipo,
            terrenos: [],
            cantidadTerrenos: 0,
            sumaSeleccion: 0,
            sumatoriaNueva:0,
            metrajesTr: [],
            terrenosResultantes: [],
            terrenosSeleccionados: []
        }
        this.state = this.initialState
    }
    
    obtenerDatosGuardados = async () =>{
        const item = await sp.web.lists.getByTitle("RFSN").items.getById(this.state.idFlujoTareas).get()

    }

    onCambiarCantidad = e =>{
        const {name, valueAsNumber} = e.target;
        this.setState({[name]: valueAsNumber});
    }

    onCambiarMaco = e =>{
        const {id, value} = e.target;
        const posicion = this.state.terrenosResultantes.findIndex(obj => obj.SId === id)
        let newData = this.state.terrenosResultantes[posicion]
        newData.MACO = value
        let arrayTrs = this.state.terrenosResultantes
        
        arrayTrs = update(this.state.terrenosResultantes, {$splice: [[posicion, 1, newData]]})
        this.setState({terrenosResultantes: arrayTrs})
    }

    onCerrar = () =>{
        this.setState(this.initialState)
        this.props.cerrar()
    }

    onGenerarCampos =() =>{
        if(this.state.cantidadTerrenos>0){
            let array =[]
            for(let i = 0; i<this.state.cantidadTerrenos; i++){
                array.push({ID: 'M' + (i + 1), SId: 'S'+ (i + 1), MACO: 'B'})
            }
            this.setState({terrenosResultantes: array})
        }else{
            alert('El valor de los terrenos resultantes debe ser mayor a 0')
        }
    }

    onSumarMetraje = e=>{
        const {value, checked} = e.target
        this.setState({sumaSeleccion: checked? this.state.sumaSeleccion + parseFloat(value) : this.state.sumaSeleccion - parseFloat(value)})
    }

    onSumaTotal = e =>{
        const {name, valueAsNumber} = e.target;
        let arrayMetrajes = this.state.metrajesTr
        let sumatoria=0
        const posicion = arrayMetrajes.findIndex(obj => obj.name === name)
        if(posicion === -1){
            arrayMetrajes.push({name: name, valor: valueAsNumber})
        }else{
            arrayMetrajes[posicion].valor = valueAsNumber
        }

        arrayMetrajes.forEach(metrajeActual => {
            sumatoria+=metrajeActual.valor
        });
        this.setState({metrajesTr: arrayMetrajes, sumatoriaNueva: sumatoria});
    }

    onEnviar = async ()=>{
        switch(this.props.tipo){
            case 'TS':
                if(this.state.terrenos.length === 1 && this.state.terrenosResultantes.length>0){
                    if(this.state.sumaSeleccion !== this.state.sumatoriaNueva){
                        alert('No validación: Las sumatorias no coinciden')
                    }else{
                        this.props.datosRetorno(this.state)
                        this.onCerrar()
                    }
                }else{
                    alert('Por favor, seleccione solamente un terreno')
                }
                break;
            default:
                break;
        }
    }

    async componentDidMount(){
        const terrenos = await sp.web.lists.getByTitle("Terrenos").items
        .filter('IdProyectoInversionId eq ' + this.props.datos.ProyectoInversion.ID + ' and Empadronamiento eq null')
        .select('ID', 'Title', 'NombredelTerreno2', 'Metraje','MACO')
        .get();
        this.setState({terrenos: terrenos})
    }

    render(){
        return(
            <div className="container-fluid">
                {this.state.terrenos.length>0 ?
                    <div>
                        <div className="row">
                            <div className="col-sm">
                            {this.state.terrenos.map((terreno) =>{
                                    return(
                                        <div key={terreno.ID}>
                                            <input className='form-check-input' type='checkbox' id={terreno.ID} name={terreno.ID} value={terreno.Metraje} onChange={this.onSumarMetraje} />
                                            <h4>{terreno.Title + ': ' + terreno.NombredelTerreno2}</h4>
                                        </div>
                                    )
                                })}
                                <hr />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm form-group">
                                <h6>Sumatoria de superficies originales seleccionadas:</h6>
                                <input type='number' className='form-control form-control-sm control' id='sumaSeleccion' name='sumaSeleccion' value= {this.state.sumaSeleccion} readOnly />
                                <br/>
                                <input type='button' className='btn btn-light' id='btnGenerar' name='btnGenerar' value='Generar' onClick={this.onGenerarCampos} />
                            </div>
                            <div className="col-sm">
                                <h6>N° de terrenos resultantes:</h6>
                                <input type='number' className='form-control form-control-sm control' id='cantidadTerrenos' min='1' name='cantidadTerrenos' value= {this.state.cantidadTerrenos} onChange={this.onCambiarCantidad} />
                            </div>
                            {this.state.terrenosResultantes.length>0 ?
                            <div className="col-sm">
                                <h6>Superficie por terreno resultante (m<sup>2</sup>):</h6>
                                {this.state.terrenosResultantes.map((terreno, index) =>{
                                    return(
                                        <div key={index} className='form-group display'>
                                            <input className='form-control form-control-sm control' type='number' defaultValue={0} min='0' step='0.01' id={terreno.ID} name={terreno.ID} onChange={this.onSumaTotal} />
                                            <b><h6 htmlFor={terreno.ID} >{this.props.tipo + (index + 1)}</h6></b>
                                            <select id={terreno.SId} name={terreno.SId} className='select' defaultValue = {terreno.MACO} onChange={this.onCambiarMaco}>
                                                <option value='B'>B</option>
                                                <option value='C'>C</option>
                                            </select>
                                        </div>
                                    )
                                })}
                                <p>Sumatoria de nuevas superficies resultantes:</p>
                                <input className='form-control form-control-sm control' type='number' id='sumatoriaNueva' value={this.state.sumatoriaNueva} name='sumatoriaNueva' readOnly />
                            </div>
                            : <div className="col-sm"></div>
                            }
                        </div>
                        <div className="row pie">
                            <div className="col-sm">
                                <br/>
                                <input type="button" className="btn btn-success btn-md" onClick={this.onEnviar} value='Enviar' />
                                <input type="button" className="btn btn-danger btn-md"  onClick={this.onCerrar} value='Cerrar' />
                            </div>
                        </div>
                    </div>
                    : null
                }
            </div>
        )
    }
}

export default SeleccionRFS