import favoritos_icon from '../imagenes/favoritos_icon.png';
import favoritos_icon_clicked from '../imagenes/favoritos_icon_clicked.png';
import { sp } from "@pnp/sp";
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import moment from 'moment';

const currentWeb = Web(window.location.protocol + '//' + window.location.host + "/CompraDeTerreno/");

const util = {
    //Inicializa el arreglo de datos de actividades
    inicializarArregloDatos: function (idVentana, arreglo) {
        return idVentana === 4 ? {
            columnas: [
                { titulo: '', interN: '', Arreglo: "", estilo: 'col-sm-5' },
                { titulo: 'Responsable', interN: 'GrupoResponsable', value: 'NombreCortoGantt', Tipo: "EG", Arreglo: arreglo, estilo: 'col-sm-2' },
                { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "EG", Arreglo: arreglo, estilo: 'col-sm-2' },
                { titulo: 'E. de G. autorizada', Arreglo: "", estilo: 'col-sm-2' },
                { titulo: 'Favoritos', interN: 'Favoritos', Tipo: "EG", value: 'Favoritos', Arreglo: arreglo, estilo: 'col-sm-1' }
            ],
            datos: []
        } : {
                columnas: [
                    { titulo: '', interN: '', value: '', Tipo: "Act", Arreglo: '', estilo: 'col-sm-4' },
                    { titulo: 'Responsable', interN: 'GrupoResponsable', Tipo: "Act", value: 'NombreCortoGantt', Arreglo: arreglo.filter(x=> x.GrupoResponsable !== undefined), estilo: 'col-sm-1' },
                    { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "Act", Arreglo: arreglo.filter(x=> x.AsignadoA !== undefined), estilo: 'col-sm-1' },
                    { titulo: 'Linea base', interN: 'LineaBase', value: 'Title', Tipo: "Act", Arreglo: arreglo.filter(x=> x.LineaBase !== null), estilo: 'col-sm-1' },
                    { titulo: 'F. estimada', interN: 'FechaEstimada', value: 'Title', Tipo: "Act", Arreglo: arreglo.filter(x=> x.FechaEstimada !== null), estilo: 'col-sm-1' },
                    { titulo: 'Estatus', interN: 'Estatus', value: 'Title', Tipo: "Estatus", Arreglo: arreglo.filter(x=> x.Estatus !== undefined), estilo: 'col-sm-1' },
                    { titulo: 'Adjunto', interN: 'Adjunto', value: 'Adjunto', Tipo: "Act", Arreglo: '', estilo: 'col-sm-1' },
                    { titulo: 'Detalle', interN: 'Detalle', value: 'Detalle', Tipo: "Act", Arreglo: '', estilo: 'col-sm-1' },
                    { titulo: 'Favoritos', interN: 'Favoritos', Tipo: "Act", value: 'Favoritos', '': arreglo, estilo: 'col-sm-1' }
                ],
                datos: []
            }
    },
    //Rellena una cadena hasta el tamaño indicado con el carácter indicado por su parte izquierda
    padLeft: function (data, size, paddingChar) {
        return (new Array(size + 1).join(paddingChar || '0') + String(data)).slice(-size);
    },
    asyncForEach: async function (array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    },
    //Inicializa el estato filtrosTabla
    limpiarFiltrosTabla: function () {
        return {
            eg: [],
            acts: [],
            responsable: '',
            asignadoa: '',
            lineabase: '',
            festimada: '',
            estatus: ''
        }
    },
    //Función utilizada para colocar la hoja de esctilo perteneciente a cada área
    styleLinkGen: function (fileName, url) {
        var css = ["genericoAdmin.css", "genericoNorm.css", "genericoProy.css", "genericoEG.css"];
        for (let index = 0; index < css.length; index++) {
            this.removejscssfile(fileName, "css")
        }
        var sheet = document.createElement('link');
        sheet.rel = 'stylesheet';
        sheet.href = url;
        sheet.type = 'text/css';
        document.head.appendChild(sheet);
    },
    //Función utilizada para remover las hojas de estilo que no se utilizan al momento de dar clic en cada botón
    removejscssfile: function (filename, filetype) {
        var targetelement = (filetype === "js") ? "script" : (filetype === "css") ? "link" : "none" //determine element type to create nodelist from
        var targetattr = (filetype === "js") ? "src" : (filetype === "css") ? "href" : "none" //determine corresponding attribute to test for
        var allsuspects = document.getElementsByTagName(targetelement)
        for (var i = allsuspects.length; i >= 0; i--) { //search backwards within nodelist for matching elements to remove
            if (allsuspects[i] && allsuspects[i].getAttribute(targetattr) !== null && allsuspects[i].getAttribute(targetattr).indexOf(filename) !== -1)
                allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
        }
    },
    //Función utilizada para parsear la fecha en formato dd/MM/aaaa
    spDate: function (value) {
        if (value != null) {
            var date = value.substring(0, 10);
            if (date.substring(4, 5) === '-') {
                var separate = date.split('-');
                var newDate = separate[2] + "/" + separate[1] + "/" + separate[0];
                value = newDate;
            }
        }
        return newDate;
    },
    //Función utilizada para obtener el % de respuestas con base a la ponderación de cada cluster
    average: function (props, orden) {
        var average = 0;
        var rowsNum = props.datos.filter(x => x.IdTarea.Orden === orden && x.IdTarea.ID !== 271);
        var Res = rowsNum.filter(x => x.Estatus.ID === 3);

        average = Res.length > 0 ? ((100 / rowsNum.length) * Res.length) : 0;
        return average.toFixed(0);
    },
    //Función utilizada para colocar la flecha del cluster dependiendo del clic
    toggle: function (id, arrow, substring) {

        let state = document.getElementById(id);
        if (state !== null) {
            if (state.style.display === 'block') {
                state.style.display = 'none';
                document.getElementById(arrow).src = "../estilos/arrow_down_icon.png";
            } else {
                state.style.display = 'block';
                document.getElementById(arrow).src = "../estilos/arrow_up_icon.png";
            }
        }

        if (document.getElementsByClassName(id) !== null) {
            var stateCss = document.getElementsByClassName(id);
            if (stateCss.length > 0) {
                state = document.getElementById(id + "*");
                if (state.style.display === 'block') {
                    state.style.display = 'none';
                } else {
                    state.style.display = 'block';
                }
            }
        }

        var arreglo = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        for (let index = 1; index < arreglo.length; index++) {

            var getNewId = parseFloat(id.match(/[\d\.]+/)) + index;
            getNewId = id.substring(0, substring) + getNewId;
            state = document.getElementById(getNewId);

            if (state !== null) {
                if (state.style.display === 'block') {
                    state.style.display = 'none';
                } else {
                    state.style.display = 'block';
                }
            }
        }
    },
    //Función utilizada para colocar check o un check 
    toggleCheck: function (id, datos) {
        datos.forEach((fila)=>{
            let state = document.getElementById(id + fila.ID);
            let ckeck = document.getElementById(id);
            if (state !== null) {
                if (ckeck.checked === true) {
                    state.disabled = false;
                }
                else {
                    state.disabled = true;
                }
            }
        })
    },
    //Función que se utiliza para mostrar y ocultar los cluster de EG dependiendo el clic con base a los elementos
    bodyFunEG: function (terr, props, fila) {
        let nombreTerreno = ''
        let filaBody = props.datos.map((fila2) => {
            if (fila2.Terreno !== undefined) {
                if (fila2.Terreno.Title === terr) {
                    nombreTerreno = fila2.Terreno.NombredelTerreno2
                    if (fila2.Tarea.OrdenEG === fila.cluster.OrdenEG) {
                        if (fila.cluster.Checkable) { return "valor" }
                    } else { return null }
                }
            } else {
                if (terr === '') {
                    if (fila2.Tarea.OrdenEG === fila.cluster.OrdenEG) { return "valor" }
                } else { return null }
            }
        });

        return filaBody.filter(x => x !== undefined && x !== null);
    },
    //Función que se utiliza para mostrar y ocultar los cluster de pantallas menos RG dependiendo el clic con base a los elementos
    bodyFunAll: function (terr, props, fila) {
        let nombreTerreno = ''
        let filaBody = props.datos.map((fila2) => {
            if (fila2.IdTerreno !== undefined) {
                if (fila2.IdTerreno.Title === terr) {
                    nombreTerreno = fila2.IdTerreno !== undefined ? fila2.IdTerreno.NombredelTerreno2 : ''
                    if (fila2.IdTarea.Orden === fila.cluster.IdTarea.Orden) { return ("valor") }
                    else { return null }
                }
            } else {
                if (terr === '') {
                    if (fila2.IdTarea.Orden === fila.cluster.IdTarea.Orden) {
                        return ("valor")
                    } else { return null }
                }
            }
        })

        return filaBody.filter(x => x !== undefined && x !== null);
    },
    //Función utilizada para colocar el icono correspondiente
    imgChange: function (id, imgname) {

        var image = document.getElementById(id);
        image.src = "";
        image.style.content = "";
        image.src = "../estilos/" + imgname;
    },
    //Valida si una cadena contiene algun dato de otra cadena
    contains: function (value, searchFor) {
        if (Object.prototype.toString.call(value) === '[object Array]') {

        }
        else {
            var v = (value || '').toLowerCase();
            var v2 = searchFor;
            if (v2) {
                v2 = v2.toLowerCase();
            }
            return v.indexOf(v2) > -1;
        }
    },
    //Función utiilizada para colocar la estrella de favoritos cuando el usuario le dio clic
    onShowStar: function (fila, usuarioActual) {
        const user = usuarioActual;
        var regresaImf = "";
        if (this.IsNullOrEmpty(fila.Favoritos) === false) {
            const exists = fila.Favoritos.filter(x => x.ID === user.Id)
            if (exists.length === 0)
                regresaImf = favoritos_icon;
            else
                regresaImf = favoritos_icon_clicked;
        }
        else
            regresaImf = favoritos_icon;

        return regresaImf;
    },
    //Determina si el valor especificado es nulo o vacío
    IsNullOrEmpty: function (e) {
        switch (e) {
            case "":
            case 0:
            case "0":
            case null:
            case false:
            case undefined:
            case typeof this === "undefined":
                return true;
            default:
                {
                    if (e.length > 0)
                        return false;
                    else
                        return true;
                }
        }
    },
    //Obtiene el ID de los usuarios del campo especificado
    obtenerIdAsignados: function (campo) {
        let val = { results: [] }
        if (campo !== undefined) {
            campo.map((registro) => {
                val.results.push((registro.Id || registro.ID))
            })
        }
        return val
    },
    obtenerAsignados: function (campo) {
        const usuarios = campo.map((registro) => {
            return (registro.Title)
        })
        return usuarios
    },
    combinarIdAsignados: function(arregloOriginal, arregloAgregar){
        let val = { results: [] }
        let merge =  { results: [] }
        if(arregloOriginal === undefined){
            if(arregloAgregar !== undefined){
                arregloAgregar.forEach((registro)=>{
                    merge.results.push((registro.Id || registro.ID))
                })
            }
        }else{
            if(arregloAgregar !== undefined){
                merge = this.obtenerIdAsignados(arregloOriginal)
                arregloAgregar.forEach((registro)=>{
                    merge.results.push((registro.Id || registro.ID))
                })
            }
        }
        if(merge.results.length>0){
            val.results = [...new Set(merge.results)]
        }
        return val
    },
    combinarAsignados: function(arregloOriginal, arregloAgregar){
        let merge = []
        if(arregloOriginal === undefined){
            if(arregloAgregar !== undefined){
                merge = arregloAgregar
            }
        }else{
            if(arregloAgregar !== undefined){
                merge = arregloOriginal.concat(arregloAgregar)
            }
        }
        const val = Array.from(new Set(merge.map(x=> x.Id)))
                    .map(id =>{
                        return{
                            Id: id,
                            Title: merge.find(y=> y.Id === id).Title
                        };
                    });
        return val
    },
    filtrarDatosVentana: function(idVentana, datosVentana, gruposUsuarioActual, usuarioActual, filtrosEncabezado){
        datosVentana = datosVentana.filter(x=> x.Orden >= idVentana && x.Orden < idVentana + 1)
        let values
        if (!filtrosEncabezado.includes('ver')){
            const strGruposUsuarioActual = gruposUsuarioActual.map((grupoUsuarioActual) =>{ return grupoUsuarioActual.NombreCortoGantt}).join(',')
        
            values = datosVentana.map((registro) => {
                if(!strGruposUsuarioActual.includes(registro.GrupoResponsable.NombreCortoGantt.toString()) && registro.AsignadoA === undefined){ return '' }
                else if(strGruposUsuarioActual.includes(registro.GrupoResponsable.NombreCortoGantt) || this.obtenerIdAsignados(registro.AsignadoA).results.includes(usuarioActual))
                { return registro }
            })
        }else{ values = datosVentana }
        return values.filter(x=> x !== '' && x !== undefined && x !== null)
    },
    contieneAsignadoA: function(campo,usuarioActual){
        if (campo !== undefined) {
            return campo.some(x=> x.ID === usuarioActual)
        }else{ return false}
    },
    //Obtiene la información de los trámites asociados a los IDs de tareas clúster dentro de las actividades proporcionadas
    generarConsultaFPT: async function (actividades) {
        let datosFPT = [];
        let idsFPT = actividades.map((x) => { return x.IdTarea.EsCluster === '1' && x.IdTarea.EsBitacora === '0' ? x.ID : 0 })

        if (idsFPT.length > 0) {
            idsFPT = idsFPT.filter(x => x > 0)
            let filtroFPT = ''
            idsFPT.forEach(idFPT => {
                filtroFPT = filtroFPT === '' ? '(IdFlujoId eq ' + idFPT + ')' : filtroFPT + ' or (IdFlujoId eq ' + idFPT + ')'
            })

            datosFPT = await sp.web.lists.getByTitle('Fechas paquete de trámites').items
                .filter(filtroFPT)
                .select('ID', 'IdFlujoId', 'IdDocTaskId', 'IdDocTramite/ID', 'IdDocTramite/Title', 'AsignadoA/ID',
                    'AsignadoA/Title', 'Estatus/ID', 'Estatus/Title', 'EstatusAnterior/ID', 'EstatusAnterior/Title',
                    'LineaBase', 'LineaBaseModifico/ID', 'LineaBaseModifico/Title', 'FechaEstimada', 'Title',
                    'Editor/ID', 'Editor/Title', 'Favoritos/ID', 'Favoritos/Name', 'Created', 'Modified',
                    'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt')
                .expand('AsignadoA', 'Estatus', 'EstatusAnterior', 'IdDocTramite', 'LineaBaseModifico', 'Editor', 'Favoritos', 'GrupoResponsable')
                .get()
        }
        return datosFPT
    },
    obtenerSeguridad: async function(){
        const seguridad = await sp.web.lists.getByTitle('GanttConfigRespAct').items
        .select('ID', 'Title', 'IdActividadId', 'RespAreaGantt/ID', 'RespAreaGantt/Name', 'GrupoRespGantt')
        .expand('RespAreaGantt')
        .get()
        
        return seguridad
    },
    establacerDatoLista: function (lista, datos, proyectoInversion) {
        return datos.map((dato) => {
            dato.Lista = lista
            dato.PI = proyectoInversion

            let urlLink = dato.UrlDocumentos !== null && dato.UrlDocumentos !== undefined ? dato.UrlDocumentos.substring(dato.UrlDocumentos.indexOf('<a')) : ''
            urlLink = urlLink.replace('<a href="', '').replace(' target="_blank">Ver Documentos</a><a></a></div>', '').replace('"', '').replace(' target="_blank">Ver Documentos', '').replace('"', '')
            const parseResultDocto = new DOMParser().parseFromString(urlLink, "text/html")
            var urlDescargarDocto = parseResultDocto.documentElement.textContent
            dato.UrlDocumentos = urlDescargarDocto

            let urlTarea = dato.UrlTarea !== null && dato.UrlTarea !== undefined ? dato.UrlTarea.substring(dato.UrlTarea.indexOf('<a')) : ''
            urlTarea = urlTarea.replace('<a href="', '').replace(' target="_blank">Ver Tarea</a><a></a></div>', '').replace('"', '').replace(' target="_blank">Ver Tarea', '').replace('"', '')
            const parseResult = new DOMParser().parseFromString(urlTarea, "text/html")
            const urlAbrirTarea = parseResult.documentElement.textContent

            dato.UrlTarea = urlAbrirTarea

            return dato
        })
    },
    generarArregloEG: function (clusters, datos) {
        let arregloClusters = []
        clusters.forEach((clusterActual, cIndex) => {
            const datosCluster = datos.filter(x => x.Tarea.TxtCluster === clusterActual.cluster.TxtCluster);
            const datosTerrenos = [...new Set(datosCluster.map(x => (x.Terreno !== undefined ? x.Terreno.Title : '')))];
            const subClusters = [...new Set(datosCluster.map(x => (x.Tarea.EsSubcluster === '1' ? x.Tarea.Title : '')))];
            //arregloClusters.push({[clusterActual.cluster.TxtCluster]: []})
            datosCluster.forEach((datoCluster, dIndex) => {
                arregloClusters[cIndex] = {
                    Cluster: clusterActual.cluster.TxtCluster,
                    Subcluster: datoCluster.Tarea.EsSubcluster === '1' ? datoCluster.Tarea.Title : '',
                    Tipo: 'EstrategiaGestion',
                    PI: datoCluster.ProyectoInversion,
                    Terr: datoCluster.Terreno,
                    Tarea: datoCluster.Tarea,
                    NombreActividad: datoCluster.NombreActividad,
                    AsignadoA: datoCluster.AsignadoA,
                    GrupoResponsable: datoCluster.GrupoResponsable,
                    Seleccionado: datoCluster.Seleccionado,
                    IdFlujoTareas: datoCluster.IdFlujoTareasId,
                    Estatus: datoCluster.EstatusId,
                    OrdenEG: datoCluster.OrdenEG,
                    IdRCDTT: datoCluster.IdRCDTT,
                    IdFPT: datoCluster.IdFPTId
                }
                /*arreglo.push({  Cluster: clusterActual.cluster.TxtCluster,
                                Subcluster: dato.Tarea.EsSubcluster === '1' ? dato.Tarea.Title : '',
                                Tipo: 'EstrategiaGestion',
                                PI: dato.ProyectoInversion,
                                Terr: dato.Terreno,
                                Tarea: dato.Tarea,
                                NombreActividad: dato.NombreActividad,
                                AsignadoA: dato.AsignadoA,
                                GrupoResponsable: dato.GrupoResponsable,
                                Seleccionado: dato.Seleccionado,
                                IdFlujoTareas: dato.IdFlujoTareasId,
                                Estatus: dato.EstatusId,
                                OrdenEG: dato.OrdenEG,
                                IdRCDTT: dato.IdRCDTT,
                                IdFPT: dato.IdFPTId
                            })*/
                return
            })
        })

        return arregloClusters
    },
    generarArregloActs: function (tipo, clusters, datos) {
        let arreglo = []
        clusters.forEach((clusterActual) => {
            const datosCluster = datos.filter(x => x.Tarea.TxtCluster === clusterActual.cluster.TxtCluster)
            datosCluster.forEach((dato) => {
                arreglo.push({
                    Cluster: clusterActual.cluster.TxtCluster,
                    Subcluster: dato.Tarea.EsSubcluster === '1' ? dato.Tarea.Title : '',
                    Tipo: tipo,
                    PI: dato.IdProyectoInversion,
                    Terr: dato.IdTerreno,
                    Tarea: dato.IdTarea,
                    NombreActividad: dato.NombreActividad,
                    AsignadoA: dato.AsignadoA,
                    Nivel: dato.Nivel,
                    Estatus: dato.EstatusId,
                    EstatusAnterior: dato.EstatusAnteriorId,
                    UrlTarea: dato.UrlTarea,
                    UrlDocumentos: dato.UrlDocumentos,
                    Favoritos: dato.Favoritos,
                    LineaBase: datos.LineaBase,
                    LineaBaseModifico: datos.LineaBaseModifico,
                    FechaEstimada: datos.FechaEstimada,
                    Orden: datos.Orden
                })
                return
            })
        })

        return arreglo
    },
    //Agrupa el contenido del arreglo proporcionado por la columna especificada
    groupBy: function (arreglo, propiedad) {
        return arreglo.reduce((acc, obj) => {
            const key = obj[propiedad];
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(obj);
            return acc;
        }, {});
    },
    returnDataByFieldType: function (valor, tipo) {
        switch (tipo) {
            case 'Text':
            case 'TextArea':
                return valor !== null ? valor.toString() : ''
            case 'Select':
                return valor !== null ? parseInt(valor.toString()) : 0
            case 'SelectMultiple':
                return valor !== null ? valor : 0
            case 'SelectYesNo':
                return valor !== 0 ? valor : ''
            case 'SelectText':
                return valor !== 0 ? valor : ''
            case 'SelectYN':
                return valor !== 0 ? Boolean(valor) : ''
            case 'Date':
                return valor !== '' ? moment(valor).format('YYYY-MM-DD') : ''
            case 'Number':
                return valor !== '' ? parseFloat(valor) : 0
            case 'CheckBox':
                return valor
            default:
                break;
        }
    },
    obtenerIdActualizarPorLista: function (arreglo, lista) {
        switch (lista) {
            case 'ProyectoInversion':
                return arreglo.IdProyectoInversion.ID
            case 'Terrenos':
                return arreglo.IdTerreno.ID
            case 'RelacionFechasAprobacionTerreno':
            case 'RelacionBancosProyectosDeptos':
                return arreglo.ID
            case 'FechasTramites':
                return arreglo.Lista === 'Flujo Tareas' ? arreglo.ID : arreglo.IdFlujoId
            default:
                return
        }
    },
    esRequerido: function(archivosCargados, campo){
        return archivosCargados.length> 0 ? (archivosCargados.find(x=> x.nombreInterno === campo.TituloInternoDelCampo) ? false : campo.Requerido) : campo.Requerido
    },
    obtenerDatosDocumento(archivosCargados, campo){
        return archivosCargados.find(x=> x.nombreInterno === campo.TituloInternoDelCampo)
    },
    obtenerNodoJSON: function(campo, tipo){
        const tipoCampo = campo.substring(0,4)
        switch(tipoCampo){
            case 'FdeI':
                return tipo === 'IN' ? 'InternalNameFdeI' : 'FechaDeIngreso'
            case 'FdeP':
                return tipo === 'IN' ? 'InternalNameFdeLaP' : 'FechaDeLaPrevencion'
            case 'FdeR':
                return tipo === 'IN' ? 'InternalNameFdeR' : 'FechaDeResolucion'
            case 'FdeV':
                return tipo === 'IN' ? 'InternalNameFdeV' : 'FechaVigencia'
            case 'NoAp':
                return tipo === 'IN' ? 'NoAplica' : 'NoAplica'
            default:
                break;
        }
    },
    obtenerValorCampoFPT: function(campo, datos){
        const tipoCampo = campo.substring(0,4)
        switch(tipoCampo){
            case 'FdeI':
                return datos.FechaDeIngreso !== null ? moment(datos.FechaDeIngreso).format('YYYY-MM-DD') : ''
            case 'FdeP':
                return datos.FechaDeLaPrevencion !== null ? moment(datos.FechaDeLaPrevencion).format('YYYY-MM-DD') : ''
            case 'FdeR':
                return datos.FechaDeResolucion !== null ? moment(datos.FechaDeResolucion).format('YYYY-MM-DD') : ''
            case 'FdeV':
                return datos.FechaVigencia !== null ? moment(datos.FechaVigencia).format('YYYY-MM-DD') : ''
            case 'NoAp':
                return datos.NoAplica
            default:
                break;
        }
    },
    //Incidencias para la tarea 12
    GetIncidenteValues: function(id) {
        var datos = {};
        switch (id) {
            case 0:
                datos.IDUsuario1 = 187;
                datos.IDUsuario2 = 307;
                datos.comentario = "Carga y liberación del Proyecto Ejecutivo";
                datos.idAutorIncidente = 141;
                datos.motivoCausaIncId = 3;
                datos.afectacionAIncId = 27;
                datos.areaAsignadaIncId = 21;
                break;
            case 1:
                datos.IDUsuario1 = 187;
                datos.IDUsuario2 = 307;
                datos.comentario = "Carga y liberación del Proyecto Ejecutivo, Arquitectura";
                datos.idAutorIncidente = 313;
                datos.motivoCausaIncId = 5;
                datos.afectacionAIncId = 27;
                datos.areaAsignadaIncId = 21;
                break;
            case 2:
                datos.IDUsuario1 = 187;
                datos.IDUsuario2 = 307;
                datos.comentario = "Carga y liberación del Proyecto Ejecutivo, Estructuras";
                datos.idAutorIncidente = 338;
                datos.motivoCausaIncId = 4;
                datos.afectacionAIncId = 27;
                datos.areaAsignadaIncId = 21;
                break;
            default:
                break;
        }
        return datos;
    },
    ensablarURLPE: function(url, datos, innerName){
        let finalUrl = datos.IdTarea.ID !== 244 ? (datos.IdTerreno.MACO === 'C' ? ' C' : '') : (datos.IdTerreno.MACO === 'C' ? 'C_R' : '_R')
        return url.replace('{PI}', datos.IdProyectoInversion.Title).replace('{Terr}', datos.IdTerreno.Title).replace('{IN}', innerName + finalUrl)
    },
    ensablarURL: function(campo, datos, url){
        return  campo.replace('{IdPI}', datos.IdProyectoInversion.ID).replace('{PI}', datos.IdProyectoInversion.Title)
                .replace('{IdTerr}', datos.IdTerreno !== undefined ? datos.IdTerreno.ID : '').replace('{Terr}', datos.IdTerreno !== undefined ? datos.IdTerreno.Title : '')
                .replace('{LinkFichasVenta}', datos.IdTerreno !== undefined ? datos.IdTerreno.LinkFichasVenta : '')
                .replace('{LinkMemoriaAcabados}', datos.IdTerreno !== undefined ? datos.IdTerreno.LinkMemoriaAcabados : '')
                .replace('{LinkFichasDesarrollo}', datos.IdTerreno !== undefined ? datos.IdTerreno.LinkFichasDesarrollo : '')
                .replace('{sitio}', url)
    },
    crearBitacoras: async function(idTarea,terreno, PI, tareaCrear){
        const rootweb = await sp.web.getParentWeb()
        let websCdV = await rootweb.web.webs()
        let webBitacoras = websCdV[2]
        webBitacoras = await sp.site.openWebById(webBitacoras.Id)
        let json = {}
        if(tareaCrear!== '0'){
            await sp.web.lists.getByTitle('Tareas').items.getById(parseInt(tareaCrear)).get().then(async(nuevaTarea)=>{
                json.IdProyectoInversionId = PI.ID
                json.IdTareaId = nuevaTarea.ID
                json.NivelId = nuevaTarea.NivelId
                json.IdTerrenoId = terreno.ID
                json.GrupoResponsableId = nuevaTarea.GrupoId
                json.EstatusId = 1
                json.EstatusAnteriorId = 1
                json.Visible = true
                json.Orden = nuevaTarea.Orden
            })
        }
        if(idTarea === 12){
            const bitacoras = await webBitacoras.web.lists.getByTitle("Bitacora").items
            .filter("Title eq 'BIT.ADT." + terreno.Title + "'")
            .get()

            if(bitacoras.length === 0){
                await sp.web.lists.getByTitle('Tareas').items.getById(274).get().then(async(nuevaTarea)=>{
                    const lineaBase = await sp.web.lists.getByTitle('Fechas objetivo').items
                    .filter("Title eq '" + PI.Title + (!terreno.Title.startsWith('T-') ? "' and Terreno eq '" + terreno.Title : '') + "' and IdActividad eq 13")
                    .get()

                    if(lineaBase.length >0){
                        if(lineaBase.FechaFinMeta !== undefined){
                            json.LineaBase = lineaBase.FechaFinMeta
                            json.LineaBaseModifico = lineaBase.EditorId
                        }
                    }
                    if(Object.keys(json).length > 0){
                        await sp.web.lists.getByTitle('Flujo Tareas').items.add(json)
                    }
                })
                
                this.crearBitacoraEjecutivo(webBitacoras, PI.Title, terreno.Title, terreno.NombredelTerreno2 )
            }
        }
        else if(idTarea === 188 || idTarea === 189){
            
            if(Object.keys(json).length > 0){
                await sp.web.lists.getByTitle('Flujo Tareas').items.add(json)
            }

            const categorias = await webBitacoras.web.lists.getByTitle("Categoria").items
            .filter("NombreCorto eq 'ARQ' or NombreCorto eq 'EST' or NombreCorto eq 'INS' or NombreCorto eq 'ACB' or NombreCorto eq 'NOR' or NombreCorto eq 'REG'")
            .get()

            this.crearBitacoraVarios(webBitacoras, categorias, PI, terreno)
        }
    },
    crearBitacoraEjecutivo: async function (webBitacoras, idProyectoInversion, idTerreno, nombreTerreno){
        // Construcción de informacion a enviar para la creación del elemento
        let json = {
            "Title": "BIT.ADT." + idTerreno,
            "TerrenoBit": idTerreno,
            "NivelProyectoBit": "T",
            "CategoriaBitId": 2,
            "AreaSolicitanteBitId": 21,
            "DescripcionTCBit": nombreTerreno,
            "TipoBit": 'Categoria',
            "PIBit": idProyectoInversion,
            "EdoBit": 'Abierto'
        }

        // Creacion de bitacora generica
        await webBitacoras.web.lists.getByTitle("Bitacora").items.add(json)
        .then(async(resultBA)=>{
            for(let i=0; i<3; i++){
                let datos = util.GetIncidenteValues(i);
                // Construcción de informacion a enviar para la creación del elemento
                var jsoni = {
                    "Title": "INC.",
                    "GravedadInc": "Media",
                    "MotivoCausaIncId": datos.motivoCausaIncId,
                    "AfectacionAIncId": datos.afectacionAIncId,
                    "AreaAsignadaIncId": datos.areaAsignadaIncId,
                    "AsignadoAIncId": { "results": [datos.IDUsuario1, datos.IDUsuario2] },
                    "InteresadosIncId": { "results": [datos.IDUsuario1] },
                    "ComentariosIncSol": datos.comentario,
                    "BitacoraIncId": resultBA.data.Id,
                    "AuthorId": datos.idAutorIncidente,
                    "EdoInc": "Abierta"
                }

                // Creacion de incidencia sobre bitacora
                await webBitacoras.web.lists.getByTitle("Incidencia").items.add(jsoni)
                .then(async(result)=>{
                    // Objeto para actualizacion de incidencia creada
                    var jsoniu = { "Title": result.data.Title + result.data.Id }
                    await webBitacoras.web.lists.getByTitle("Incidencia").items.getById(result.data.Id).update(jsoniu)
                })
            }
        })
    },
    crearBitacoraVarios: async function(webBitacoras, categorias, PI, terreno){
        await util.asyncForEach(categorias, async categoria=>{
            let descripcion = '';
            switch(categoria.NombreCorto){
                case 'ARQ':
                    descripcion = 'Constr. Arquitectura';
                    break;
                case 'EST':
                    descripcion = 'Constr. Estructura';
                    break;
                case 'INS':
                    descripcion = 'Constr. Instalaciones';
                    break;
                case 'ACB':
                    descripcion = 'Constr. Acabados';
                    break;
                case 'NOR':
                    descripcion = 'Constr. Normativo';
                    break;
                case 'REG':
                    descripcion = 'Constr. Regenerativo';
                    break;
                default:
                    break;
            }
            var json = {
                "Title": "BIT." + categoria.NombreCorto + "." + terreno.Title,
                "TerrenoBit": terreno.Title,
                "NivelProyectoBit": "T",
                "CategoriaBitId": categoria.Id,
                "AreaSolicitanteBitId": 24,
                "DescripcionTCBit": descripcion,
                "TipoBit": 'Categoria',
                "PIBit": PI.Title,
                "EdoBit": 'Abierta'
            }
            await webBitacoras.web.lists.getByTitle("Bitacora").items.add(json)
        })
    },
    obtenerBitacorasInfo: async function(proyectoTitulo, terrenoTitulo){
        const rootweb = await sp.web.getParentWeb();
        let websCdV = await rootweb.web.webs();
        let webBitacoras = websCdV[2];
        webBitacoras = await sp.site.openWebById(webBitacoras.Id);
        let datos = { bitacoras: [], solucion: [] }

        let bitacorasInfo = await webBitacoras.web.lists.getByTitle('Incidencia').items
        .filter("(BitacoraInc/TerrenoBit eq '" + proyectoTitulo + "') or (BitacoraInc/TerrenoBit eq '" + terrenoTitulo + "')")
        .select('ID', 'Title', 'EdoInc', 'MotivoCausaInc/Title', 'BitacoraInc/ID', 'BitacoraInc/Title', 'BitacoraInc/TerrenoBit',
                'MotivoCausaInc/ID', 'AreaAsignadaInc/NombreCorto', 'AsignadoAInc/Title')
        .expand('MotivoCausaInc', 'BitacoraInc', 'AreaAsignadaInc', 'AsignadoAInc')
        .top(100)
        .get()

        bitacorasInfo.map((bitacora)=>{
            return bitacora.EdoInc = this.reemplazarEstatusBitacora(bitacora.EdoInc) 
        })

        const solucionInfo = await this.obtenerSolucionInfo(webBitacoras)

        datos.bitacoras = bitacorasInfo
        datos.solucion = solucionInfo

        return datos
    },
    obtenerSolucionInfo: async function(webBitacoras){
        const solucionInfo = await webBitacoras.web.lists.getByTitle('Solucion').items
            .select('ID', 'FechaCompSol', 'IncidenciaSol/ID')
            .expand('IncidenciaSol')
            .top(10000)
            .get()

        return solucionInfo
    },
    reemplazarEstatusBitacora: function(estatus){
        switch(estatus){
            case 'Abierto':
            case 'Abierta':
            case 'Con solución':
            case 'Con solucion':
                return 'Pendiente'
            case 'Rechazado':
                return 'Rechazado'
            case 'Aprobado':
                return 'Concluido'
            default:
                break;
        }
    },
    cambiarEstatusCluster: async function(idFlujoTarea, datos, datosActividades){
        let actualizado = false
        const esSubcluster = datosActividades.some(x=> x.ID === idFlujoTarea && x.IdTarea.EsCluster === '1' && x.IdTarea.EsSubcluster === '1' && x.IdTarea.EsBitacora === '0' && x.IdTarea.Subcluster !== null)
        if(esSubcluster){
            const clusterIncompleto = datos.some(x=> x.IdFlujoId === idFlujoTarea && x.Estatus.ID !== 3)
            if(!clusterIncompleto){
                await sp.web.lists.getByTitle('Flujo Tareas').items.getById(idFlujoTarea).update({
                    EstatusId: 3,
                    EstatusAnteriorId: 3
                })
                .then(()=>{
                    actualizado = true
                })
                .catch(error=>{
                    alert('Error al actualizar el subclúster: ' + error)
                })
            }
        }
        return actualizado
    }
}
export default util;