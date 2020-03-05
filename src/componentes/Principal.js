import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';
import { sp } from '@pnp/sp';
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { _SharePointQueryable } from '@pnp/sp/sharepointqueryable';

class Principal extends Component {

    state = {
        items: [],
        itemEditar: [{
            ID: 0,
            Title: '',
            NombredelTerreno: ''
        }]
    }

    async componentDidMount() {
        var listItems = await sp.web.lists.getByTitle("Terrenos").items.select("ID", "Title", "NombredelTerreno").orderBy("ID", false).getAll();
        this.setState({ items: listItems });
    }


    render() {

        return (
            <div>

            </div>
        )
    }
}

export default Principal