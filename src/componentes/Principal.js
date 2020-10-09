//#region Componentes
import React, { Component } from 'react';
import { Accordion, Icon } from 'semantic-ui-react'
import Tabla from './Tabla';
//#endregion
//#region Imágenes
import main_collapse from '../imagenes/main_collapse.png';
import main_expand from '../imagenes/main_expand.png';
//#endregion
//#region Estilos
import "../estilos/Principal.css"
//#endregion

class Principal extends Component {
    constructor(props) {
        super(props);
        this.initialState = {
            estatusCluster: [],
            clustersColapsados: false
        }
        this.state = this.initialState;
    }
    expandirColapsar = () =>{
        let { estatusCluster, clustersColapsados } = this.state
        this.props.itemsPI.forEach((itemPI, index) => {
            if(!clustersColapsados){
                if(!estatusCluster.some(x=> x === index)){
                    estatusCluster.push(index);
                }
            }else{
                estatusCluster = estatusCluster.filter(x=> x!== index)
            }
        })
        this.setState({ clustersColapsados: !clustersColapsados, estatusCluster: estatusCluster })
    }

    handleClick = (e, titleProps) => {
        const { index } = titleProps
        let {estatusCluster} = this.state
        const existeIndice = estatusCluster.some(x=> x === index)
        if(!existeIndice){
            estatusCluster.push(index)
        }else{
            estatusCluster = estatusCluster.filter(x=> x!== index)
        }
        this.setState({ estatusCluster: estatusCluster })
    }

    styleLink = () => {
        const styleLink = document.createElement("link");
        styleLink.rel = "stylesheet";
        styleLink.href = "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
        document.head.appendChild(styleLink);
    }

    render() {
        const { clustersColapsados, estatusCluster } = this.state
        const { selecciontereno, itemsT, itemsPI } = this.props
        this.styleLink()

        return (
            <div>
                <div style={{position:'fixed', top:'1%', width:'100%'}}>
                    <label style={{marginLeft:'8%', fontSize: '20px', float:'left'}}>Proyectos | Cadena de valor</label>
                    <div style={{float:'right', marginRight:'8%', verticalAlign: 'top', display:'inline-block', textAlign: 'center', height:'20px', wordWrap:'break-word'}}>
                        <img alt='terreno' src={!clustersColapsados ? main_collapse : main_expand} style={{height:'20px'}} onClick={this.expandirColapsar} />
                        {clustersColapsados ? ' Expandir clústers' : ' Contraer clústers'}
                    </div>
                </div>
                <div style={{ height:'95%', overflowX: 'hidden', overflowY: 'scroll', position:'fixed', top:'5%', width:'100%'}}>
                {itemsPI.map((item, index) => (
                    <div key={index}>
                        <Accordion styled>
                            <Accordion.Title
                                active={estatusCluster.includes(index)}
                                index={index}
                                onClick={this.handleClick} className="HeaderAcc">
                                <Icon name='dropdown' />
                                {item.NombreProyectoInversion}
                            </Accordion.Title>
                            <Accordion.Content active={!estatusCluster.includes(index)}>
                                <div><Tabla selecciontereno={selecciontereno} itemsData={itemsT} indice={item} /></div>
                            </Accordion.Content>
                        </Accordion>
                        <div id={"root"}></div>
                    </div>
                ))}
                </div>
            </div>
        )
    };
}

export default Principal