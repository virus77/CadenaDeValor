import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';
import { Accordion, Icon } from 'semantic-ui-react'
import { sp } from '@pnp/sp';
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { _SharePointQueryable } from '@pnp/sp/sharepointqueryable';
import Tabla from './Tabla';

class Principal extends Component {

    async componentDidMount() {
        var listItemsT = await sp.web.lists.getByTitle("Terrenos").items
            .select("ID", "IdProyectoInversion/ID", "NombredelTerreno")
            .expand("IdProyectoInversion")
            .filter("IdProyectoInversion eq 87 and Empadronamiento eq ''")
            .orderBy("ID", false)
            .getAll();

        this.setState({ itemsT: listItemsT });

        var listItemsPI = await sp.web.lists.getByTitle("Proyecto Inversion").items
            .select("ID", "NombreProyectoInversion").orderBy("ID", false)
            .getAll();

        this.setState({ itemsPI: listItemsPI });
    }

    state = {
        itemsT: [],
        itemsPI: [],
        isActive: false
    };

    toggleHidden() {
        this.setState({
            isHidden: !this.state.isHidden
        })
    }

    render() {

        const { itemsT, itemsPI } = this.state

        const Child = (index) => (
            <Tabla itemsData={itemsT} />
        )

        return (
            //itemsPI.map((item, index) => (
            <div>
                <div onClick={() => { this.toggleHidden(index) }} id={"divHeader" + index}>{item.NombreProyectoInversion}</div>
                {this.state.isHidden && <Child id={index} />}
                <div id={"root"}></div>
            </div>

          //  ))


        )
    };
}

export default Principal