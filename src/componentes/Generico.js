import React, { Component } from 'react';
import Encabezado from '../componentes/Encabezado';
import Modal from '../componentes/Ventana';
import Backdrop from '../componentes/Backdrop';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { InputLabel, Select, MenuItem } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import update from 'immutability-helper';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardTimePicker, KeyboardDatePicker, DatePicker } from '@material-ui/pickers';
import TextField from '@material-ui/core/TextField';
import arrow_down_icon from '../imagenes/arrow_down_icon.png';
import attach_icon from '../imagenes/attach_icon.png';
import more_details_icon from '../imagenes/more_details_icon.png';
import assignedTo_icon from '../imagenes/assignedTo_icon.png';
import disk from '../imagenes/disk.png';
import plus_icon from '../imagenes/plus_icon.png';
import egupload_icon from '../imagenes/egupload_icon.png';
import favoritos_icon from '../imagenes/favoritos_icon.png';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
<<<<<<< HEAD
import util from '../js/util'
//import {onSave} from '../js/eg.js';
import { es, ca } from 'date-fns/locale';
import moment from 'moment'
=======
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { InputLabel, Select, MenuItem } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import update from 'immutability-helper';
import util from '../js/util'
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b

/*async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}*/
<<<<<<< HEAD

=======
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b

var checkedItems = [];
var webUrl = ''
const useStyles = makeStyles(theme => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
        textAlign: "left",
    },
}));

class Generico extends Component {
    constructor(props) {
        super(props)
        this.inialState = {
            cargado: false,
            idProyecto: props.idProyecto,
            idTerreno: props.idTerreno,
            idVentana: 4,
            totalAdmin: 0,
            totalNorm: 0,
            totalProy: 0,
            idVentanaAnterior: 3,
            datosVentanaEG: [],
            datosVentana: [],
            Star: false,
            Gantt: false,
            User: false,
            disabled: true,
            clustersVentana: [],
            MACO: props.maco,
            datos: {
                campo: '',
                valor: ''
            },
            modal: {
                abierto: false,
                id: 0,
                terreno: '',
                esTarea: false,
                filaSeleccionada: {}
            },
            backdrop: {
                cargado: false,
                mensaje: 'Cargando contenido...'
            },
            terrenos: []
        }
        this.state = this.inialState;
    }

    //#region Métodos de modal
    onAbrirModal = (terreno, id, esTarea, campo, valor, fila, ventana) => {
        //Si el evento viene de la ventana de E.G.
<<<<<<< HEAD
        if (ventana === 4) {
            if (fila.Tarea.ID === 24 && this.props.maco === null) {
                alert('No puedes generar RFSN hasta definir el tipo de MACO. Hazlo en el botón superior, junto al nombre del proyecto.')
            } else {
=======
        if(ventana === 4){
            if(fila.Tarea.ID === 24 && this.props.maco === null){
                alert('No puedes generar RFSN hasta definir el tipo de MACO. Hazlo en el botón superior, junto al nombre del proyecto.')
            }else{
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                this.setState({
                    modal: { abierto: true, id: id, terreno: terreno, esTarea: esTarea, filaSeleccionada: fila },
                    datos: { campo: campo, valor: valor }
                })
            }
<<<<<<< HEAD
        } else {
=======
        }else{
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
            this.setState({
                modal: { abierto: true, id: id, terreno: terreno, esTarea: esTarea, filaSeleccionada: fila },
                datos: { campo: campo, valor: valor }
            })
        }
    }

    onCerrarModal = () => {
        this.setState({ modal: this.inialState.modal })
    };
<<<<<<< HEAD
    //#endregion				   

=======
    //#endregion
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
    onHandleChange = async (event) => {

        var actividades = [];
        var result = [];
        var tittle = event.target.name.split("|")[0];
        var tipo = event.target.name.split("|")[1];
        if (tipo === "EG") {
            var actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                .filter('(IdProyectoInversionId eq ' + this.props.idProyecto + ') or (IdTerrenoId eq ' + this.props.idTerreno + ')')
                .select('IdTarea/TxtVentana')
                .expand('IdTarea')
                .getAll();

            var filter = "";

            switch (tittle) {
                case 'Responsable':
                    filter = "(GrupoResponsable/ID eq " + event.target.value + ") and "
                    break;

                default:
                    filter = "(AsignadoA/ID eq " + event.target.value + ") and ";
                    break;
            }

            var datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
                .filter(filter + '(ProyectoInversionId eq ' + this.props.idProyecto + ')')
                .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Terreno/Title',
                    'Terreno/NombredelTerreno2', 'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/OrdenEG',
                    'Tarea/Checkable', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId',
                    'AsignadoA/ID', 'AsignadoA/Title')
                .expand('ProyectoInversion', 'Terreno', 'Tarea', 'GrupoResponsable', 'AsignadoA')
                .orderBy('Tarea/OrdenEG', true)
                .get();

            var RFSEnviado = false;
            var datosEG = {
                columnas: [
                    { titulo: '', interN: '', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-6' },
                    { titulo: 'Responsable', interN: 'GrupoResponsable', value: 'NombreCortoGantt', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-2' },
                    { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-2' },
                    { titulo: 'E. de G. autorizada', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-2' }
                ],
                datos: []
            };

            var ventanas = [actividades.reduce((a, c) => (a[c.IdTarea.TxtVentana] = (a[c.IdTarea.TxtVentana] || []).concat(c), a), {})];
            if (!RFSEnviado) {
                datosEG.datos = datos;
                var result = [];
                result = Array.from(new Set(datosEG.datos.map(s => s.Tarea.TxtCluster)))
                    .map(currentCluster => {
                        return {
                            cluster: datosEG.datos.find(s => s.Tarea.TxtCluster === currentCluster).Tarea
                        };
                    });

                result = result.filter(x => x.cluster !== undefined);
            }
            this.setState({
                backdrop: { cargado: true, mensaje: '' }, datosVentanaEG: datosEG, clustersVentana: result, totalAdmin: ventanas[0].Administración.length,
                totalNorm: ventanas[0].Normativo.length, totalProy: ventanas[0].Proyectos.length, idVentanaAnterior: this.state.idVentanaAnterior
            });
        }
        else {
            //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversión
            actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                .filter('(IdProyectoInversionId eq ' + this.state.idProyecto + ') or (IdTerrenoId eq ' + this.state.idTerreno + ')')
                .select('ID', 'Title', 'IdProyectoInversion/ID', 'IdProyectoInversion/Title', 'IdTerreno/ID',
                    'IdTerreno/Title', 'Nivel/ID', 'Nivel/Title', 'IdTarea/ID', 'IdTarea/Title', 'IdTarea/TxtCluster',
                    'IdTarea/TxtVentana', 'IdTarea/Orden', 'IdTarea/Checkable', 'Estatus/ID', 'Estatus/Title', 'GrupoResponsable/ID',
                    'GrupoResponsable/NombreCortoGantt', 'AsignadoA/ID', 'AsignadoA/Name', 'LineaBase', 'FechaEstimada', 'Favoritos/ID',
                    'Favoritos/Name', 'UrlDocumentos', 'UrlTarea')
                .expand('IdProyectoInversion', 'IdTerreno', 'Nivel', 'IdTarea', 'Estatus', 'GrupoResponsable', 'AsignadoA', 'Favoritos')
                .getAll();

            actividades.sort(function (a, b) {
                if (a.IdTarea.Orden > b.IdTarea.Orden)
                    return 1;
                if (a.IdTarea.Orden < b.IdTarea.Orden)
                    return -1;
                return 0;
            });

            switch (tittle) {
                case 'LineaBase':
                    actividades = actividades.filter(x => x.LineaBase === event.target.value);
                    break;
                case 'FechaEstimada':
                    actividades = actividades.filter(x => x.FechaEstimada === event.target.value);
                    break;
                case 'Estatus':
                    actividades = actividades.filter(x => x.Estatus.ID === event.target.value);
                    break;
                case 'Responsable':
                    actividades = actividades.filter(x => x.GrupoResponsable.ID === event.target.value);
                    break;
                default:
                    actividades = actividades.filter(x => x.AsignadoA.ID === event.target.value);
                    break;
            }

            var ventanas = [actividades.reduce((a, c) => (a[c.IdTarea.TxtVentana] = (a[c.IdTarea.TxtVentana] || []).concat(c), a), {})];
            var datosActs = {
                columnas: [
                    { titulo: '', interN: '', value: '', Tipo: "Act", Arreglo: '', estilo: 'col-sm-4' },
                    { titulo: 'Responsable', interN: 'GrupoResponsable', Tipo: "Act", value: 'NombreCortoGantt', Arreglo: actividades, estilo: 'col-sm-1' },
                    { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                    { titulo: 'Linea base', interN: 'LineaBase', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                    { titulo: 'F. estimada', interN: 'FechaEstimada', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                    { titulo: 'Estatus', interN: 'Estatus', Tipo: "Act", value: 'Title', Tipo: "Estatus", Arreglo: actividades, estilo: 'col-sm-1' },
                    { titulo: 'Adjunto', interN: 'Adjunto', Tipo: "Act", value: 'Adjunto', Arreglo: actividades, estilo: 'col-sm-1' },
                    { titulo: 'Detalle', interN: 'Detalle', Tipo: "Act", value: 'Detalle', Arreglo: actividades, estilo: 'col-sm-1' },
                    { titulo: 'Favoritos', interN: 'Favoritos', Tipo: "Act", value: 'Favoritos', Arreglo: actividades, estilo: 'col-sm-1' }
                ],
                datos: actividades
            }
            var result = [];
            result = Array.from(new Set(datosActs.datos.map(s => s.IdTarea.TxtCluster)))
                .map(currentCluster => {
                    return {
                        cluster: datosActs.datos.find(s => s.IdTarea.TxtCluster === currentCluster && (parseFloat(s.IdTarea.Orden) > parseFloat(this.state.idVentanaAnterior) && parseFloat(s.IdTarea.Orden) < parseFloat(this.state.idVentanaAnterior + 1)))
                    };
                });

            result = result.filter(x => x.cluster !== undefined);
            if (result.length > 0) {
                this.setState({
                    idVentana: this.state.idVentanaAnterior, clustersVentana: result, datosVentana: datosActs, totalAdmin: this.state.totalAdmin,
                    totalNorm: this.state.totalNorm, totalProy: this.state.totalProy, idVentanaAnterior: this.state.idVentanaAnterior,
                    AdministracionAnterior: this.state.AdministracionAnterior, NormativoAnterior: this.state.NormativoAnterior,
                    ProyectosAnterior: this.state.ProyectosAnterior, disabled: false, backdrop: { cargado: true, mensaje: '' }
                });
            }
            else {
                alert("No hay datos que coincidan con los filtros seleccionados. Por favor, intentelo de nuevo")
            }
        }
    }

<<<<<<< HEAD
    onCambiarVentana = async (idVentanaSeleccionada, mensaje, name, style, tipoRFS) => {

        { this.styleLinkGen(name, style) }

=======
    onCambiarVentana = async (idVentanaSeleccionada, mensaje, tipoRFS) => {
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
        const { idProyecto, idTerreno } = this.state

        var result = [];
        var actividades = [];

<<<<<<< HEAD
        if (tipoRFS === '' || tipoRFS === 'TF') {
=======
        if(tipoRFS === '' || tipoRFS === 'TF'){
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
            switch (idVentanaSeleccionada) {
                case 4:
                    var datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
                        .filter('ProyectoInversionId eq ' + idProyecto)
<<<<<<< HEAD
                        .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Terreno/Title',
                            'Terreno/NombredelTerreno2', 'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/OrdenEG',
                            'Tarea/Checkable', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId',
                            'AsignadoA/ID', 'AsignadoA/Title')
                        .expand('ProyectoInversion', 'Terreno', 'Tarea', 'GrupoResponsable', 'AsignadoA')
                        .orderBy('Tarea/OrdenEG', true)
                        .get();

                    var datosEG = {
                        columnas: [
                            { titulo: '', interN: '', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-6' },
                            { titulo: 'Responsable', interN: 'GrupoResponsable', value: 'NombreCortoGantt', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-2' },
                            { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-2' },
                            { titulo: 'E. de G. autorizada', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-2' }
                        ],
                        datos: []
                    };

                    datosEG.datos = datos;

=======
                        .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/OrdenEG',
                            'Tarea/Checkable', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId', 'AsignadoA/ID',
                            'AsignadoA/Title')
                        .expand('ProyectoInversion', 'Terreno', 'Tarea', 'GrupoResponsable', 'AsignadoA')
                        .orderBy('Tarea/OrdenEG', true)
                        .get();
    
                    var datosEG = {
                        columnas: [
                            { titulo: '', interN: '', Arreglo: datos, estilo: 'col-sm-6' },
                            { titulo: 'Responsable', interN: 'GrupoResponsable', value: 'NombreCortoGantt', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-2' },
                            { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-2' },
                            { titulo: 'E. de G. autorizada', Arreglo: datos, estilo: 'col-sm-2' }
                        ],
                        datos: []
                    };
    
                    datosEG.datos = datos;
    
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                    result = Array.from(new Set(datosEG.datos.map(s => s.Tarea.TxtCluster)))
                        .map(currentCluster => {
                            return {
                                cluster: datosEG.datos.find(s => s.Tarea.TxtCluster === currentCluster).Tarea
                            };
                        });
<<<<<<< HEAD

=======
    
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                    result = result.filter(x => x.cluster !== undefined);
                    this.setState({
                        backdrop: { cargado: true, mensaje: '' }, idVentana: idVentanaSeleccionada, clustersVentana: result, datosVentanaEG: datosEG, disabled: true,
                        Star: false, Gantt: false, User: false
                    });
                    break;
                case 1:
                case 2:
                case 3:
<<<<<<< HEAD

                    //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversión
                    actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                        .filter('(IdProyectoInversionId eq ' + idProyecto + ') or (IdTerrenoId eq ' + idTerreno + ')')
                        .select('ID', 'Title', 'IdProyectoInversion/ID', 'IdProyectoInversion/Title', 'IdTerreno/ID',
                            'IdTerreno/Title', 'IdTerreno/NombredelTerreno2', 'Nivel/ID', 'Nivel/Title', 'IdTarea/ID', 'IdTarea/Title', 'IdTarea/TxtCluster',
                            'IdTarea/TxtVentana', 'IdTarea/Orden', 'IdTarea/Checkable', 'Estatus/ID', 'Estatus/Title', 'GrupoResponsable/ID',
                            'GrupoResponsable/NombreCortoGantt', 'AsignadoA/ID', 'AsignadoA/Name', 'LineaBase', 'FechaEstimada', 'Favoritos/ID',
                            'Favoritos/Name', 'UrlDocumentos', 'UrlTarea')
                        .expand('IdProyectoInversion', 'IdTerreno', 'Nivel', 'IdTarea', 'Estatus', 'GrupoResponsable', 'AsignadoA', 'Favoritos')
                        .getAll();

=======
                    //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversiÃ³n
                    actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                        .filter('(IdProyectoInversionId eq ' + idProyecto + ') or (IdTerrenoId eq ' + idTerreno + ')')
                        .select('ID', 'Title', 'IdProyectoInversion/ID', 'IdProyectoInversion/Title', 'IdTerreno/ID',
                            'IdTerreno/Title', 'Nivel/ID', 'Nivel/Title', 'IdTarea/ID', 'IdTarea/Title', 'IdTarea/TxtCluster',
                            'IdTarea/TxtVentana', 'IdTarea/Orden', 'IdTarea/Checkable', 'Estatus/ID', 'Estatus/Title', 'GrupoResponsable/ID',
                            'GrupoResponsable/NombreCortoGantt', 'AsignadoA/ID', 'AsignadoA/Name', 'LineaBase', 'FechaEstimada')
                        .expand('IdProyectoInversion', 'IdTerreno', 'Nivel', 'IdTarea', 'Estatus', 'GrupoResponsable', 'AsignadoA')
                        .getAll();
    
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                    actividades.sort(function (a, b) {
                        if (a.IdTarea.Orden > b.IdTarea.Orden)
                            return 1;
                        if (a.IdTarea.Orden < b.IdTarea.Orden)
                            return -1;
                        return 0;
                    });
    
                    var ventanas = [actividades.reduce((a, c) => (a[c.IdTarea.TxtVentana] = (a[c.IdTarea.TxtVentana] || []).concat(c), a), {})];
                    var datosActs = {
                        columnas: [
                            { titulo: '', interN: '', value: '', Tipo: "Act", Arreglo: '', estilo: 'col-sm-4' },
                            { titulo: 'Responsable', interN: 'GrupoResponsable', Tipo: "Act", value: 'NombreCortoGantt', Arreglo: actividades, estilo: 'col-sm-1' },
                            { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                            { titulo: 'Linea base', interN: 'LineaBase', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                            { titulo: 'F. estimada', interN: 'FechaEstimada', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                            { titulo: 'Estatus', interN: 'Estatus', value: 'Title', Tipo: "Estatus", Arreglo: actividades, estilo: 'col-sm-1' },
                            { titulo: 'Adjunto', interN: 'Adjunto', value: 'Adjunto', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                            { titulo: 'Detalle', interN: 'Detalle', value: 'Detalle', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                            { titulo: 'Favoritos', interN: 'Favoritos', value: 'Favoritos', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' }
                        ],
                        datos: actividades
                    }
    
                    result = Array.from(new Set(datosActs.datos.map(s => s.IdTarea.TxtCluster)))
                        .map(currentCluster => {
                            return {
                                cluster: datosActs.datos.find(s => s.IdTarea.TxtCluster === currentCluster && (parseFloat(s.IdTarea.Orden) > parseFloat(idVentanaSeleccionada) && parseFloat(s.IdTarea.Orden) < parseFloat(idVentanaSeleccionada + 1)))
                            };
                        });
    
                    result = result.filter(x => x.cluster !== undefined);
                    this.setState({
                        idVentana: idVentanaSeleccionada, clustersVentana: result, datosVentana: datosActs, totalAdmin: ventanas[0].Administración.length,
                        totalNorm: ventanas[0].Normativo.length, totalProy: ventanas[0].Proyectos.length, idVentanaAnterior: idVentanaSeleccionada,
                        AdministracionAnterior: ventanas[0].Administración.length, NormativoAnterior: ventanas[0].Normativo.length,
                        ProyectosAnterior: ventanas[0].Proyectos.length, disabled: false, backdrop: { cargado: true, mensaje: '' }
                    });
                    break;
<<<<<<< HEAD

=======
    
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                //Filtro de favoritos
                case 5:
                case 6:
                case 7:
                    if (this.state.disabled === false) {
                        var filterGantt = "";
                        var expandGantt = "";
                        var selectGantt = "";
                        var filterStar = "";
                        var selectStar = "";
<<<<<<< HEAD
                        var expandStart = "";
                        switch (idVentanaSeleccionada) {
                            case 5:
                                filterStar = ' (Favoritos/ID ne 0) and ';
                                selectStar = ', ' + 'Favoritos/ID, Favoritos/Name';
                                expandStart = ', ' + 'Favoritos';

=======
                        switch (idVentanaSeleccionada) {
                            case 5:
                                filterStar = ' (Favoritos ne 0) and ';
                                selectStar = ', ' + 'Favoritos';
    
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                                if (this.state.Gantt === true && this.state.User === true) {
                                    filterGantt = " (IdLocalizacionActividades/ID ne null) and ";
                                    selectGantt = ', ' + 'IdLocalizacionActividades/ID';
                                    expandGantt = ', ' + 'IdLocalizacionActividades';
                                }
                                else if (this.state.Gantt === true) {
                                    filterGantt = " (IdLocalizacionActividades/ID ne null) and ";
                                    selectGantt = ', ' + 'IdLocalizacionActividades/ID';
                                    expandGantt = ', ' + 'IdLocalizacionActividades';
                                }
                                else if (this.state.User === true) {
                                }
<<<<<<< HEAD

                                this.state.Star = true;
                                break;

=======
    
                                this.state.Star = true;
                                break;
    
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                            case 6:
                                filterGantt = " (IdLocalizacionActividades/ID ne null) and ";
                                selectGantt = ', ' + 'IdLocalizacionActividades/ID';
                                expandGantt = ', ' + 'IdLocalizacionActividades';
<<<<<<< HEAD

                                if (this.state.Star === true && this.state.User === true) {
                                    filterStar = ' (Favoritos/ID ne 0) and ';
                                    selectStar = ', ' + 'Favoritos/ID, Favoritos/Name';
                                    expandStart = ', ' + 'Favoritos';
                                }
                                else if (this.state.Star === true) {
                                    filterStar = ' (Favoritos/ID ne 0) and ';
                                    selectStar = ', ' + 'Favoritos/ID, Favoritos/Name';
                                    expandStart = ', ' + 'Favoritos';
                                }
                                else if (this.state.User === true) {
                                }

                                this.state.Gantt = true;
                                break;

=======
    
                                if (this.state.Star === true && this.state.User === true) {
                                    filterStar = '(Favoritos ne 0) and ';
                                    selectStar = ', ' + 'Favoritos';
                                }
                                else if (this.state.Star === true) {
                                    filterStar = '(Favoritos ne 0) and ';
                                    selectStar = ', ' + 'Favoritos';
                                }
                                else if (this.state.User === true) {
                                }
    
                                this.state.Gantt = true;
                                break;
    
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                            case 7:
                                if (this.state.Gantt === true && this.state.Star === true) {
                                    filterGantt = " (IdLocalizacionActividades/ID ne null) and ";
                                    selectGantt = ', ' + 'IdLocalizacionActividades/ID';
                                    expandGantt = ', ' + 'IdLocalizacionActividades';
<<<<<<< HEAD
                                    filterStar = ' (Favoritos/ID ne 0) and ';
                                    selectStar = ', ' + 'Favoritos/ID, Favoritos/Name';
                                    expandStart = ', ' + 'Favoritos';
=======
                                    filterStar = '(Favoritos ne 0) and ';
                                    selectStar = ', ' + 'Favoritos';
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                                }
                                else if (this.state.Gantt === true) {
                                    filterGantt = " (IdLocalizacionActividades/ID ne null) and ";
                                    selectGantt = ', ' + 'IdLocalizacionActividades/ID';
                                    expandGantt = ', ' + 'IdLocalizacionActividades';
                                }
                                else if (this.state.Star === true) {
<<<<<<< HEAD
                                    filterStar = ' (Favoritos/ID ne 0) and ';
                                    selectStar = ', ' + 'Favoritos/ID, Favoritos/Name';
                                    expandStart = ', ' + 'Favoritos';
                                }

=======
                                    filterStar = '(Favoritos ne 0) and ';
                                    selectStar = ', ' + 'Favoritos';
                                }
    
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                                this.state.User = true;
                                break;
                            default:
                                break;
                        }
<<<<<<< HEAD

                        actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                            .filter(filterStar + filterGantt + '(IdProyectoInversionId eq ' + idProyecto + ') or (IdTerrenoId eq ' + idTerreno + ')')
                            .select('ID', 'Title', 'IdProyectoInversion/ID', 'IdProyectoInversion/Title', 'IdTerreno/ID',
                                'IdTerreno/Title', 'IdTerreno/NombredelTerreno2', 'Nivel/ID', 'Nivel/Title', 'IdTarea/ID', 'IdTarea/Title', 'IdTarea/TxtCluster',
                                'IdTarea/TxtVentana', 'IdTarea/Orden', 'IdTarea/Checkable', 'Estatus/ID', 'Estatus/Title', 'GrupoResponsable/ID',
                                'GrupoResponsable/NombreCortoGantt', 'AsignadoA/ID', 'AsignadoA/Name', 'LineaBase', 'UrlDocumentos', 'UrlTarea', 'FechaEstimada' + selectGantt + selectStar)
                            .expand('IdProyectoInversion', 'IdTerreno', 'Nivel', 'IdTarea', 'Estatus', 'GrupoResponsable', 'AsignadoA' + expandGantt + expandStart)
                            .getAll();

                        //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversión
                        idVentanaSeleccionada = this.state.idVentanaAnterior;

=======
    
                        actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                            .filter(filterStar + filterGantt + '(IdProyectoInversionId eq ' + idProyecto + ') or (IdTerrenoId eq ' + idTerreno + ')')
                            .select('ID', 'Title' + selectStar, 'IdProyectoInversion/ID', 'IdProyectoInversion/Title', 'IdTerreno/ID',
                                'IdTerreno/Title', 'Nivel/ID', 'Nivel/Title', 'IdTarea/ID', 'IdTarea/Title', 'IdTarea/TxtCluster',
                                'IdTarea/TxtVentana', 'IdTarea/Orden', 'IdTarea/Checkable', 'Estatus/ID', 'Estatus/Title', 'GrupoResponsable/ID',
                                'GrupoResponsable/NombreCortoGantt', 'AsignadoA/ID', 'AsignadoA/Name', 'LineaBase', 'FechaEstimada' + selectGantt)
                            .expand('IdProyectoInversion', 'IdTerreno', 'Nivel', 'IdTarea', 'Estatus', 'GrupoResponsable', 'AsignadoA' + expandGantt)
                            .getAll();
    
                        //Obtiene todas las actividades del terreno seleccionado a nivel terreno y proyecto de inversiÃ³n
                        idVentanaSeleccionada = this.state.idVentanaAnterior;
    
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                        actividades.sort(function (a, b) {
                            if (a.IdTarea.Orden > b.IdTarea.Orden)
                                return 1;
                            if (a.IdTarea.Orden < b.IdTarea.Orden)
                                return -1;
                            return 0;
                        });
<<<<<<< HEAD

                        var ventanas = [actividades.reduce((a, c) => (a[c.IdTarea.TxtVentana] = (a[c.IdTarea.TxtVentana] || []).concat(c), a), {})];
                        var datosActs = {
                            columnas: [
                                { titulo: '', interN: '', value: '', Tipo: "Act", Arreglo: '', estilo: 'col-sm-4' },
=======
    
                        var ventanas = [actividades.reduce((a, c) => (a[c.IdTarea.TxtVentana] = (a[c.IdTarea.TxtVentana] || []).concat(c), a), {})];
                        var datosActs = {
                            columnas: [
                                { titulo: '', interN: '', value: '', Arreglo: '', estilo: 'col-sm-5' },
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                                { titulo: 'Responsable', interN: 'GrupoResponsable', Tipo: "Act", value: 'NombreCortoGantt', Arreglo: actividades, estilo: 'col-sm-1' },
                                { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                                { titulo: 'Linea base', interN: 'LineaBase', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                                { titulo: 'F. estimada', interN: 'FechaEstimada', value: 'Title', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                                { titulo: 'Estatus', interN: 'Estatus', value: 'Title', Tipo: "Estatus", Arreglo: actividades, estilo: 'col-sm-1' },
<<<<<<< HEAD
                                { titulo: 'Adjunto', interN: 'Adjunto', value: 'Adjunto', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                                { titulo: 'Detalle', interN: 'Detalle', value: 'Detalle', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' },
                                { titulo: 'Favoritos', interN: 'Favoritos', value: 'Favoritos', Tipo: "Act", Arreglo: actividades, estilo: 'col-sm-1' }
                            ],
                            datos: actividades
                        }

=======
                                { titulo: 'Adjunto', interN: 'Adjunto', value: 'Adjunto', Arreglo: actividades, estilo: 'col-sm-1' },
                                { titulo: 'Detalle', interN: 'Detalle', value: 'Detalle', Arreglo: actividades, estilo: 'col-sm-1' }
                            ],
                            datos: actividades
                        }
    
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                        result = Array.from(new Set(datosActs.datos.map(s => s.IdTarea.TxtCluster)))
                            .map(currentCluster => {
                                return {
                                    cluster: datosActs.datos.find(s => s.IdTarea.TxtCluster === currentCluster && (parseFloat(s.IdTarea.Orden) > parseFloat(idVentanaSeleccionada) && parseFloat(s.IdTarea.Orden) < parseFloat(idVentanaSeleccionada + 1)))
                                };
                            });
<<<<<<< HEAD

=======
    
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                        result = result.filter(x => x.cluster !== undefined);
                        if (result.length > 0) {
                            this.setState({
                                idVentana: idVentanaSeleccionada, clustersVentana: result, datosVentana: datosActs, totalAdmin: this.state.totalAdmin,
                                totalNorm: this.state.totalNorm, totalProy: this.state.totalProy, idVentanaAnterior: idVentanaSeleccionada,
                                disabled: false, Star: this.state.Star, Gantt: this.state.Gantt, User: this.state.User, backdrop: { cargado: true, mensaje: '' }
                            });
                        }
                        else {
                            alert("No hay datos que coincidan con los filtros seleccionados. Por favor, intentelo de nuevo")
                        }
                    }
                    break;
                case 8:
                    var dato = this.props.rfs === false ? this.props.IdProyInv : this.props.TerrenoId;
                    window.open("http://con.quierocasa.com.mx:21520/CompraDeTerreno/sitepages/gantt.aspx?Valor=" + dato, "_blank");
                    break;
                default:
                    break;
            }
<<<<<<< HEAD
        }
        else {
            this.setState({ backdrop: { cargado: true, mensaje: '' } });
=======
        }else{
            this.setState({backdrop: { cargado: true, mensaje: '' }});
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
            alert('Se crearon los terrenos nuevos y su estrategia de gestión. Vuelva al menú principal para consultarlos.')
        }
    }

    onCambiarMaco = maco => {
        this.setState({ MACO: maco })
    }

<<<<<<< HEAD
    //Establece el contador de los cambios por clúster por cada una de las tareas modificadas en la E.G.

=======
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
    establecerContador = (contadores, ventana, tipo) => {
        switch (ventana) {
            case "Administración":
                if (tipo === '+') { contadores.admin += 1 }
                else { contadores.admin -= 1 }
                break;
            case "Normativo":
                if (tipo === '+') { contadores.norm += 1 }
                else { contadores.norm -= 1 }
                break;
            case "Proyectos":
                if (tipo === '+') { contadores.proy += 1 }
                else { contadores.proy -= 1 }
                break;
            default:
                break;
        }
    }

    //Establece la fecha seleccionada en el campo de Linea base y Fecha estimada
    onSeleccionarFecha = async (fecha, fila, campo) => {
        const filaIndice = this.state.datosVentana.datos.findIndex(datos => datos.ID === fila.ID)
        let newData = this.state.datosVentana.datos[filaIndice]
        switch (campo) {
            case 'LineaBase':
                await sp.web.lists.getByTitle("Flujo Tareas").items.getById(fila.ID).update({
                    LineaBase: fecha,
                }).then(() => {
                    newData.LineaBase = fecha
                })
                break;
            case 'FechaEstimada':
                await sp.web.lists.getByTitle("Flujo Tareas").items.getById(fila.ID).update({
                    FechaEstimada: fecha,
                }).then(() => {
                    newData.FechaEstimada = fecha
                })
                break;
            default:
                break;
        }

        let datosActualizados = {
            columnas: [
                { titulo: '', interN: '', value: '', Tipo: "Act", Arreglo: '', estilo: 'col-sm-5' },
                { titulo: 'Responsable', interN: 'GrupoResponsable', Tipo: "Act", value: 'NombreCortoGantt', Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "Act", Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                { titulo: 'Linea base', interN: 'LineaBase', value: 'Title', Tipo: "Act", Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                { titulo: 'F. estimada', interN: 'FechaEstimada', value: 'Title', Tipo: "Act", Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                { titulo: 'Estatus', interN: 'Estatus', value: 'Title', Tipo: "Estatus", Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                { titulo: 'Adjunto', interN: 'Adjunto', value: 'Adjunto', Tipo: "Act", Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                { titulo: 'Detalle', interN: 'Detalle', value: 'Detalle', Tipo: "Act", Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' }
            ],
            datos: []
        };
        datosActualizados.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice, 1, newData]] })
        this.setState({ datosVentana: datosActualizados })
    }


    //Almacena temporalmente los items seleccionados o modificados en la E.G.
    onSeleccionarItem = (event, idElemento) => {
        const indice = checkedItems.findIndex((obj => obj.datos.ID === idElemento));
        if (indice !== -1) {
<<<<<<< HEAD
            if (event !== null) { checkedItems[indice].datos.Seleccionado = event.target.checked; }
=======
            if(event!== null)
            { checkedItems[indice].datos.Seleccionado = event.target.checked; }
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
            checkedItems[indice].cambio = true
        }
    }
    
    //Guarda la información capturada en la E.G.
    onSave = async elementos => {
        let contadores = {
            admin: 0,
            norm: 0,
            proy: 0
        }
        elementos.forEach(async elemento => {
            if (elemento.cambio) {
                //Si no tiene ID de elemento asignado, se creará la tarea en Flujo Tareas
                if (elemento.datos.IdFlujoTareasId === null) {
                    this.establecerContador(contadores, elemento.datos.Tarea.TxtVentana, '+')
                    const usuariosAsignados = this.obtenerIdAsignados(elemento.datos.AsignadoA)
                    //Crea la tarea en flujo tareas de la actividad seleccionada
                    await sp.web.lists.getByTitle("Flujo Tareas").items.add({
                        IdProyectoInversionId: elemento.datos.ProyectoInversion.ID,
                        IdTareaId: elemento.datos.Tarea.ID,
                        IdTerrenoId: elemento.datos.Terreno.ID,
<<<<<<< HEAD
                        NivelId: elemento.datos.Terreno.ID === undefined ? 1 : 2,
=======
                        NivelId: elemento.datos.Terreno.ID === undefined ? 1: 2,
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                        GrupoResponsableId: elemento.datos.GrupoResponsable.ID,
                        AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] },
                        EstatusId: 1,
                        Visible: true
<<<<<<< HEAD
                    }).then(async a => {

=======
                    }).then(async a=>{
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                        //Actualiza la información de la actividad seleccionada en la lista de Estrategia de gestión
                        await sp.web.lists.getByTitle("EstrategiaGestion").items.getById(elemento.datos.ID).update({
                            Seleccionado: elemento.datos.Seleccionado,
                            IdFlujoTareasId: a.data.Id,
                            AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] }
<<<<<<< HEAD
                        }).then(u => {
=======
                        }).then(u=>{
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                            //Asigna el ID de elemento generado en flujo tareas al objeto en memoria del item seleccionado
                            //en la vetana de la EG
                            const indice = checkedItems.findIndex((obj => obj.datos.ID === elemento.datos.ID));
                            if (indice !== -1) {
                                checkedItems[indice].datos.IdFlujoTareasId = a.data.Id
                            }
<<<<<<< HEAD
                            this.setState({ totalAdmin: this.state.totalAdmin + contadores.admin, totalNorm: this.state.totalNorm + contadores.norm, totalProy: this.state.totalProy + contadores.proy })
                        });
                    });
                } else {
                    //Si ya tiene ID de elemento asignado, se actualizará la tarea en flujo tareas
=======
                            this.setState({totalAdmin: this.state.totalAdmin + contadores.admin, totalNorm: this.state.totalNorm + contadores.norm, totalProy: this.state.totalProy + contadores.proy})
                        });
                    });
                } else {
                    //Actualiza la tarea en flujo tareas
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                    const usuariosAsignados = this.obtenerIdAsignados(elemento.datos.AsignadoA)
                    this.establecerContador(contadores, elemento.datos.Tarea.TxtVentana, elemento.datos.Seleccionado ? '+' : '-')
                    await sp.web.lists.getByTitle("Flujo Tareas").items.getById(elemento.datos.IdFlujoTareasId).update({
                        AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] },
                        Visible: elemento.datos.Seleccionado
                    }).then(async u => {
                        //Establece como seleccionado en la lista de EG
                        await sp.web.lists.getByTitle("EstrategiaGestion").items.getById(elemento.datos.ID).update({
                            AsignadoAId: elemento.datos.AsignadoA !== undefined ? usuariosAsignados : { results: [] },
                            Seleccionado: elemento.datos.Seleccionado
                        });
                    });
                }
            }
        });
    }
<<<<<<< HEAD


    //#region Métodos de ciclo de vida
    async componentWillMount() {
        { this.styleLinkGen("genericoEG.css", "../estilos/genericoEG.css") }
        let actividades = []
        let datos = []
        let terrenos = []
        webUrl = await sp.web()
        webUrl = webUrl.Url.replace('/CompraDeTerreno', '')
        //Si es terreno(s) original(es)
        if (!this.props.rfs) {
            actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                .filter('(IdProyectoInversionId eq ' + this.props.idProyecto + ')')
                .select('IdTarea/TxtVentana', 'IdTerreno/ID', 'IdTerreno/Title', 'IdTerreno/NombredelTerreno2')
                .expand('IdTarea', 'IdTerreno')
                .get();

            terrenos = [...new Set(actividades.map(x => (x.IdTerreno !== undefined ? x.IdTerreno.Title : '')))]
            //terrenos = terrenos.filter(x => x !== '')

            datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
                .filter('(ProyectoInversionId eq ' + this.props.idProyecto + ')')
                .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Terreno/Title', 'Terreno/NombredelTerreno2', 'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/OrdenEG',
                    'Tarea/Checkable', 'AsignadoA/ID', 'AsignadoA/Title', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId')
                .expand('ProyectoInversion', 'Terreno', 'Tarea', 'AsignadoA', 'GrupoResponsable')
                .orderBy('Tarea/OrdenEG', true)
                .get();
        } else {
            //Si es terreno RFS
            actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
                .filter("(IdProyectoInversionId eq " + this.props.idProyecto + ") and ((IdTerrenoId eq " + this.props.idTerreno + ") or (IdTerrenoId eq null) or (substringof('T-', IdTerreno/Title)))")
                .select('IdTarea/TxtVentana', 'IdTerreno/ID', 'IdTerreno/Title', 'IdTerreno/NombredelTerreno2')
                .expand('IdTarea', 'IdTerreno')
                .getAll();

            terrenos = [...new Set(actividades.map(x => (x.IdTerreno !== undefined ? x.IdTerreno.Title : '')))]
            //terrenos = terrenos.filter(x => x !== '')

            datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
                .filter("(ProyectoInversionId eq " + this.props.idProyecto + ") and ((TerrenoId eq " + this.props.idTerreno + ") or (TerrenoId eq null) or (substringof('T-', TerrenoId/Title)))")
                .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Terreno/Title', 'Terreno/NombredelTerreno2', 'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/OrdenEG',
                    'Tarea/Checkable', 'AsignadoA/ID', 'AsignadoA/Title', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId')
                .expand('ProyectoInversion', 'Terreno', 'Tarea', 'AsignadoA', 'GrupoResponsable')
                .orderBy('Tarea/OrdenEG', true)
                .get();
=======
    
    //#region Métodos de ciclo de vida
    async componentWillMount() {
        let actividades = []
        let datos = []
        let terrenos= []
        //Si es terreno(s) original(es)
        if(!this.props.rfs){
            actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
            .filter('(IdProyectoInversionId eq ' + this.props.idProyecto + ')')
            .select('IdTarea/TxtVentana', 'IdTerreno/ID', 'IdTerreno/Title')
            .expand('IdTarea', 'IdTerreno')
            .get();

            terrenos = [...new Set(actividades.map(x=> (x.IdTerreno !== undefined ? x.IdTerreno.Title : '')))]
            terrenos = terrenos.filter(x => x !== '')
            
            datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
            .filter('(ProyectoInversionId eq ' + this.props.idProyecto + ')')
            .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/OrdenEG',
                    'Tarea/Checkable', 'AsignadoA/ID', 'AsignadoA/Title', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId')
            .expand('ProyectoInversion', 'Terreno', 'Tarea', 'AsignadoA', 'GrupoResponsable')
            .orderBy('Tarea/OrdenEG', true)
            .get();
        }else{
            //Si es terreno RFS
            actividades = await sp.web.lists.getByTitle('Flujo Tareas').items
            .filter("(IdProyectoInversionId eq " + this.props.idProyecto + ") and ((IdTerrenoId eq " + this.props.idTerreno + ") or (IdTerrenoId eq null) or (substringof('T-', IdTerreno/Title)))")
            .select('IdTarea/TxtVentana', 'IdTerreno/ID', 'IdTerreno/Title')
            .expand('IdTarea','IdTerreno')
            .getAll();

            terrenos = [...new Set(actividades.map(x=> (x.IdTerreno !== undefined ? x.IdTerreno.Title : '')))]
            terrenos = terrenos.filter(x => x !== '')

            datos = await sp.web.lists.getByTitle('EstrategiaGestion').items
            .filter("(ProyectoInversionId eq " + this.props.idProyecto + ") and ((TerrenoId eq " + this.props.idTerreno + ") or (TerrenoId eq null) or (substringof('T-', TerrenoId/Title)))")
            .select('ID', 'ProyectoInversion/ID', 'ProyectoInversion/Title', 'Terreno/ID', 'Tarea/ID', 'Tarea/Title', 'Tarea/TxtCluster', 'Tarea/TxtVentana', 'Tarea/OrdenEG',
                    'Tarea/Checkable', 'AsignadoA/ID', 'AsignadoA/Title', 'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'Seleccionado', 'IdFlujoTareasId')
            .expand('ProyectoInversion', 'Terreno', 'Tarea', 'AsignadoA', 'GrupoResponsable')
            .orderBy('Tarea/OrdenEG', true)
            .get();
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
        }

        let datosEG = {
            columnas: [
                { titulo: '', interN: '', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-6' },
                { titulo: 'Responsable', interN: 'GrupoResponsable', value: 'NombreCortoGantt', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-2' },
                { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-2' },
                { titulo: 'E. de G. autorizada', Tipo: "EG", Arreglo: datos, estilo: 'col-sm-2' }
            ],
            datos: []
        };

        let ventanas = [actividades.reduce((a, c) => (a[c.IdTarea.TxtVentana] = (a[c.IdTarea.TxtVentana] || []).concat(c), a), {})];

        datosEG.datos = datos;
        let result = [];
        result = Array.from(new Set(datosEG.datos.map(s => s.Tarea.TxtCluster)))
            .map(currentCluster => {
                return {
                    cluster: datosEG.datos.find(s => s.Tarea.TxtCluster === currentCluster).Tarea
                };
            });

        result = result.filter(x => x.cluster !== undefined);

        this.setState({
            cargado: true, datosVentanaEG: datosEG, datosVentana: this.state.datosVentana.datos, clustersVentana: result, totalAdmin: ventanas[0].Administración.length,
            totalNorm: ventanas[0].Normativo.length, totalProy: ventanas[0].Proyectos.length, idVentanaAnterior: this.state.idVentanaSeleccionada,
            backdrop: { cargado: true, mensaje: '' }, terrenos: terrenos
        });
    }
    //#endregion
<<<<<<< HEAD

=======
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b

    obtenerAsignados = campo => {
        var usuarios = campo.map((registro) => {
            return (registro.Title)
        })
        return usuarios
    }

<<<<<<< HEAD

    obtenerIdAsignados = campo => {
        let val = { results: [] }
        if (campo !== undefined) {
=======
    obtenerIdAsignados = campo => {
        let val = { results: [] }
        if(campo!== undefined){
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
            campo.map((registro) => {
                val.results.push((registro.Id || registro.ID))
            })
        }
        return val
    }

    onActualizarDatos = async arregloDatos => {
<<<<<<< HEAD

=======
        //Si la ventana donde sucede el evento es Estrategia de gstión
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
        if (this.state.idVentana === 4) {
            //Si el evento viene desde un modal que no es tarea
            if (arregloDatos.tarea === 0) {
                const filaEGIndice = this.state.datosVentanaEG.datos.findIndex(datosEG => datosEG.ID === this.state.modal.filaSeleccionada.ID)
                let newData = this.state.datosVentanaEG.datos[filaEGIndice]
<<<<<<< HEAD
                if (newData.IdFlujoTareasId !== null) {
                    this.onSeleccionarItem(null, newData.ID)
=======
                if(newData.IdFlujoTareasId !== null){
                    this.onSeleccionarItem(null,newData.ID)
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                }
                newData.AsignadoA = arregloDatos.dato
                let datosActualizados = {
                    columnas: [
                        { titulo: '', interN: '', Arreglo: "", estilo: 'col-sm-6' },
                        { titulo: 'Responsable', interN: 'GrupoResponsable', value: 'NombreCortoGantt', Tipo: "EG", Arreglo: this.state.datosVentanaEG.datos, estilo: 'col-sm-2' },
                        { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "EG", Arreglo: this.state.datosVentanaEG.datos, estilo: 'col-sm-2' },
                        { titulo: 'E. de G. autorizada', Arreglo: "", estilo: 'col-sm-2' }
                    ],
                    datos: []
                };
                datosActualizados.datos = update(this.state.datosVentanaEG.datos, { $splice: [[filaEGIndice, 1, newData]] })
                this.setState({ datosVentanaEG: datosActualizados })
            } else {
                //Si el evento viene desde un modal que sí­ es tarea
                switch (arregloDatos.tarea) {
                    case 24:
                        //Si se definió RFSN como 'Ninguno' y ya hay MACO definida...
                        if (arregloDatos.dato && this.state.MACO !== null) {
                            //Establece el spinner mientras se generan los datos de la EG
                            this.setState({ backdrop: { cargado: false, mensaje: 'Generando estrategia de gestión. Esto podrí­a tardar unos minutos...' } })

                            const terrenosPI = await sp.web.lists.getByTitle('Terrenos').items.filter('IdProyectoInversionId eq ' + this.state.idProyecto + ' and Empadronamiento eq null').get()
                            const nuevasTareasEG = await sp.web.lists.getByTitle("Tareas").items.filter("((OrdenEG ge 4 and OrdenEG le 5) and (DetonacionInicial eq 0) and (MACO eq 'X' or MACO eq '" + this.state.MACO + "'))").get();

                            const generarEG = async () => {
<<<<<<< HEAD
                                await util.asyncForEach(terrenosPI, async terrenoPI => {
=======
                                await util.asyncForEachasyncForEach(terrenosPI, async terrenoPI => {
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                                    await util.asyncForEach(nuevasTareasEG, async nuevaTarea => {
                                        //Crea el elemento en la estrategia de gestión por cada terreno
                                        await sp.web.lists.getByTitle("EstrategiaGestion").items.add({
                                            ProyectoInversionId: terrenoPI.IdProyectoInversionId,
                                            TerrenoId: terrenoPI.ID,
                                            TareaId: nuevaTarea.ID,
                                            GrupoResponsableId: nuevaTarea.GrupoId,
                                            Seleccionado: false
                                        }).then()
                                            .catch(error => {
                                                console.warn('Error al generar la EG: ' + error)
                                            })
                                    });
                                });
                                //Establece el spinner mientras se cargan los datos generados anteriormente
<<<<<<< HEAD
                                this.onCambiarVentana(4, 'Cargando contenido generado...', "", "", "")
=======
                                this.onCambiarVentana(4, 'Cargando contenido generado...','')
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                            }
                            generarEG();
                        } else {
                            //Establece el spinner mientras para cargar la nueva tarea generada a partir del RFS
<<<<<<< HEAD
                            this.onCambiarVentana(4, 'Cargando contenido generado...', "", "", "")
=======
                            this.onCambiarVentana(4, 'Cargando contenido generado...', '')
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                        }
                        break;
                    case 25:
                    case 30:
                    case 35:
<<<<<<< HEAD
                        if (this.state.MACO !== null) {
                            this.setState({ backdrop: { cargado: false, mensaje: 'Generando estrategia de gestión. Esto podrí­a tardar unos minutos...' } })
                        } else {
                            this.setState({ backdrop: { cargado: false, mensaje: 'Generando los nuevos terrenos. Esto podrí­a tardar unos minutos...' } })
                        }
                        const unionMetrajes = arregloDatos.dato.metrajesTr.map((metraje) => {
=======
                        if(this.state.MACO !== null){
                            this.setState({ backdrop: { cargado: false, mensaje: 'Generando estrategia de gestión. Esto podrí­a tardar unos minutos...' } })
                        }else{
                            this.setState({ backdrop: { cargado: false, mensaje: 'Generando los nuevos terrenos. Esto podrí­a tardar unos minutos...' } })
                        }
                        const unionMetrajes = arregloDatos.dato.metrajesTr.map((metraje) =>{
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                            return metraje.valor
                        }).join(',')

                        const rootweb = await sp.web.getParentWeb()
                        let websCdV = await rootweb.web.webs()
                        let weBdTVersionado = websCdV[0]
                        weBdTVersionado = await sp.site.openWebById(weBdTVersionado.Id)
<<<<<<< HEAD

                        const terrenosVersionadoPI = await weBdTVersionado.web.lists.getByTitle("Terrenos").items
                            .filter("IdPredio/IdPredio eq '" + arregloDatos.dato.tituloPI + "'")
                            .select('ID', 'Title', 'Metraje', 'IdPredio/ID', 'IdPredio/Title', 'IdPredio/IdPredio', 'Calle', 'Colonia', 'CodigoPostal', 'NoExterior', 'Municipio')
                            .expand('IdPredio').orderBy('ID', false).get()

                        //Guarda la información de los terrenos seleccionados en la terea en la lista de RFS
                        await sp.web.lists.getByTitle('RFSN').items.add({
                            IdProyectoInversionId: this.props.idProyecto,
                            FRSN: arregloDatos.dato.tipo === 'TS' ? 'Subdivisión' : (this.tipo === 'TR' ? 'Relotificación' : 'Fusión'),
=======
                        
                        const terrenosVersionadoPI = await weBdTVersionado.web.lists.getByTitle("Terrenos").items
                        .filter("IdPredio/IdPredio eq '" + arregloDatos.dato.tituloPI + "'")
                        .select('ID','Title','Metraje','IdPredio/ID','IdPredio/Title','IdPredio/IdPredio','Calle','Colonia','CodigoPostal','NoExterior','Municipio')
                        .expand('IdPredio').orderBy('ID',false).get()
                        
                        //Guarda la información de los terrenos seleccionados en la terea en la lista de RFS
                        await sp.web.lists.getByTitle('RFSN').items.add({
                            IdProyectoInversionId: this.props.idProyecto,
                            FRSN: arregloDatos.dato.tipo === 'TS' ? 'Subdivisión' : (this.tipo === 'TR' ? 'Relotificación': 'Fusión'),
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                            IdFlujoId: arregloDatos.dato.idFlujoTareas,
                            IdTerrenoId: arregloDatos.dato.terrenos[0].ID,
                            CantidadTerrenos: arregloDatos.dato.cantidadTerrenos,
                            Metrajes: unionMetrajes
                        }).then(async () => {
                            //Establece la tarea como Enviada
                            await sp.web.lists.getByTitle("Flujo Tareas").items.getById(arregloDatos.dato.idFlujoTareas).update({
                                EstatusId: 3
<<<<<<< HEAD
                            }).then(async () => {
                                //Establece el empadronamiento a los terrenos seleccionados en la tarea
                                await sp.web.lists.getByTitle("Terrenos").items.getById(arregloDatos.dato.terrenos[0].ID).update({
                                    Empadronamiento: 'Sí'
                                }).then(async () => {
                                    //Crea los terrenos resultantes en la lista de terrenos de Búsqueda de terreno versionado
                                    await util.asyncForEach(arregloDatos.dato.terrenosResultantes, async (terrenoResultante, index) => {
                                        const maxTerrenos = await weBdTVersionado.web.lists.getByTitle("Terrenos").items.select('ID').top(1).orderBy('ID', false).get()
=======
                            }).then(async ()=>{
                                //Establece el empadronamiento a los terrenos seleccionados en la tarea
                                await sp.web.lists.getByTitle("Terrenos").items.getById(arregloDatos.dato.terrenos[0].ID).update({
                                    Empadronamiento: 'Sí'
                                }).then(async ()=>{
                                    //Crea los terrenos resultantes en la lista de terrenos de Búsqueda de terreno versionado
                                    await util.asyncForEach(arregloDatos.dato.terrenosResultantes, async (terrenoResultante, index) =>{
                                        const maxTerrenos = await weBdTVersionado.web.lists.getByTitle("Terrenos").items.select('ID').top(1).orderBy('ID',false).get()
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                                        const nuevoTerrenoId = arregloDatos.dato.tipo + '-' + util.padLeft(maxTerrenos[0].Id + 1, 5)
                                        await weBdTVersionado.web.lists.getByTitle('Terrenos').items.add({
                                            IdPredioId: terrenosVersionadoPI[0].IdPredio.ID,
                                            Title: nuevoTerrenoId,
                                            Calle: terrenosVersionadoPI[0].Calle,
                                            Colonia: terrenosVersionadoPI[0].Colonia,
                                            CodigoPostal: terrenosVersionadoPI[0].CodigoPostal,
                                            NoExterior: terrenosVersionadoPI[0].NoExterior,
                                            Municipio: terrenosVersionadoPI[0].Municipio,
                                            Metraje: arregloDatos.dato.metrajesTr[index].valor
<<<<<<< HEAD
                                        }).then(async () => {
=======
                                        }).then(async ()=>{
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                                            //Crea los terrenos resultantes en la lista de terrenos de Compra de terreno
                                            await sp.web.lists.getByTitle('Terrenos').items.add({
                                                IdProyectoInversionId: this.props.idProyecto,
                                                Title: nuevoTerrenoId,
                                                NombredelTerreno: 'Subdivisión',
                                                NombredelTerreno2: 'Subdivisión',
                                                MACO: terrenoResultante.MACO,
                                                Calle: terrenosVersionadoPI[0].Calle,
                                                Colonia: terrenosVersionadoPI[0].Colonia,
                                                CodigoPostal: terrenosVersionadoPI[0].CodigoPostal,
                                                NoExterior: terrenosVersionadoPI[0].NoExterior,
                                                Delegacion: terrenosVersionadoPI[0].Municipio,
                                                Metraje: arregloDatos.dato.metrajesTr[index].valor
<<<<<<< HEAD

                                            }).then(async (terr) => {
                                                /*Si ya se cargó la MACO, generará la estrategia de gestión para cada uno de los
                                                terrenos resultantes*/
                                                if (this.state.MACO !== null) {
                                                    //const nuevasTareasEG = await sp.web.lists.getByTitle("Tareas").items.filter("((OrdenEG ge 4 and OrdenEG le 5) and (DetonacionInicial eq 0) and (MACO eq 'X' or MACO eq '" + terrenoResultante.MACO + "' or MACO eq '" + arregloDatos.dato.tipo + "'))").get();
                                                    const nuevasTareasEG = await sp.web.lists.getByTitle("Tareas").items.filter("((OrdenEG ge 4 and OrdenEG le 5) and (DetonacionInicial eq 0) and (MACO eq '" + arregloDatos.dato.tipo + "'))").get();

                                                    const generarEG = async () => {
                                                        await util.asyncForEach(nuevasTareasEG, async nuevaTarea => {
                                                            let tareaEG = 0
                                                            if (nuevaTarea.MACO === arregloDatos.dato.tipo) {
=======
                                            }).then(async (terr)=>{
                                                /*Si ya se cargó la MACO, generará la estrategia de gestión para cada uno de los
                                                terrenos resultantes*/
                                                if(this.state.MACO !== null){
                                                    //const nuevasTareasEG = await sp.web.lists.getByTitle("Tareas").items.filter("((OrdenEG ge 4 and OrdenEG le 5) and (DetonacionInicial eq 0) and (MACO eq 'X' or MACO eq '" + terrenoResultante.MACO + "' or MACO eq '" + arregloDatos.dato.tipo + "'))").get();
                                                    const nuevasTareasEG = await sp.web.lists.getByTitle("Tareas").items.filter("((OrdenEG ge 4 and OrdenEG le 5) and (DetonacionInicial eq 0) and (MACO eq '" + arregloDatos.dato.tipo + "'))").get();
    
                                                    const generarEG = async () => {
                                                        await util.asyncForEach(nuevasTareasEG, async nuevaTarea => {
                                                            let tareaEG=0
                                                            if(nuevaTarea.MACO === arregloDatos.dato.tipo){
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                                                                //Crea el elemento en la lista de Flujo Tareas 
                                                                tareaEG = await sp.web.lists.getByTitle("Flujo Tareas").items.add({
                                                                    IdProyectoInversionId: this.props.idProyecto,
                                                                    IdTareaId: nuevaTarea.ID,
                                                                    NivelId: 2,
                                                                    IdTerrenoId: terr.data.Id,
                                                                    GrupoResponsableId: nuevaTarea.GrupoId,
                                                                    EstatusId: 1,
                                                                    Visible: true
                                                                })
<<<<<<< HEAD
                                                                    .then()
                                                                    .catch(error => {
                                                                        console.warn('Error al generar la tarea de EG en flujo tareas: ' + error)
                                                                    })
=======
                                                                .then()
                                                                .catch(error => {
                                                                    console.warn('Error al generar la tarea de EG en flujo tareas: ' + error)
                                                                })
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                                                            }
                                                            //Crea el elemento en la estrategia de gestión del terreno resultante actual
                                                            await sp.web.lists.getByTitle("EstrategiaGestion").items.add({
                                                                ProyectoInversionId: this.props.idProyecto,
                                                                TerrenoId: terr.data.Id,
                                                                TareaId: nuevaTarea.ID,
                                                                GrupoResponsableId: nuevaTarea.GrupoId,
                                                                Seleccionado: false,
                                                                IdFlujoTareasId: tareaEG.data.ID
                                                            })
<<<<<<< HEAD
                                                                .then()
                                                                .catch(error => {
                                                                    console.warn('Error al generar la EG: ' + error)
                                                                })
                                                        });
                                                        this.onCambiarVentana(4, 'Cargando contenido generado...', "", "", arregloDatos.dato.tipo)
                                                    }
                                                    generarEG();
                                                }
=======
                                                            .then()
                                                            .catch(error => {
                                                                console.warn('Error al generar la EG: ' + error)
                                                            })
                                                        });
                                                        this.onCambiarVentana(4, 'Cargando contenido generado...', arregloDatos.dato.tipo)
                                                    }
                                                    generarEG();
                                                }                                            
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                                            }).catch(error => {
                                                console.warn('Error al crear el terreno resultante: ' + error)
                                            })
                                        }).catch(error => {
                                            console.warn('Error al guardar en Terrenos versionado: ' + error)
                                        })
                                    });
                                }).catch(error => {
                                    console.warn('Error al establecer el empadronamiento en Terrenos: ' + error)
                                })
                            }).catch(error => {
                                console.warn('Error al guardar en Flujo Tareas: ' + error)
                            })
                        }).catch(error => {
                            console.warn('Error al guardar en RFS: ' + error)
                        })
                        break;
                    default:
                        break;
                }
            }
        } else {
            //Si la ventana donde sucede el evento es Normativo, Proyectos o Administración
            const filaIndice = this.state.datosVentana.datos.findIndex(datos => datos.ID === this.state.modal.filaSeleccionada.ID)
            let newData = this.state.datosVentana.datos[filaIndice]
            newData.AsignadoA = arregloDatos.dato
            let datosActualizados = {
                columnas: [
                    { titulo: '', interN: '', value: '', Tipo: "Act", Arreglo: '', estilo: 'col-sm-4' },
                    { titulo: 'Responsable', interN: 'GrupoResponsable', Tipo: "Act", value: 'NombreCortoGantt', Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                    { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "Act", Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                    { titulo: 'Linea base', interN: 'LineaBase', value: 'Title', Tipo: "Act", Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                    { titulo: 'F. estimada', interN: 'FechaEstimada', value: 'Title', Tipo: "Act", Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                    { titulo: 'Estatus', interN: 'Estatus', value: 'Title', Tipo: "Estatus", Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                    { titulo: 'Adjunto', interN: 'Adjunto', value: 'Adjunto', Tipo: "Act", Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                    { titulo: 'Detalle', interN: 'Detalle', value: 'Detalle', Tipo: "Act", Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' },
                    { titulo: 'Favoritos', interN: 'Favoritos', Tipo: "Act", value: 'Favoritos', Arreglo: this.state.datosVentana.datos, estilo: 'col-sm-1' }
                ],
                datos: []
            };
            datosActualizados.datos = update(this.state.datosVentana.datos, { $splice: [[filaIndice, 1, newData]] })
            this.setState({ datosVentana: datosActualizados })
        }
    }

    styleLinkGen = (fileName, url) => {

        var css = ["genericoAdmin.css", "genericoNorm.css", "genericoProy.css", "genericoEG.css"];

        for (let index = 0; index < css.length; index++) {
            { this.removejscssfile(fileName, "css") }
        }

        var sheet = document.createElement('link');
        sheet.rel = 'stylesheet';
        sheet.href = url;
        sheet.type = 'text/css';
        document.head.appendChild(sheet);
    }

    removejscssfile = (filename, filetype) => {
        var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "link" : "none" //determine element type to create nodelist from
        var targetattr = (filetype == "js") ? "src" : (filetype == "css") ? "href" : "none" //determine corresponding attribute to test for
        var allsuspects = document.getElementsByTagName(targetelement)
        for (var i = allsuspects.length; i >= 0; i--) { //search backwards within nodelist for matching elements to remove
            if (allsuspects[i] && allsuspects[i].getAttribute(targetattr) != null && allsuspects[i].getAttribute(targetattr).indexOf(filename) != -1)
                allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
        }
    }

    spDate = (value) => {
        var date = value.slice(0, 10);
        if (date.substring(4, 5) === '-') {
            var separate = date.split('-');
            var newDate = separate[2] + "/" + separate[1] + "/" + separate[0];
        }
        return newDate;
    }

    render() {
        const Cluster = (props) => {
            if (props.titulos.length > 0) {

                if (props.idVentana !== 4) {
                    //Otras ventanas
                    const filaCluster = props.titulos.map((fila) => {
                        return (
                            <div key={fila.cluster.IdTarea.Orden} className='col-sm-12'>
                                <div className='titulo'>
                                    <p>
                                        <img id='expandir' src={arrow_down_icon} alt='arrow_down_icon'></img>
                                        {fila.cluster.IdTarea.TxtCluster}
                                    </p>
                                </div>
<<<<<<< HEAD
                                {this.state.terrenos.map((terr) => {
                                    return (
                                        <div key={terr} className='col-sm-12'>
                                            <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.IdTarea.Orden} />
=======
                                {this.state.terrenos.map((terr) =>{
                                    return(
                                        <div className='col-sm-12'>
                                            <div className='terreno'>{terr}</div>
                                            <Body datos={props.datos} idCluster={fila.cluster.IdTarea.Orden} />
                                            <div className='row item-personal col-sm-12' onDoubleClick={() => { this.onAbrirModal(this.props.terreno, 271, false, null, null, {Tarea:{ID:271}}, this.state.idVentana) }}>Agregar nueva actividad personal</div>
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                                        </div>
                                    )
                                })}
                                <div className='row empty-space'></div>
                            </div>
                        )
                    });
                    return <div key={0} className="row">{filaCluster}</div>
                } else {
                    //Ventana de estrategia de gestión
                    const filaCluster = props.titulos.map((fila) => {
                        return (
                            <div key={fila.cluster.OrdenEG} className='col-sm-12'>
                                <div className='titulo'>
                                    <p>
                                        {fila.cluster.Checkable === '1' ? <input type='checkbox' className='checkBox' ></input> : null}
                                        <img id='expandir' src={arrow_down_icon} alt='arrow_down_icon'></img>
                                        {fila.cluster.TxtCluster}
                                    </p>
                                </div>
<<<<<<< HEAD
                                {this.state.terrenos.map((terr) => {
                                    return (
                                        <div key={terr} className='col-sm-12'>
                                            <Body tituloTerreno={terr} datos={props.datos} idCluster={fila.cluster.OrdenEG} esCheckable={fila.cluster.Checkable} />
=======
                                {this.state.terrenos.map((terr) =>{
                                    return(
                                        <div className='col-sm-12'>
                                            <div className='terreno'>{terr}</div>
                                            <Body datos={props.datos} idCluster={fila.cluster.OrdenEG} esCheckable={fila.cluster.Checkable} />
                                            <div className='row item-personal col-sm-12' onDoubleClick={() => { this.onAbrirModal(this.props.terreno, 271, false, null, null, {Tarea:{ID:271}}, this.state.idVentana) }}>Agregar nueva actividad personal</div>
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                                        </div>
                                    )
                                })}
                                <div className='row empty-space' ></div>
                            </div>
                        )
                    });
<<<<<<< HEAD

=======
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                    return <div key={0} className="row justify-content-end">{filaCluster}<input type='button' value='OK' className='btn btn-primary' onClick={() => this.onSave(checkedItems)} /></div>
                }
            } else {
                return null
            }
        }

        const Columna = (props) => {
            //Si abre el modal cuando se da doble clic
            if (props.editable) {
                return (
                    <div className={props.estilo} onDoubleClick={() => { this.onAbrirModal(props.terreno, props.idElemento, props.esTarea, null, null, props.datos, this.state.idVentana) }} >{props.titulo}</div>
                );
            } else {
                return (
                    <div className={props.estilo} >{props.titulo}</div>
                );
            }
        }

        const Header = (props) => {
            const classes = useStyles();
            const filaHeader = props.datosVentana.map((fila, index) => {
                switch (fila.titulo) {
                    case "":
                    case "Adjunto":
                    case "Detalle":
                    case "Favoritos":
                        if (fila.titulo === "Favoritos") {
                            return (
                                <div key={index} className={fila.estilo} >
                                    <p style={{ marginTop: "30px", textAlign: "center" }}>
                                    </p>
                                </div>
                            )
                        }
                        else {
                            return (
                                <div key={index} className={fila.estilo} >
                                    <p style={{ marginTop: "30px", textAlign: "center" }}>
                                        {fila.titulo}
                                    </p>
                                </div>
                            )
                        }
                    case 'E. de G. autorizada':
                        return (
                            <div key={index} className={fila.estilo} >
                                <p style={{ marginTop: "30px", textAlign: "right" }}>
<<<<<<< HEAD
                                    <img style={{ marginRight: "5px" }} id='CargaEG' src={egupload_icon} alt='egupload_icon' onClick={() => { this.onAbrirModal(this.props.terreno, 269, false, null, null, { Tarea: { ID: 269 } }) }}></img>
=======
                                    <img style={{ marginRight: "5px" }} id='CargaEG' src={egupload_icon} alt='egupload_icon' onClick={() => { this.onAbrirModal(this.props.terreno, 269, false, null, null, {Tarea:{ID:269}}, 4) }}></img>
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                                    {fila.titulo}
                                </p>
                            </div>
                        )
                    case 'Asignado a':
                        const uniqueTagsA = [];
                        fila.Arreglo.sort((a, b) => a.AsignadoA - b.AsignadoA).sort((a, b) => a.Title - b.Title);
                        return (
                            <div key={index} className={fila.estilo}>Asignado a
                                {/*<FormControl className={classes.formControl}>
                                    <InputLabel id={"lbl" + fila.interN}>{fila.titulo}</InputLabel>
                                    <Select key={index} labelId="lblAsignado" id={"cmb" + fila.interN} name={fila.titulo + "|" + fila.Tipo} onChange={this.onHandleChange}>
                                        {fila.Arreglo.sort().map((element, index) => (
                                            element[fila.interN] !== undefined ?
                                                uniqueTagsA.indexOf(element[fila.interN][index][fila.value]) === -1 ?
                                                    <MenuItem key={element[fila.interN][index]["ID"]} value={element[fila.interN][index]["ID"]}>
                                                        <InputLabel style={{ display: "none" }} id="label">{uniqueTagsA.push(element[fila.interN][fila.value])}</InputLabel>
                                                        <InputLabel id={"lbl" + fila.interN}> {element[fila.interN][index][fila.value]}</InputLabel>
                                                    </MenuItem>
                                                    : null
                                                : null
                                        ))}
                                    </Select>
                                </FormControl>*/}
                            </div>
                        )
                    case 'Responsable':
                    case 'Estatus':
                        const uniqueTagsE = [];
                        return (
                            <div key={index} className={fila.estilo}>
                                <FormControl className={classes.formControl}>
                                    <InputLabel id={"lbl" + fila.interN}>{fila.titulo}</InputLabel>
                                    <Select key={index} labelId={"lbl" + fila.interN} id={"cmb" + fila.interN} name={fila.titulo + "|" + fila.Tipo} onChange={this.onHandleChange}>
                                        {fila.Arreglo.map(element => (
                                            element[fila.interN] != null ?
                                                uniqueTagsE.indexOf(element[fila.interN][fila.value]) === -1 ?
                                                    <MenuItem key={element[fila.interN]["ID"]} value={element[fila.interN]["ID"]}>
                                                        <InputLabel style={{ display: "none" }} id="label">{uniqueTagsE.push(element[fila.interN][fila.value])}</InputLabel>
                                                        <InputLabel id={"lbl" + fila.interN}>{element[fila.interN][fila.value]}</InputLabel>
                                                    </MenuItem>
                                                    : null
                                                : null
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        )
                    default:
                        const uniqueTagsAll = [];
                        return (
                            <div key={index} className={fila.estilo}>
                                <FormControl className={classes.formControl}>
                                    <InputLabel id={"lbl" + fila.interN}>{fila.titulo}</InputLabel>
                                    <Select key={index} labelId={"lbl" + fila.interN} id={"cmb" + fila.interN} name={fila.titulo + "|" + fila.Tipo} onChange={this.onHandleChange}>
                                        {fila.Arreglo.map(element => (
                                            element[fila.interN] != null ?
                                                uniqueTagsAll.indexOf(element[fila.interN]) === -1 ?
                                                    <MenuItem key={element["ID"]} value={element[fila.interN]}>
                                                        <InputLabel style={{ display: "none" }} id="label">{uniqueTagsAll.push(element[fila.interN])}</InputLabel>
                                                        <InputLabel id={"lbl" + fila.interN}>{this.spDate(element[fila.interN])}</InputLabel>
                                                    </MenuItem>
                                                    : null
                                                : null
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        )
                }
            });

            return (
                <div key={0} className="row">
                    <table className="myTable"  >
                        <td style={{ paddingTop: "10px", backgroundColor: "white" }}>
                            <tr>
                                {<input style={{ visibility: "hidden" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>}
                            </tr>
                        </td>
                        <td style={{ width: "100%" }}>
                            <div className="row">
                                {filaHeader}
                            </div>
                        </td>
                    </table>
                </div >
            )
        }

        const Body = (props) => {
            if (props.idCluster >= 4) {
                //Estrategia de gestión
<<<<<<< HEAD
                let nombreTerreno = ''
                let filaBody = props.datos.map((fila) => {
                    if (fila.Terreno !== undefined) {
                        if (fila.Terreno.Title === props.tituloTerreno) {
                            nombreTerreno = fila.Terreno.NombredelTerreno2
                            if (fila.Tarea.OrdenEG === props.idCluster) {
                                if (props.esCheckable) {
                                    //Agrega al arreglo los datos de la fila que tiene un check
                                    checkedItems = checkedItems.concat({ datos: fila, cambio: false })
                                }
                                return (
                                    <div key={fila.ID} className="row item">
                                        {props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? <input type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e) => this.onSeleccionarItem(e, fila.ID)} ></input> : <input style={{ visibility: "hidden" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>}
                                        <Columna titulo={fila.Tarea.ID + ':' + fila.Tarea.Title} estilo='col-sm-6' editable={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? false : true} idElemento={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? fila.Tarea.ID : fila.IdFlujoTareasId} esTarea={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? false : true} terreno={this.props.terreno} datos={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? null : fila} />
                                        <Columna titulo={fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                                        <Columna titulo={<p style={{ textAlign: "center" }}><img title={fila.AsignadoA === undefined ? 'Sin asignar' : (fila.AsignadoA.length > 0 ? this.obtenerAsignados(fila.AsignadoA) : 'Sin asignar')} src={fila.AsignadoA === undefined ? plus_icon : (fila.AsignadoA.length > 0 ? assignedTo_icon : plus_icon)} alt='assignedTo_icon' onClick={() => { this.onAbrirModal(this.props.terreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila, 4) }} /></p>} estilo='col-sm-3' editable={false} />
                                        <Columna estilo='col-sm-2' />
                                    </div>
                                )
                            } else {
                                return null
                            }
                        }
=======
                const filaBody = props.datos.map((fila) => {
                    if (fila.Tarea.OrdenEG === props.idCluster) {
                        if (props.esCheckable) {
                            //Agrega al arreglo los datos de la fila que tiene un check
                            checkedItems = checkedItems.concat({ datos: fila, cambio: false })
                        }
                        return (
                            <div key={fila.ID} className="row item">
                                {props.esCheckable === '1'  || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? <input type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e) => this.onSeleccionarItem(e, fila.ID)} ></input> : <input style={{ visibility: "hidden" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>}
                                <Columna titulo={fila.Tarea.Title} estilo='col-sm-6' editable={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? false : true} idElemento={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? fila.Tarea.ID : fila.IdFlujoTareasId} esTarea={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? false : true} terreno={this.props.terreno} datos={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? null : fila} />
                                <Columna titulo={fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                                <Columna titulo={<p style={{ textAlign: "center" }}><img title={fila.AsignadoA === undefined ? 'Sin asignar' : (fila.AsignadoA.length>0 ? this.obtenerAsignados(fila.AsignadoA) : 'Sin asignar') } src={fila.AsignadoA === undefined ? plus_icon : (fila.AsignadoA.length>0 ? assignedTo_icon : plus_icon) } alt='assignedTo_icon' onClick={() => { this.onAbrirModal(this.props.terreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila, 4) }} /></p>} estilo='col-sm-3' editable={false} />
                                <Columna estilo='col-sm-2' />
                            </div>
                        )
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                    } else {
                        if (props.tituloTerreno === '') {
                            if (fila.Tarea.OrdenEG === props.idCluster) {
                                if (props.esCheckable) {
                                    //Agrega al arreglo los datos de la fila que tiene un check
                                    checkedItems = checkedItems.concat({ datos: fila, cambio: false })
                                }
                                return (
                                    <div key={fila.ID} className="row item">
                                        {props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? <input type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e) => this.onSeleccionarItem(e, fila.ID)} ></input> : <input style={{ visibility: "hidden" }} type='checkbox' name="Hidden" className='checkBox-sm' ></input>}
                                        <Columna titulo={fila.Tarea.ID + ':' + fila.Tarea.Title} estilo='col-sm-6' editable={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? false : true} idElemento={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? fila.Tarea.ID : fila.IdFlujoTareasId} esTarea={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? false : true} terreno={this.props.terreno} datos={props.esCheckable === '1' || (fila.Tarea.ID !== 24 && fila.Tarea.ID !== 25 && fila.Tarea.ID !== 30 && fila.Tarea.ID !== 35) ? null : fila} />
                                        <Columna titulo={fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                                        <Columna titulo={<p style={{ textAlign: "center" }}><img title={fila.AsignadoA === undefined ? 'Sin asignar' : (fila.AsignadoA.length > 0 ? this.obtenerAsignados(fila.AsignadoA) : 'Sin asignar')} src={fila.AsignadoA === undefined ? plus_icon : (fila.AsignadoA.length > 0 ? assignedTo_icon : plus_icon)} alt='assignedTo_icon' onClick={() => { this.onAbrirModal(this.props.terreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila, 4) }} /></p>} estilo='col-sm-3' editable={false} />
                                        <Columna estilo='col-sm-2' />
                                    </div>
                                )
                            } else {
                                return null
                            }
                        }
                    }
                });
                filaBody = filaBody.filter(x => x !== undefined && x !== null);
                return filaBody.length > 0 ?
                    (props.tituloTerreno !== '' ?
                        <div><div className='terreno'>{props.tituloTerreno + ': ' + nombreTerreno}</div> {filaBody} <div className='row item-personal col-sm-12' onDoubleClick={() => { this.onAbrirModal(this.props.terreno, 271, false, null, null, { Tarea: { ID: 271 } }, this.state.idVentana) }}>Agregar nueva actividad personal</div></div>
                        : <div> {filaBody} <div className='row item-personal col-sm-12' onDoubleClick={() => { this.onAbrirModal(this.props.terreno, 271, false, null, null, { Tarea: { ID: 271 } }, this.state.idVentana) }}>Agregar nueva actividad personal</div></div>
                    ) : null

            } else {
                //Otras ventanas
<<<<<<< HEAD
                let nombreTerreno = ''
                let filaBody = props.datos.map((fila) => {
                    let urlLink = fila.UrlDocumentos.substring(fila.UrlDocumentos.indexOf('<a'));
                    urlLink = urlLink.replace('<a href="', '').replace(' target="_blank">Ver Documentos</a><a></a></div>', '').replace('"', '').replace(' target="_blank">Ver Documentos', '').replace('"', '')
                    const parseResultDocto = new DOMParser().parseFromString(urlLink, "text/html");
                    const parsedUrlDocto = parseResultDocto.documentElement.textContent;

                    let urlTarea = fila.UrlTarea.substring(fila.UrlTarea.indexOf('<a'));
                    urlTarea = urlTarea.replace('<a href="', '').replace(' target="_blank">Ver Tarea</a><a></a></div>', '').replace('"', '').replace(' target="_blank">Ver Documentos', '').replace('"', '')
                    const parseResult = new DOMParser().parseFromString(urlTarea, "text/html");
                    const parsedUrl = parseResult.documentElement.textContent;

                    if (fila.IdTerreno !== undefined) {
                        if (fila.IdTerreno.Title === props.tituloTerreno) {
                            nombreTerreno = fila.IdTerreno !== undefined ? fila.IdTerreno.NombredelTerreno2 : ''

                            if (fila.IdTarea.Orden === props.idCluster) {
                                return (
                                    <div key={fila.ID} className="row item">
                                        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={es}>
                                            <Columna titulo={fila.IdTarea.ID + ':' + fila.IdTarea.Title} estilo='col-sm-5' editable={true} idElemento={fila.ID} esTarea={true} terreno={this.props.terreno} datos={fila} />
                                            <Columna titulo={fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                                            <Columna titulo={<p style={{ textAlign: "center" }}><img title={fila.AsignadoA === undefined ? 'Sin asignar' : (fila.AsignadoA.length > 0 ? this.obtenerAsignados(fila.AsignadoA) : 'Sin asignar')} src={fila.AsignadoA === undefined ? plus_icon : (fila.AsignadoA.length > 0 ? assignedTo_icon : plus_icon)} alt='assignedTo_icon' onClick={() => { this.onAbrirModal(this.props.terreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila, this.state.idVentana) }} /></p>} estilo='col-sm' editable={false} />
                                            {/*<Columna titulo={<DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={fila.LineaBase !=} onChange={fecha => this.onSeleccionarFecha(fecha, fila, 'LineaBase')} />} estilo='col-sm-1' editable={false} />
                                            <Columna titulo={<DatePicker variant='dialog' format="dd/MM/yyyy" cancelLabel='Cancelar' okLabel='Aceptar' value={fila.FechaEstimada} onChange={fecha => this.onSeleccionarFecha(fecha, fila, 'FechaEstimada')} />} estilo='col-sm-1' editable={false} />*/}
                                            <Columna titulo={fila.LineaBase} estilo='col-sm-1' editable={false} />
                                            <Columna titulo={fila.FechaEstimada} estilo='col-sm-1' editable={false} />
                                            <Columna titulo={<span class={fila.Estatus.Title.toLowerCase() + ' badge badge-pill'}>{fila.Estatus.Title}</span>} estilo='col-sm-1' editable={false} />
                                            <Columna titulo={<p style={{ textAlign: "center" }}><img src={attach_icon} alt='attach_icon' onClick={() => window.open(webUrl + parsedUrlDocto)} /></p>} estilo='col-sm-1' editable={false} />
                                            <Columna titulo={<p style={{ textAlign: "center" }}><img src={more_details_icon} alt='more_details_icon' onClick={() => { this.onAbrirModal(this.props.terreno, 272, false, null, null, {Tarea:{ID:272}}, this.state.idVentana) }} /></p>} estilo='col-sm-1' editable={false} />
                                        </MuiPickersUtilsProvider>
                                    </div>
                                )
                            } else {
                                return null
                            }
                        }
=======
                const filaBody = props.datos.map((fila) => {
                    if (fila.IdTarea.Orden === props.idCluster) {
                        return (
                            <div key={fila.ID} className="row item">
                                <Columna titulo={fila.IdTarea.Title} estilo='col-sm-5' editable={true} idElemento={fila.ID} esTarea={true} terreno={this.props.terreno} datos={fila} />
                                <Columna titulo={fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                                <Columna titulo={<p style={{ textAlign: "center" }}><img title={fila.AsignadoA === undefined ? 'Sin asignar' : (fila.AsignadoA.length>0 ? this.obtenerAsignados(fila.AsignadoA) : 'Sin asignar') } src={fila.AsignadoA === undefined ? plus_icon : (fila.AsignadoA.length>0 ? assignedTo_icon : plus_icon) } alt='assignedTo_icon' onClick={() => { this.onAbrirModal(this.props.terreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila, this.state.idVentana) }} /></p>} estilo='col-sm' editable={false} />
                                <Columna titulo={fila.LineaBase !== null ? fila.LineaBase : <p style={{ textAlign: "center" }}><img title='Agregar' src={plus_icon} alt='plus_icon' /></p>} estilo='col-sm-1' editable={false} />
                                <Columna titulo={fila.FechaEstimada !== null ? fila.FechaEstimada : <p style={{ textAlign: "center" }}><img title='Agregar' src={plus_icon} alt='plus_icon' /></p>} estilo='col-sm-1' editable={true} />
                                <Columna titulo={fila.Estatus.Title} estilo='col-sm-1' editable={false} />
                                <Columna titulo={<p style={{ textAlign: "center" }}><img src={attach_icon} alt='attach_icon' /></p>} estilo='col-sm-1' editable={false} />
                                <Columna titulo={<p style={{ textAlign: "center" }}><img src={more_details_icon} alt='more_details_icon' onClick={() => { this.onAbrirModal(this.props.terreno, 270, false, null, null, null, this.state.idVentana) }} /></p>} estilo='col-sm-1' editable={false} />
                            </div>
                        )
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
                    } else {
                        if (props.tituloTerreno === '') {
                            if (fila.IdTarea.Orden === props.idCluster) {
                                return (
                                    <div key={fila.ID} className="row item">
                                        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={es}>
                                            <Columna titulo={fila.IdTarea.ID + ':' + fila.IdTarea.Title} estilo='col-sm-5' editable={true} idElemento={fila.ID} esTarea={true} terreno={this.props.terreno} datos={fila} />
                                            <Columna titulo={fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                                            <Columna titulo={<p style={{ textAlign: "center" }}><img title={fila.AsignadoA === undefined ? 'Sin asignar' : (fila.AsignadoA.length > 0 ? this.obtenerAsignados(fila.AsignadoA) : 'Sin asignar')} src={fila.AsignadoA === undefined ? plus_icon : (fila.AsignadoA.length > 0 ? assignedTo_icon : plus_icon)} alt='assignedTo_icon' onClick={() => { this.onAbrirModal(this.props.terreno, 270, false, 'AsignadoA', fila.AsignadoA !== undefined ? fila.AsignadoA : [], fila, this.state.idVentana) }} /></p>} estilo='col-sm' editable={false} />
                                            <Columna titulo={fila.LineaBase} estilo='col-sm-1' editable={false} />
                                            <Columna titulo={fila.FechaEstimada} estilo='col-sm-1' editable={false} />
                                            <Columna titulo={<span class={fila.Estatus.Title.toLowerCase() + ' badge badge-pill'}>{fila.Estatus.Title}</span>} estilo='col-sm-1' editable={false} />
                                            <Columna titulo={<p style={{ textAlign: "center" }}><img src={attach_icon} alt='attach_icon' onClick={() => window.open(webUrl + parsedUrlDocto)} /></p>} estilo='col-sm-1' editable={false} />
                                            <Columna titulo={<p style={{ textAlign: "center" }}><img src={more_details_icon} alt='more_details_icon' onClick={() => { this.onAbrirModal(this.props.terreno, 272, false, null, null, {Tarea:{ID:272}}, this.state.idVentana) }} /></p>} estilo='col-sm-1' editable={false} />
                                        </MuiPickersUtilsProvider>

                                    </div>
                                )
                            } else {
                                return null
                            }
                        }
                    }
                });
                filaBody = filaBody.filter(x => x !== undefined && x !== null);
                return filaBody.length > 0 ?
                    (props.tituloTerreno !== '' ?
                        <div><div className='terreno'>{props.tituloTerreno + ': ' + nombreTerreno}</div> {filaBody} <div className='row item-personal col-sm-12' onDoubleClick={() => { this.onAbrirModal(this.props.terreno, 271, false, null, null, { Tarea: { ID: 271 } }, this.state.idVentana) }}>Agregar nueva actividad personal</div></div>
                        : <div> {filaBody} <div className='row item-personal col-sm-12' onDoubleClick={() => { this.onAbrirModal(this.props.terreno, 271, false, null, null, { Tarea: { ID: 271 } }, this.state.idVentana) }}>Agregar nueva actividad personal</div></div>
                    ) : null
            }
        }
        const { idVentana, totalAdmin, totalNorm, totalProy, MACO } = this.state

        return (
            <div>
                <div className='col-sm-12'>
                    <Backdrop abierto={!this.state.backdrop.cargado} mensaje={this.state.backdrop.mensaje} />
                    <Encabezado rfs={this.props.rfs} idPITerr={!this.props.rfs ? this.props.idProyecto : this.props.idTerreno} terreno={this.props.terreno}
                        maco={MACO} idVentana={this.state.idVentana} disabled={this.state.disabled} cambiarVentana={this.onCambiarVentana} totalAdmin={totalAdmin}
                        totalNorm={totalNorm} totalProy={totalProy} cambioMaco={this.onCambiarMaco} />

                    {this.state.cargado ?
                        <div className='container-fluid'>
                            <Header datosVentana={idVentana === 4 ? this.state.datosVentanaEG.columnas : this.state.datosVentana.columnas} />
                            <Cluster titulos={this.state.clustersVentana} idVentana={idVentana} datos={idVentana === 4 ? this.state.datosVentanaEG.datos : this.state.datosVentana.datos} />
                            {this.state.modal.abierto ? <Modal abrir={this.state.modal} cerrar={this.onCerrarModal} evento={this.onActualizarDatos} datos={this.state.datos} /> : null}
                        </div>
                        : null
                    }
                </div>
            </div>
        );
    }
}


export default Generico;