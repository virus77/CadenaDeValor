import favoritos_icon from '../imagenes/favoritos_icon.png';
import favoritos_icon_clicked from '../imagenes/favoritos_icon_clicked.png';
import { sp } from "@pnp/sp";
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import moment from 'moment';
import CRUD from '../js/CRUD';

const currentWeb = Web(window.location.protocol + '//' + window.location.host + "/CompraDeTerreno/");

const util = {
    //Inicializa el arreglo de datos de actividades
    inicializarArregloDatos: function (idVentana, arreglo) {
        return idVentana === 4 ? {
            columnas: [
                { titulo: '', interN: '', Arreglo: "", estilo: 'col-sm-5' },
                { titulo: 'Responsable', interN: 'Responsable', value: 'NombreCortoGantt', Tipo: "EG", Arreglo: arreglo, estilo: 'col-sm-2' },
                { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "EG", Arreglo: arreglo, estilo: 'col-sm-2' },
                { titulo: 'E. de G. autorizada', Arreglo: "", estilo: 'col-sm-2' },
                { titulo: 'Favoritos', interN: 'Favoritos', Tipo: "EG", value: 'Favoritos', Arreglo: arreglo, estilo: 'col-sm-1' }
            ],
            datos: []
        } : {
                columnas: [
                    { titulo: '', interN: '', value: '', Tipo: "Act", Arreglo: '', estilo: 'col-sm-4' },
                    { titulo: 'Responsable', interN: 'Responsable', Tipo: "Act", value: 'NombreCortoGantt', Arreglo: arreglo.filter(x=> x.GrupoResponsable !== undefined), estilo: 'col-sm-1' },
                    { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "Act", Arreglo: arreglo.filter(x=> x.AsignadoA !== undefined), estilo: 'col-sm-1' },
                    { titulo: 'Linea base', interN: 'LineaBase', value: 'Title', Tipo: "Act", Arreglo: arreglo.filter(x=> x.LineaBase !== null), estilo: 'col-sm-1' },
                    { titulo: 'F. estimada', interN: 'FEstimada', value: 'Title', Tipo: "Act", Arreglo: arreglo.filter(x=> x.FechaEstimada !== null), estilo: 'col-sm-1' },
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
    establecerEstatus: function(estatus){
        switch(estatus.Title){
            case 'Por Capturar':
                return { ID: estatus.ID, Title: 'Pendiente'}
            case 'Enviada':
                return { ID: estatus.ID, Title: 'Concluido'}
                default:
                    return estatus
        }
    },
    //Inicializa el estato filtrosTabla
    limpiarFiltrosTabla: function () {
        return {
            eg: [],
            acts: [],
            responsable: [],
            asignadoa: [],
            lineabase: [],
            festimada: [],
            estatus: [],
            favs: [],
            gantt: [],
            ver: []
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
    //Obtiene el porcentaje de tareas completadas (Enviadas/Concluidas) por cada clúster de tipo conjunto de tareas (EsCluster eq 0)
    average: function (props, orden) {
        var average = 0;
        var rowsNum = props.datos.filter(x => x.IdTarea.Orden === orden && x.IdTarea.ID !== 271);
        var Res = rowsNum.filter(x => x.Estatus.ID === 3);

        average = Res.length > 0 ? ((100 / rowsNum.length) * Res.length) : 0;
        return average.toFixed(0);
    },
    //Obtiene el porcentaje de tareas completadas (Enviadas/Concluidas) por cada clúster de tipo tarea (EsCluster eq 1)
    averageFPT: function (datos, idFlujoTareas) {
        var average = 0;
        var rowsNum = datos.filter(x => x.IdFlujoId === idFlujoTareas);
        var Res = rowsNum.filter(x => x.Estatus.ID === 3);

        average = Res.length > 0 ? ((100 / rowsNum.length) * Res.length) : 0;
        return average.toFixed(0);
    },
    //Obtiene el porcentaje de tareas completadas (Enviadas/Concluidas) del clúster de Marketing
    averageMkt: function (datos) {
        var average = 0;
        var rowsNum = datos.filter(x => x.IdTarea.Orden === 3.14 && (x.IdTarea.ID !== 287 && x.IdTarea.ID !== 288) && x.Visible);
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
        if (Object.prototype.toString.call(value) === '[object Array]') {}
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
    filtrarDatosVentana: function(idVentana, datosVentana, gruposUsuarioActual, usuarioActual, filtrosTabla){
        datosVentana = datosVentana.filter(x=> x.Orden >= idVentana && x.Orden < idVentana + 1)
        let values = []
        if (filtrosTabla.ver.length === 0){
            //let strGruposUsuarioActual = gruposUsuarioActual.filter(x => x.AdminAreaGanttId.includes(usuarioActual) && x.NombreCortoGantt !== 'EG')
            let strGruposUsuarioActual = gruposUsuarioActual.filter(x => (x.AdminAreaGanttId.includes(usuarioActual) || x.RespAreaGanttId.includes(usuarioActual) || x.NombreCortoGantt === 'TODOS') && x.NombreCortoGantt !== 'EG')
            strGruposUsuarioActual = strGruposUsuarioActual.map((x)=> { return x.NombreCortoGantt}).join(',')
            datosVentana.forEach(registro => {
                if(!strGruposUsuarioActual.includes(registro.GrupoResponsable.NombreCortoGantt.toString()) && registro.AsignadoA === undefined){
                    values.push('')
                }
                else if(strGruposUsuarioActual.includes(registro.GrupoResponsable.NombreCortoGantt) || this.obtenerIdAsignados(registro.AsignadoA).results.includes(usuarioActual))
                { values.push(registro) }
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
                filtroFPT = filtroFPT === '' ? '(IdFlujoId eq ' + idFPT + ' and Visible eq 1)' : filtroFPT + ' or (IdFlujoId eq ' + idFPT + ' and Visible eq 1)'
            })

            datosFPT = await currentWeb.lists.getByTitle('Fechas paquete de trámites').items
            .filter(filtroFPT)
            .select('ID', 'IdFlujoId', 'IdDocTaskId', 'IdDocTramite/ID', 'IdDocTramite/Title', 'IdDocTramite/ExisteEnGantt', 'AsignadoA/ID',
                'AsignadoA/Title', 'Estatus/ID', 'Estatus/Title', 'EstatusAnterior/ID', 'EstatusAnterior/Title',
                'LineaBase', 'LineaBaseModifico/ID', 'LineaBaseModifico/Title', 'FechaEstimada', 'Title',
                'Editor/ID', 'Editor/Title', 'Favoritos/ID', 'Favoritos/Name', 'Created', 'Modified',
                'GrupoResponsable/ID', 'GrupoResponsable/NombreCortoGantt', 'ContieneAdjunto')
            .expand('AsignadoA', 'Estatus', 'EstatusAnterior', 'IdDocTramite', 'LineaBaseModifico', 'Editor', 'Favoritos', 'GrupoResponsable')
            .get()
            .catch(error => {
                alert('ERROR AL INTENTAR OBTENER LOS DATOS DE FECHAS PAQUETE DE TRÁMITES: ' + error)
            })
        }
        return datosFPT
    },
    obtenerSeguridad: async function(){
        const seguridad = await currentWeb.lists.getByTitle('GanttConfigRespAct').items
        .select('ID', 'Title', 'IdActividadId', 'RespAreaGantt/ID', 'RespAreaGantt/Name', 'GrupoRespGantt')
        .expand('RespAreaGantt')
        .get()
        .catch(error => {
            alert('ERROR AL INTENTAR OBTENER LA INFORMACIÓN DE GANTTCONFIGRESPACT: ' + error)
        })
        
        return seguridad
    },
    establacerDatoLista: function (lista, datos, proyectoInversion) {
        return datos.map((dato) => {
            dato.Lista = lista
            dato.PI = proyectoInversion
            dato.Estatus = this.establecerEstatus(dato.Estatus)

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
                return valor !== null && valor !== undefined ? valor.toString() : ''
            case 'Select':
                return valor !== null && valor !== undefined ? parseInt(valor.toString()) : 0
            case 'SelectMultiple':
                return valor !== null && valor !== undefined ? valor : 0
            case 'SelectYesNo':
                return valor !== 0 ? valor : ''
            case 'SelectText':
                return valor !== 0 ? valor : ''
            case 'SelectYN':
                return valor !== 0 ? Boolean(valor) : ''
            case 'Date':
                return valor !== '' && valor !== null && valor !== undefined ? moment(valor).format('YYYY-MM-DD') : null
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
            case 'RelacionTerrenoInteresados':
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
    ensamblarURLPE: function(url, datos, innerName, urlSitio){
        let finalUrl = datos.IdTarea.ID !== 244 ? (datos.IdTerreno.MACO === 'C' ? ' C' : '') : (datos.IdTerreno.MACO === 'C' ? ' C_R' : '_R')
        return url.replace('{PI}', datos.IdProyectoInversion.Title).replace('{Terr}', datos.IdTerreno.Title).replace('{IN}', innerName + finalUrl).replace('{sitio}', urlSitio)
    },
    ensamblarURL: function(campo, datos, url){
        return  campo.replace('{IdPI}', datos.IdProyectoInversion.ID).replace('{PI}', datos.IdProyectoInversion.Title).replace('{IdPIVer}', datos.IdProyectoInversion.IdBusquedaVersionado)
                .replace('{IdTerr}', datos.IdTerreno !== undefined ? datos.IdTerreno.ID : '').replace('{Terr}', datos.IdTerreno !== undefined ? datos.IdTerreno.Title : '')
                .replace('{LinkFichasVenta}', datos.IdTerreno !== undefined ? datos.IdTerreno.LinkFichasVenta : '')
                .replace('{LinkMemoriaAcabados}', datos.IdTerreno !== undefined ? datos.IdTerreno.LinkMemoriaAcabados : '')
                .replace('{LinkFichasDesarrollo}', datos.IdTerreno !== undefined ? datos.IdTerreno.LinkFichasDesarrollo : '')
                .replace('{sitio}', url)
    },
    crearBitacoras: async function(idTarea,terreno, PI, tareaCrear){
        const rootweb = await currentWeb.getParentWeb()
        let websCdV = await rootweb.web.webs()
        let webBitacoras = websCdV[2]
        webBitacoras = await sp.site.openWebById(webBitacoras.Id)
        let json = {}
        if(tareaCrear!== '0'){
            await currentWeb.lists.getByTitle('Tareas').items.getById(parseInt(tareaCrear)).get().then(async(nuevaTarea)=>{
                json.IdProyectoInversionId = PI.ID
                json.IdTareaId = nuevaTarea.ID
                json.NivelId = nuevaTarea.NivelId
                json.IdTerrenoId = terreno.ID
                json.GrupoResponsableId = nuevaTarea.GrupoId
                json.EstatusId = 1
                json.EstatusAnteriorId = 1
                json.Visible = true
                json.Orden = nuevaTarea.Orden
            }).catch(error => {
                alert('ERROR AL INTENTAR OBTENER LOS DATOS DE LA TAREA ' + tareaCrear + ': ' + error)
            })
        }
        if(idTarea === 12){
            const bitacoras = await webBitacoras.web.lists.getByTitle("Bitacora").items
            .filter("Title eq 'BIT.ADT." + terreno.Title + "'")
            .get()
            .catch(error => {
                alert('ERROR AL INTENTAR OBTENER LA BITÁCORA BIT.ADT' + terreno.Title + ': ' + error)
            })

            if(bitacoras.length === 0){
                await currentWeb.lists.getByTitle('Tareas').items.getById(274).get().then(async()=>{
                    const lineaBase = await currentWeb.lists.getByTitle('Fechas objetivo').items
                    .filter("Title eq '" + PI.Title + (!terreno.Title.startsWith('T-') ? "' and Terreno eq '" + terreno.Title : '') + "' and IdActividad eq 13")
                    .get()
                    .catch(error => {
                        alert('ERROR AL INTENTAR OBTENER LOS DATOS DE FECHAS OBJETIVO: ' + error)
                    })

                    if(lineaBase.length >0){
                        if(lineaBase.FechaFinMeta !== undefined){
                            json.LineaBase = lineaBase.FechaFinMeta
                            json.LineaBaseModifico = lineaBase.EditorId
                        }
                    }
                    if(Object.keys(json).length > 0){
                        await CRUD.createListItem(currentWeb, 'Flujo Tareas', json).catch(error => {
                            alert('ERROR AL INSERTAR EN LA LISTA FLUJO TAREAS: ' + error)
                        })
                    }
                }).catch(error => {
                    alert('ERROR AL INTENTAR OBTENER LA TAREA 274: ' + error)
                })
                
                this.crearBitacoraEjecutivo(webBitacoras, PI.Title, terreno.Title, terreno.NombredelTerreno2 )
            }
        }
        else if(idTarea === 188 || idTarea === 189){
            
            if(Object.keys(json).length > 0){
                await CRUD.createListItem(currentWeb, 'Flujo Tareas', json).catch(error => {
                    alert('ERROR AL INSERTAR EN LA LISTA FLUJO TAREAS: ' + error)
                })
            }

            const categorias = await webBitacoras.web.lists.getByTitle("Categoria").items
            .filter("NombreCorto eq 'ARQ' or NombreCorto eq 'EST' or NombreCorto eq 'INS' or NombreCorto eq 'ACB' or NombreCorto eq 'NOR' or NombreCorto eq 'REG'")
            .get().catch(error => {
                alert('ERROR AL INTENTAR OBTENER LAS CATEGORÍAS: ' + error)
            })

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
        await CRUD.createListItem(webBitacoras.web, 'Bitacora', json)
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
                await CRUD.createListItem(webBitacoras.web, 'Incidencia', jsoni)
                .then(async(result)=>{
                    // Objeto para actualizacion de incidencia creada
                    var jsoniu = { "Title": result.data.Title + result.data.Id }
                    await CRUD.updateListItem(webBitacoras.web, "Incidencia", result.data.Id, jsoniu).catch(error=>{
                        alert('ERROR AL ACTUALIZAR LA INCIDENCIA ' + result.data.Id + ': ' + error)
                    })
                }).catch(error => {
                    alert('ERROR AL INTENTAR CREAR LA INCIDENCIA ' + (i + 1) + ': ' + error)
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
            await CRUD.createListItem(webBitacoras.web, 'Bitacora', json)
            .catch(error => {
                alert('ERROR AL INTENTAR CREAR LA BITÁCORA BIT' + categoria.NombreCorto + "." + terreno.Title + ': ' + error)
            })
        })
    },
    obtenerBitacorasInfo: async function(proyectoTitulo, terrenoTitulo){
        const rootweb = await currentWeb.getParentWeb();
        let websCdV = await rootweb.web.webs();
        let webBitacoras = websCdV[2];
        webBitacoras = await sp.site.openWebById(webBitacoras.Id);
        let datos = { bitacoras: [], solucion: [] }

        let bitacorasInfo = await webBitacoras.web.lists.getByTitle('Incidencia').items
        .filter("(BitacoraInc/TerrenoBit eq '" + proyectoTitulo + "') or (BitacoraInc/TerrenoBit eq '" + terrenoTitulo + "')")
        .select('ID', 'Title', 'EdoInc', 'MotivoCausaInc/Title', 'BitacoraInc/ID', 'BitacoraInc/Title', 'BitacoraInc/TerrenoBit',
                'MotivoCausaInc/ID', 'AreaAsignadaInc/NombreCorto', 'AsignadoAInc/ID', 'AsignadoAInc/Title',
                'Favoritos/ID', 'Favoritos/Name',)
        .expand('MotivoCausaInc', 'BitacoraInc', 'AreaAsignadaInc', 'AsignadoAInc', 'Favoritos')
        .top(100)
        .get()
        .catch(error => {
            alert('ERROR AL INTENTAR OBTENER LAS INCIDENCIAS DEL TERRENO ' + terrenoTitulo + ': ' + error)
        })

        bitacorasInfo.map((bitacora)=>{
            bitacora.Lista = 'Incidencia'
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
        .catch(error => {
            alert('ERROR AL INTENTAR OBTENER LOS DATOS DE LAS SOLUCIONES: ' + error)
        })

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
            case 'Rechazada':
                return 'Rechazado'
            case 'Aprobado':
            case 'Cerrada':
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
                await CRUD.updateListItem(currentWeb, "Flujo Tareas", idFlujoTarea, {EstatusId: 3,EstatusAnteriorId: 3}).then(()=>{
                    actualizado = true
                }).catch(error=>{
                    alert('ERROR AL ACTUALIZAR EL SUBCLÚSTER DEL FLUJO ' + idFlujoTarea + ': ' + error)
                })
            }
        }
        return actualizado
    },
    filtrarDatosPorColumna: function (columna, filtrosTabla, datosFiltrados) {
        switch (columna) {
            case 'responsable':
                if(filtrosTabla[columna].length > 0){
                    datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                        return filtrosTabla[columna].includes(datoFiltrado.GrupoResponsable.NombreCortoGantt)
                    })
                }
                break;
            case 'asignadoa':
                let valores = []
                if(filtrosTabla[columna].length > 0){
                    datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                        return datoFiltrado.AsignadoA !== undefined ? datoFiltrado.AsignadoA.filter((x) => { return filtrosTabla[columna].includes(x.Title) ? valores.push(datoFiltrado) : null }) : null
                    })
                    datosFiltrados = valores
                }
                break;
            case 'lineabase':
                if(filtrosTabla[columna].length > 0){
                    datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                        return datoFiltrado.LineaBase !== null ? (filtrosTabla[columna].includes(util.spDate(datoFiltrado.LineaBase)) ? util.spDate(datoFiltrado.LineaBase) : null) : null
                    })
                }
                break;
            case 'festimada':
                if(filtrosTabla[columna].length > 0){
                    datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                        return datoFiltrado.FechaEstimada !== null ? (filtrosTabla[columna].includes(util.spDate(datoFiltrado.FechaEstimada)) ? util.spDate(datoFiltrado.FechaEstimada) : null) : null
                    })
                }
                break;
            case 'estatus':
                if(filtrosTabla[columna].length > 0){
                    datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                        return filtrosTabla[columna].includes(datoFiltrado.Estatus.Title)
                    })
                }
                break;
            default:
                break;
        }
        return datosFiltrados
    },
    filtrarDatos: function(datosFiltrados, columna, valor, tipo){
        switch (columna) {
            case 'responsable':
                if(tipo === 'N'){
                    datosFiltrados = datosFiltrados.filter(datoFiltrado => datoFiltrado.GrupoResponsable.NombreCortoGantt === valor)
                }else if(tipo === 'B'){
                    datosFiltrados = datosFiltrados.filter(datoFiltrado => datoFiltrado.AreaAsignadaInc.NombreCorto === valor)
                }else if(tipo === 'M'){
                    datosFiltrados = datosFiltrados.filter(datoFiltrado => datoFiltrado.GrupoResponsable.NombreCortoGantt === valor && datoFiltrado.Visible)
                }
                break;
            case 'asignadoa':
                let valores = []
                if(tipo === 'N'){
                    datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                        return datoFiltrado.AsignadoA !== undefined ? datoFiltrado.AsignadoA.filter((x) => { return x.Title.includes(valor) ? valores.push(datoFiltrado) : null }) : null
                    })
                }else if(tipo === 'B'){
                    datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                        return datoFiltrado.AsignadoA !== undefined ? datoFiltrado.AsignadoA.filter((x) => { return x.Title.includes(valor) ? valores.push(datoFiltrado) : null }) : null
                    })
                }else if(tipo === 'N'){
                    datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                        return datoFiltrado.AsignadoA !== undefined && datoFiltrado.Visible ? datoFiltrado.AsignadoA.filter((x) => { return x.Title.includes(valor) ? valores.push(datoFiltrado) : null }) : null
                    })
                }
                datosFiltrados = valores
                break;
            case 'lineabase':
                if(tipo === 'N'){
                    datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                        return datoFiltrado.LineaBase !== null ? (valor.includes(util.spDate(datoFiltrado.LineaBase)) ? util.spDate(datoFiltrado.LineaBase) : null) : null
                    })
                }else if(tipo === 'B'){
                    datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                        return datoFiltrado.LineaBase !== null ? (valor.includes(util.spDate(datoFiltrado.LineaBase)) ? util.spDate(datoFiltrado.LineaBase) : null) : null
                    })
                }else if(tipo === 'M'){
                    datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                        return datoFiltrado.LineaBase !== null && datoFiltrado.Visible ? (valor.includes(util.spDate(datoFiltrado.LineaBase)) ? util.spDate(datoFiltrado.LineaBase) : null) : null
                    })
                }
                break;
            case 'festimada':
                if(tipo === 'N'){
                    datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                        return datoFiltrado.FechaEstimada !== null ? (valor.includes(util.spDate(datoFiltrado.FechaEstimada)) ? util.spDate(datoFiltrado.FechaEstimada) : null) : null
                    })
                }else if(tipo === 'M'){
                    datosFiltrados = datosFiltrados.filter((datoFiltrado) => {
                        return datoFiltrado.FechaEstimada !== null && datoFiltrado.Visible ? (valor.includes(util.spDate(datoFiltrado.FechaEstimada)) ? util.spDate(datoFiltrado.FechaEstimada) : null) : null
                    })
                }
                break;
            case 'estatus':
                if(tipo === 'N'){
                    datosFiltrados = datosFiltrados.filter(datoFiltrado=> datoFiltrado.Estatus.Title == valor)
                }else if(tipo === 'B'){
                    datosFiltrados = datosFiltrados.filter(datoFiltrado=> datoFiltrado.EdoInc == valor)
                }else if(tipo === 'M'){
                    datosFiltrados = datosFiltrados.filter(datoFiltrado=> datoFiltrado.Estatus.Title == valor && datoFiltrado.Visible)
                }
                break;
            default:
                break;
        }
        return datosFiltrados
    },
    obtenerTotalPorVentana: function (idVentana, datos, datosFPT, datosBit) {
        let total= 0
        let datosCdTFiltrados = []
        switch(idVentana){
            case 1:
                datosCdTFiltrados = datos.filter(x=> (x.Orden >= idVentana && x.Orden < (idVentana +1)) && x.IdTarea.EsSubcluster === '0')
                datosCdTFiltrados.forEach((datoCdT)=>{
                    total = datosFPT.some(x=> x.IdFlujoId === datoCdT.ID && (x.Estatus.ID === 4 || x.Estatus.ID === 5)) ? total + 1 : total
                })
                return total += datosCdTFiltrados.filter(x=> x.Estatus.ID === 4 || x.Estatus.ID === 5).length
            case 2:
            case 3:
                datosCdTFiltrados = datos.filter(x=> (x.Orden >= idVentana && x.Orden < (idVentana +1)) && x.IdTarea.EsSubcluster === '0')
                datosCdTFiltrados.forEach((datoCdT)=>{
                    total = datosFPT.some(x=> x.IdFlujoId === datoCdT.ID && (x.Estatus.ID === 4 || x.Estatus.ID === 5)) ? total + 1 : total
                })
                if(idVentana === 3){
                    total += datosBit.filter(x=> x.EdoInc === 'Rechazado' || x.EdoInc === 'Vencido').length
                }
                return total += datosCdTFiltrados.filter(x=> x.Estatus.ID === 4 || x.Estatus.ID === 5).length
        }
    },
    establecerLineaBaseBit: function(datosSolucion, datosBit){
        return datosBit.map((bit)=>{
            const thisDate = datosSolucion.filter(x => x.IncidenciaSol.ID === bit.ID);
            const date = thisDate.length > 0 ? thisDate[0].FechaCompSol : null;
            bit.LineaBase = date

            return bit
        })
    },
    actualizarPropiedadesEstatus: function(dataSource, columnaBuscar, datoBuscar, columnaAsignar, datoAsignar){
        const filaIndice = dataSource.findIndex(datos => datos[columnaBuscar] === datoBuscar)
        let newData = dataSource[filaIndice]
        newData[columnaAsignar] = datoAsignar

        return {indice: filaIndice, dato: newData}
    },
    generarFiltrosEncabezado: function(idVentana, datosCdT, datosFPT, datosBit, gruposUsuarioActual, usuarioActual, filtrosTabla){
        if(idVentana !== 4){
            //let strGruposUsuarioActual = gruposUsuarioActual.filter(x => x.AdminAreaGanttId.includes(usuarioActual) && x.NombreCortoGantt !== 'EG')
            let strGruposUsuarioActual = gruposUsuarioActual.filter(x => (x.AdminAreaGanttId.includes(usuarioActual) || x.RespAreaGanttId.includes(usuarioActual) || x.NombreCortoGantt === 'TODOS') && x.NombreCortoGantt !== 'EG')
            strGruposUsuarioActual = strGruposUsuarioActual.map((x)=> { return x.NombreCortoGantt}).join(',')
            let datosVentana = datosCdT.datos.filter(x=> x.Orden >= idVentana && x.Orden < idVentana + 1)
            let filtros = {
                responsable: [],
                asignadoa: [],
                lineabase: [],
                festimada: [],
                estatus: []
            }
            datosVentana.forEach((item)=>{
                const permitido = filtrosTabla.ver.length > 0 ? true : (strGruposUsuarioActual.includes(item.GrupoResponsable.NombreCortoGantt) || this.obtenerIdAsignados(item.AsignadoA).results.includes(usuarioActual) ? true : false)
                if(item.GrupoResponsable !== undefined){
                    if (filtrosTabla.ver.length > 0){
                        if(!filtros.responsable.includes(item.GrupoResponsable.NombreCortoGantt)){
                            filtros.responsable.push(item.GrupoResponsable.NombreCortoGantt)
                        }
                    }else if(permitido){
                        if(!filtros.responsable.includes(item.GrupoResponsable.NombreCortoGantt)){
                            filtros.responsable.push(item.GrupoResponsable.NombreCortoGantt)
                        }
                    }
                }
                
                if(item.AsignadoA !== undefined){
                    const asignados = this.obtenerAsignados(item.AsignadoA)
                    if (filtrosTabla.ver.length > 0){
                        asignados.forEach((itemAsignado)=>{
                            if(!filtros.asignadoa.includes(itemAsignado)){
                                filtros.asignadoa.push(itemAsignado)
                            }
                        })
                    }else if(permitido){
                        asignados.forEach((itemAsignado)=>{
                            if(!filtros.asignadoa.includes(itemAsignado)){
                                filtros.asignadoa.push(itemAsignado)
                            }
                        })
                    }
                }
                if(item.LineaBase !== null){
                    if (filtrosTabla.ver.length > 0){
                        if(!filtros.lineabase.includes(this.spDate(item.LineaBase))){
                            filtros.lineabase.push(this.spDate(item.LineaBase))
                        }
                    }else if(permitido){
                        if(!filtros.lineabase.includes(this.spDate(item.LineaBase))){
                            filtros.lineabase.push(this.spDate(item.LineaBase))
                        }
                    }
                }
                if(item.FechaEstimada !== null){
                    if (filtrosTabla.ver.length > 0){
                        if(!filtros.festimada.includes(this.spDate(item.FechaEstimada))){
                            filtros.festimada.push(this.spDate(item.FechaEstimada))
                        }
                    }else if(permitido){
                        if(!filtros.festimada.includes(this.spDate(item.FechaEstimada))){
                            filtros.festimada.push(this.spDate(item.FechaEstimada))
                        }
                    }
                }
                if(item.Estatus !== undefined){
                    if (filtrosTabla.ver.length > 0){
                        if(!filtros.estatus.includes(item.Estatus.Title)){
                            filtros.estatus.push(item.Estatus.Title)
                        }
                    }else if(permitido){
                        if(!filtros.estatus.includes(item.Estatus.Title)){
                            filtros.estatus.push(item.Estatus.Title)
                        }
                    }
                }

                const datosFPTPorId = datosFPT.filter(x=> x.IdFlujoId === item.ID)
                datosFPTPorId.forEach((datoFPT) =>{
                    if(datoFPT.GrupoResponsable !== undefined){
                        if (filtrosTabla.ver.length > 0){
                            if(!filtros.responsable.includes(datoFPT.GrupoResponsable.NombreCortoGantt)){
                                filtros.responsable.push(datoFPT.GrupoResponsable.NombreCortoGantt)
                            }
                        }else if(permitido){
                            if(!filtros.responsable.includes(datoFPT.GrupoResponsable.NombreCortoGantt)){
                                filtros.responsable.push(datoFPT.GrupoResponsable.NombreCortoGantt)
                            }
                        }
                    }
                    if(datoFPT.AsignadoA !== undefined){
                        const asignados = this.obtenerAsignados(datoFPT.AsignadoA)
                        if (filtrosTabla.ver.length > 0){
                            asignados.forEach((itemAsignado)=>{
                                if(!filtros.asignadoa.includes(itemAsignado)){
                                    filtros.asignadoa.push(itemAsignado)
                                }
                            })
                        }else if(permitido){
                            asignados.forEach((itemAsignado)=>{
                                if(!filtros.asignadoa.includes(itemAsignado)){
                                    filtros.asignadoa.push(itemAsignado)
                                }
                            })
                        }
                    }
                    if(datoFPT.LineaBase !== null){
                        if (filtrosTabla.ver.length > 0){
                            if(!filtros.lineabase.includes(this.spDate(datoFPT.LineaBase))){
                                filtros.lineabase.push(this.spDate(datoFPT.LineaBase))
                            }
                        }else if(permitido){
                            if(!filtros.lineabase.includes(this.spDate(datoFPT.LineaBase))){
                                filtros.lineabase.push(this.spDate(datoFPT.LineaBase))
                            }
                        }
                    }
                    if(datoFPT.FechaEstimada !== null){
                        if (filtrosTabla.ver.length > 0){
                            if(!filtros.festimada.includes(this.spDate(datoFPT.FechaEstimada))){
                                filtros.festimada.push(this.spDate(datoFPT.FechaEstimada))
                            }
                        }else if(permitido){
                            if(!filtros.festimada.includes(this.spDate(datoFPT.FechaEstimada))){
                                filtros.festimada.push(this.spDate(datoFPT.FechaEstimada))
                            }
                        }
                    }
                    if(datoFPT.Estatus !== undefined){
                        if (filtrosTabla.ver.length > 0){
                            if(!filtros.estatus.includes(datoFPT.Estatus.Title)){
                                filtros.estatus.push(datoFPT.Estatus.Title)
                            }
                        }else if(permitido){
                            if(!filtros.estatus.includes(datoFPT.Estatus.Title)){
                                filtros.estatus.push(datoFPT.Estatus.Title)
                            }
                        }
                    }
                })
            })

            if(idVentana === 3){
                datosBit.forEach((itemBit) =>{
                    const permitido = strGruposUsuarioActual.includes(itemBit.AreaAsignadaInc.NombreCorto) || this.obtenerIdAsignados(itemBit.AsignadoAInc).results.includes(usuarioActual) ? true : false
                    if(itemBit.AreaAsignadaInc !== undefined){
                        if (filtrosTabla.ver.length > 0){
                            if(!filtros.responsable.includes(itemBit.AreaAsignadaInc.NombreCorto)){
                                filtros.responsable.push(itemBit.AreaAsignadaInc.NombreCorto)
                            }
                        }else if(permitido){
                            if(!filtros.responsable.includes(itemBit.AreaAsignadaInc.NombreCorto)){
                                filtros.responsable.push(itemBit.AreaAsignadaInc.NombreCorto)
                            }
                        }
                    }
                        
                    if(itemBit.AsignadoA !== undefined){
                        const asignados = this.obtenerAsignados(itemBit.AsignadoAInc)
                        if (filtrosTabla.ver.length > 0){
                            asignados.forEach((itemAsignado)=>{
                                if(!filtros.asignadoa.includes(itemAsignado)){
                                    filtros.asignadoa.push(itemAsignado)
                                }
                            })
                        }else if(permitido){
                            asignados.forEach((itemAsignado)=>{
                                if(!filtros.asignadoa.includes(itemAsignado)){
                                    filtros.asignadoa.push(itemAsignado)
                                }
                            })
                        }
                    }
                    if(itemBit.LineaBase !== null){
                        if (filtrosTabla.ver.length > 0){
                            if(!filtros.lineabase.includes(this.spDate(itemBit.LineaBase))){
                                filtros.lineabase.push(this.spDate(itemBit.LineaBase))
                            }
                        }else if(permitido){
                            if(!filtros.lineabase.includes(this.spDate(itemBit.LineaBase))){
                                filtros.lineabase.push(this.spDate(itemBit.LineaBase))
                            }
                        }
                    }
                    if(itemBit.EdoInc !== null){
                        if (filtrosTabla.ver.length > 0){
                            if(!filtros.estatus.includes(itemBit.EdoInc)){
                                filtros.estatus.push(itemBit.EdoInc)
                            }
                        }else if(permitido){
                            if(!filtros.estatus.includes(itemBit.EdoInc)){
                                filtros.estatus.push(itemBit.EdoInc)
                            }
                        }
                    }
                })
            }
            return filtros
        }else{
            let filtros = {
                responsable: [],
                asignadoa: []
            }

            datosCdT.datos.forEach((item)=>{
                if(item.GrupoResponsable !== undefined){
                    if(!filtros.responsable.includes(item.GrupoResponsable.NombreCortoGantt)){
                        filtros.responsable.push(item.GrupoResponsable.NombreCortoGantt)
                    }
                }
                if(item.AsignadoA !== undefined){
                    const asignados = this.obtenerAsignados(item.AsignadoA)
                    asignados.forEach((itemAsignado)=>{
                        if(!filtros.asignadoa.includes(itemAsignado)){
                            filtros.asignadoa.push(itemAsignado)
                        }
                    })
                }
            })
            return filtros
        }
    },
    actualizarFiltrosEncabezado: function(idVentana, datosCdT, datosFPT, datosBit, filtroOmitir, filtrosOriginales){
        if(idVentana !== 4){
            let filtros = {
                responsable: filtroOmitir !== 'responsable' ? [] : filtrosOriginales.responsable,
                asignadoa: filtroOmitir !== 'asignadoa' ? [] : filtrosOriginales.asignadoa,
                lineabase: filtroOmitir !== 'lineabase' ? [] : filtrosOriginales.lineabase,
                festimada: filtroOmitir !== 'festimada' ? [] : filtrosOriginales.festimada,
                estatus: filtroOmitir !== 'estatus' ? [] : filtrosOriginales.estatus
            }

            datosCdT.datos.forEach((item)=>{
                if(filtroOmitir !== 'responsable'){
                    if(!filtros.responsable.includes(item.GrupoResponsable.NombreCortoGantt)){
                        filtros.responsable.push(item.GrupoResponsable.NombreCortoGantt)
                    }
                }
                if(filtroOmitir !== 'asignadoa'){
                    if(item.AsignadoA !== undefined){
                        const asignados = this.obtenerAsignados(item.AsignadoA)
                        asignados.forEach((itemAsignado)=>{
                            if(!filtros.asignadoa.includes(itemAsignado)){
                                filtros.asignadoa.push(itemAsignado)
                            }
                        })
                    }
                }
                if(filtroOmitir !== 'lineabase'){
                    if(item.LineaBase !== null){
                        if(!filtros.lineabase.includes(this.spDate(item.LineaBase))){
                            filtros.lineabase.push(this.spDate(item.LineaBase))
                        }
                    }
                }
                if(filtroOmitir !== 'festimada'){
                    if(item.FechaEstimada !== null){
                        if(!filtros.festimada.includes(this.spDate(item.FechaEstimada))){
                            filtros.festimada.push(this.spDate(item.FechaEstimada))
                        }
                    }
                }
                if(filtroOmitir !== 'estatus'){
                    if(!filtros.estatus.includes(item.Estatus.Title)){
                        filtros.estatus.push(item.Estatus.Title)
                    }
                }

                const datosFPTPorId = datosFPT.filter(x=> x.IdFlujoId === item.ID)
                datosFPTPorId.forEach((datoFPT)=>{
                    if(filtroOmitir !== 'responsable'){
                        if(!filtros.responsable.includes(datoFPT.GrupoResponsable.NombreCortoGantt)){
                            filtros.responsable.push(datoFPT.GrupoResponsable.NombreCortoGantt)
                        }
                    }
                    if(filtroOmitir !== 'asignadoa'){
                        if(datoFPT.AsignadoA !== undefined){
                            const asignados = this.obtenerAsignados(datoFPT.AsignadoA)
                            asignados.forEach((itemAsignado)=>{
                                if(!filtros.asignadoa.includes(itemAsignado)){
                                    filtros.asignadoa.push(itemAsignado)
                                }
                            })
                        }
                    }
                    if(filtroOmitir !== 'lineabase'){
                        if(datoFPT.LineaBase !== null){
                            if(!filtros.lineabase.includes(this.spDate(datoFPT.LineaBase))){
                                filtros.lineabase.push(this.spDate(datoFPT.LineaBase))
                            }
                        }
                    }
                    if(filtroOmitir !== 'festimada'){
                        if(datoFPT.FechaEstimada !== null){
                            if(!filtros.festimada.includes(this.spDate(datoFPT.FechaEstimada))){
                                filtros.festimada.push(this.spDate(datoFPT.FechaEstimada))
                            }
                        }
                    }
                    if(filtroOmitir !== 'estatus'){
                        if(!filtros.estatus.includes(datoFPT.Estatus.Title)){
                            filtros.estatus.push(datoFPT.Estatus.Title)
                        }
                    }
                })
            })


            if(idVentana === 3){
                datosBit.forEach((itemBit) =>{
                    if(filtroOmitir !== 'responsable'){
                        if(!filtros.responsable.includes(itemBit.AreaAsignadaInc.NombreCorto)){
                            filtros.responsable.push(itemBit.AreaAsignadaInc.NombreCorto)
                        }
                    }
                        
                    if(filtroOmitir !== 'asignadoa'){
                        if(itemBit.AsignadoAInc !== undefined){
                            const asignados = this.obtenerAsignados(itemBit.AsignadoAInc)
                            asignados.forEach((itemAsignado)=>{
                                if(!filtros.asignadoa.includes(itemAsignado)){
                                    filtros.asignadoa.push(itemAsignado)
                                }
                            })
                        }
                    }
                    
                    if(filtroOmitir !== 'lineabase'){
                        if(itemBit.LineaBase !== null){
                            if(!filtros.lineabase.includes(this.spDate(itemBit.LineaBase))){
                                filtros.lineabase.push(this.spDate(itemBit.LineaBase))
                            }
                        }
                    }

                    if(filtroOmitir !== 'estatus'){
                        if(!filtros.estatus.includes(itemBit.EdoInc)){
                            filtros.estatus.push(itemBit.EdoInc)
                        }
                    }
                })
            }
            return filtros
        }else{
            let filtros = {
                responsable: filtroOmitir !== 'responsable' ? [] : filtrosOriginales.responsable,
                asignadoa: filtroOmitir !== 'asignadoa' ? [] : filtrosOriginales.asignadoa
            }

            datosCdT.datos.forEach((item)=>{
                if(filtroOmitir !== 'responsable'){
                    if(!filtros.responsable.includes(item.GrupoResponsable.NombreCortoGantt)){
                        filtros.responsable.push(item.GrupoResponsable.NombreCortoGantt)
                    }
                }
                if(filtroOmitir !== 'asignadoa'){
                    if(item.AsignadoA !== undefined){
                        const asignados = this.obtenerAsignados(item.AsignadoA)
                        asignados.forEach((itemAsignado)=>{
                            if(!filtros.asignadoa.includes(itemAsignado)){
                                filtros.asignadoa.push(itemAsignado)
                            }
                        })
                    }
                }
            })
            return filtros
        }
    },
    filtrarPorFavsGanttTodos: function(idVentana, datos, filtro, tipo, usuarioActual, gruposUsuarioActual, filtrosTabla){
        //let strGruposUsuarioActual = gruposUsuarioActual.filter(x => x.AdminAreaGanttId.includes(usuarioActual) && x.NombreCortoGantt !== 'EG')
        let strGruposUsuarioActual = gruposUsuarioActual.filter(x => (x.AdminAreaGanttId.includes(usuarioActual.Id) || x.RespAreaGanttId.includes(usuarioActual.Id) || x.NombreCortoGantt === 'TODOS') && x.NombreCortoGantt !== 'EG')
        strGruposUsuarioActual = strGruposUsuarioActual.map((x)=> { return x.NombreCortoGantt}).join(',')
        let datosFiltrados = []
        switch(filtro){
            case 'favs':
                if(tipo !== 'B'){
                    datosFiltrados = datos.filter(x=> this.contieneAsignadoA(x.Favoritos, usuarioActual.Id) && (filtrosTabla.ver.length > 0 || (strGruposUsuarioActual.includes(x.GrupoResponsable.NombreCortoGantt) || this.obtenerIdAsignados(x.AsignadoA).results.includes(usuarioActual))))
                }else{
                    datosFiltrados = datos.filter(x=> this.contieneAsignadoA(x.Favoritos, usuarioActual.Id) && (filtrosTabla.ver.length > 0 || (strGruposUsuarioActual.includes(x.AreaAsignadaInc.NombreCorto) || this.obtenerIdAsignados(x.AsignadoAInc).results.includes(usuarioActual))))
                }
                break;
            case 'gantt':
                if(idVentana === 4){
                    if(tipo === 'N'){
                        datos.forEach((dato)=>{
                            if(dato.IdRCDTT === undefined){
                                if(dato.Tarea.ExisteEnGantt === '1'){
                                    datosFiltrados.push(dato)
                                }
                            }else{
                                if(dato.IdRCDTT.ExisteEnGantt === '1'){
                                    datosFiltrados.push(dato)
                                }
                            }
                        })
                        /*let datosTramites = datos.filter(x=> x.IdRCDTT !== undefined)
                        datosTramites = datosTramites.filter(x=> x.IdRCDTT.ExisteEnGantt === '1')
                        datosFiltrados = datos.filter(x=> x.Tarea.ExisteEnGantt === '1' && x.IdRCDTT !== undefined)
                        datosFiltrados = datosFiltrados.concat(datosTramites)*/
                    }
                }else{
                    if(tipo === 'N'){
                        datosFiltrados = datos.filter(x=> x.IdTarea.ExisteEnGantt === '1' && (filtrosTabla.ver.length > 0 || (strGruposUsuarioActual.includes(x.GrupoResponsable.NombreCortoGantt) || this.obtenerIdAsignados(x.AsignadoA).results.includes(usuarioActual))))
                    }else if(tipo === 'T'){
                        datosFiltrados = datos.filter(x=> x.IdDocTramite.ExisteEnGantt === '1' && (filtrosTabla.ver.length > 0 || (strGruposUsuarioActual.includes(x.GrupoResponsable.NombreCortoGantt) || this.obtenerIdAsignados(x.AsignadoA).results.includes(usuarioActual))))
                    }else if(tipo === 'M'){
                        datosFiltrados = datos.filter(x=> x.Visible && (filtrosTabla.ver.length > 0 || (strGruposUsuarioActual.includes(x.GrupoResponsable.NombreCortoGantt) || this.obtenerIdAsignados(x.AsignadoA).results.includes(usuarioActual))))
                    }
                }
                break;
            case 'ver':
                datosFiltrados = datos
                break;
            default:
                break;
        }
        return datosFiltrados
    },
    accionFiltrado: function(idVentana, datosOriginales, MktOriginal, datosOriginalesFPT, bitacorasInfoOriginales, filtrosTabla, columna, valor, filtrosTablaOrden, opcionesFiltrosEncabezado, opcionesFiltrosEncabezadoOriginal, gruposUsuarioActual, usuarioActual){
        let dataSourceCdT = idVentana === 4 ? datosOriginales : { columnas: datosOriginales.columnas, datos: datosOriginales.datos.filter(x=> x.Orden >= idVentana && x.Orden < idVentana + 1)}
        let dataSourceMkt = idVentana !== 4 ? MktOriginal : []
        let dataSourceFPT = idVentana !== 4 ? datosOriginalesFPT : []
        let dataSourceBit = idVentana === 3 ? bitacorasInfoOriginales : []
        
        const filtroIndice = filtrosTabla[columna].findIndex(x => x === valor)
        if (filtroIndice === -1) {
            filtrosTabla[columna].push(valor)
            if(columna !== 'ver'){
                filtrosTablaOrden.push({ id: columna + ':' + valor, columna: columna, valor: valor })
            }else{
                filtrosTablaOrden.splice(0, 0, { id: columna + ':' + valor, columna: columna, valor: valor })
            }
        }
        else {
            filtrosTabla[columna] = filtrosTabla[columna].filter(x=> x !== valor)
            filtrosTablaOrden = filtrosTablaOrden.filter(x=> x.id !== columna + ':' + valor)
        }

        let datosFiltrados = {columnas: dataSourceCdT.columnas, datos: []}
        let datosFiltradosMkt = []
        let datosFiltradosFPT = []
        let datosFiltradosBit = []
        let cambioFiltro = false
        if(filtrosTablaOrden.length> 0){
            filtrosTablaOrden.forEach((filtroTabla, index)=>{
                if(index === 0){
                    if(filtroTabla.columna === 'favs' || filtroTabla.columna === 'gantt' || filtroTabla.columna === 'ver'){
                        datosFiltrados.datos = datosFiltrados.datos.concat(this.filtrarPorFavsGanttTodos(idVentana, dataSourceCdT.datos, filtroTabla.columna, 'N', usuarioActual, gruposUsuarioActual, filtrosTabla))
                        datosFiltradosMkt = datosFiltradosMkt.concat(this.filtrarPorFavsGanttTodos(idVentana, dataSourceMkt, filtroTabla.columna, 'M', usuarioActual, gruposUsuarioActual, filtrosTabla))
                        datosFiltradosFPT = datosFiltradosFPT.concat(this.filtrarPorFavsGanttTodos(idVentana, dataSourceFPT, filtroTabla.columna, 'T', usuarioActual, gruposUsuarioActual, filtrosTabla))
                        datosFiltradosBit = datosFiltradosBit.concat(this.filtrarPorFavsGanttTodos(idVentana, dataSourceBit, filtroTabla.columna, 'B', usuarioActual, gruposUsuarioActual, filtrosTabla))
                        opcionesFiltrosEncabezado = this.actualizarFiltrosEncabezado(idVentana, datosFiltrados, datosFiltradosFPT, datosFiltradosBit, filtroTabla.columna, opcionesFiltrosEncabezadoOriginal)
                    }else{
                        datosFiltrados.datos = datosFiltrados.datos.concat(this.filtrarDatos(dataSourceCdT.datos, filtroTabla.columna, filtroTabla.valor, 'N'))
                        datosFiltradosMkt = datosFiltradosMkt.concat(this.filtrarDatos(dataSourceMkt, filtroTabla.columna, filtroTabla.valor, 'M'))
                        datosFiltradosFPT = datosFiltradosFPT.concat(this.filtrarDatos(dataSourceFPT, filtroTabla.columna, filtroTabla.valor, 'N'))
                        datosFiltradosBit = datosFiltradosBit.concat(this.filtrarDatos(dataSourceBit, filtroTabla.columna, filtroTabla.valor, 'B'))
                        opcionesFiltrosEncabezado = this.actualizarFiltrosEncabezado(idVentana, datosFiltrados, datosFiltradosFPT, datosFiltradosBit, filtroTabla.columna, opcionesFiltrosEncabezadoOriginal)
                    }
                }else{
                    //if(filtroTabla.columna === filtrosTablaOrden[index -1].columna && !cambioFiltro){
                    if(filtroTabla.columna === filtrosTablaOrden[index -1].columna){
                        if(filtroTabla.columna === 'favs' || filtroTabla.columna === 'gantt' || filtroTabla.columna === 'ver'){
                            datosFiltrados.datos = datosFiltrados.datos.concat(this.filtrarPorFavsGanttTodos(idVentana, dataSourceCdT.datos, filtroTabla.columna, 'N', usuarioActual, gruposUsuarioActual, filtrosTabla))
                            datosFiltradosMkt = datosFiltradosMkt.concat(this.filtrarPorFavsGanttTodos(idVentana, dataSourceMkt, filtroTabla.columna, 'M', usuarioActual, gruposUsuarioActual, filtrosTabla))
                            datosFiltradosFPT = datosFiltradosFPT.concat(this.filtrarPorFavsGanttTodos(idVentana, dataSourceFPT, filtroTabla.columna, 'T', usuarioActual, gruposUsuarioActual, filtrosTabla))
                            datosFiltradosBit = datosFiltradosBit.concat(this.filtrarPorFavsGanttTodos(idVentana, dataSourceBit, filtroTabla.columna, 'B', usuarioActual, gruposUsuarioActual, filtrosTabla))
                            opcionesFiltrosEncabezado = this.actualizarFiltrosEncabezado(idVentana, datosFiltrados, datosFiltradosFPT, datosFiltradosBit, filtroTabla.columna, opcionesFiltrosEncabezadoOriginal)
                        }else{
                            datosFiltrados.datos = datosFiltrados.datos.concat(this.filtrarDatos(dataSourceCdT.datos, filtroTabla.columna, filtroTabla.valor, 'N'))
                            datosFiltradosMkt = datosFiltradosMkt.concat(this.filtrarDatos(dataSourceMkt, filtroTabla.columna, filtroTabla.valor, 'M'))
                            datosFiltradosFPT = datosFiltradosFPT.concat(this.filtrarDatos(dataSourceFPT, filtroTabla.columna, filtroTabla.valor, 'N'))
                            datosFiltradosBit = datosFiltradosBit.concat(this.filtrarDatos(dataSourceBit, filtroTabla.columna, filtroTabla.valor, 'B'))
                            opcionesFiltrosEncabezado = this.actualizarFiltrosEncabezado(idVentana, datosFiltrados, datosFiltradosFPT, datosFiltradosBit, filtroTabla.columna, opcionesFiltrosEncabezadoOriginal)
                        }
                    }else{
                        cambioFiltro = true
                        datosFiltrados.datos = this.filtrarDatos(datosFiltrados.datos, filtroTabla.columna, filtroTabla.valor, 'N')
                        datosFiltradosMkt = this.filtrarDatos(dataSourceMkt, filtroTabla.columna, filtroTabla.valor, 'M')
                        datosFiltradosFPT = this.filtrarDatos(datosFiltradosFPT, filtroTabla.columna, filtroTabla.valor, 'N')
                        datosFiltradosBit = this.filtrarDatos(dataSourceBit, filtroTabla.columna, filtroTabla.valor, 'B')
                        opcionesFiltrosEncabezado = this.actualizarFiltrosEncabezado(idVentana, datosFiltrados, datosFiltradosFPT, datosFiltradosBit, filtroTabla.columna, opcionesFiltrosEncabezado)
                    }
                }
            })

            datosFiltrados.datos = datosFiltrados.datos.concat(this.agregarTareasCluster(datosFiltradosMkt, dataSourceCdT.datos, 'M'))
            datosFiltrados.datos = datosFiltrados.datos.concat(this.agregarTareasCluster(datosFiltradosFPT, dataSourceCdT.datos, 'T'))
            datosFiltrados.datos = datosFiltrados.datos.concat(this.agregarTareasCluster(datosFiltradosBit, dataSourceCdT.datos, 'B'))

            datosFiltrados.datos = this.reduceArreglo(datosFiltrados.datos)
            datosFiltradosMkt = this.reduceArreglo(datosFiltradosMkt)
            datosFiltradosFPT = this.reduceArreglo(datosFiltradosFPT)
            datosFiltradosBit = this.reduceArreglo(datosFiltradosBit)
        }else{
            datosFiltrados = dataSourceCdT
            datosFiltradosFPT = dataSourceFPT
            datosFiltradosBit = dataSourceBit
            datosFiltradosMkt = dataSourceMkt

            opcionesFiltrosEncabezado = this.generarFiltrosEncabezado(idVentana, datosFiltrados, datosFiltradosFPT, datosFiltradosBit, gruposUsuarioActual, usuarioActual.Id, filtrosTabla)
        }
        
        return { datosVentana: datosFiltrados, filtrosTabla: filtrosTabla, datosFPT : datosFiltradosFPT, Mkt: datosFiltradosMkt, opcionesFiltrosEncabezado: opcionesFiltrosEncabezado, filtrosTablaOrden: filtrosTablaOrden }
    },
    agregarTareasCluster: function(dataSourceOrigen, datosCdT, tipo){
        let datos = []
        dataSourceOrigen.forEach((item)=>{
            if(tipo === 'T'){
                const dato = datosCdT.find(x=> x.ID === item.IdFlujoId)
                if(dato !== undefined){
                    if(!datos.some(x=> x.ID === dato.ID)){
                        datos.push(dato)
                    }
                }
            }
            else if(tipo === 'M'){
                if(dataSourceOrigen.some(x=> x.IdTarea.Subcluster === 'Entrega para diseño de material de ventas')){
                    const dato = datosCdT.find(x=> x.IdTarea.ID === 287)
                    if(dato !== undefined){
                        if(!datos.some(x=> x.ID === dato.ID)){
                            datos.push(dato)
                        }
                    }
                }
                if(dataSourceOrigen.some(x=> x.IdTarea.Subcluster === 'Material de ventas fabricado	')){
                    const dato = datosCdT.find(x=> x.IdTarea.ID === 288)
                    if(dato !== undefined){
                        if(!datos.some(x=> x.ID === dato.ID)){
                            datos.push(dato)
                        }
                    }
                }
            }else if(tipo === 'B'){
                if(dataSourceOrigen.some(x=> x.BitacoraInc.Title.includes('BIT.ADU.'))){
                    const dato = datosCdT.find(x=> x.IdTarea.ID === 273)
                    if(dato !== undefined){
                        if(!datos.some(x=> x.ID === dato.ID)){
                            datos.push(dato)
                        }
                    }
                }
                if(dataSourceOrigen.some(x=> x.BitacoraInc.Title.includes('BIT.ADT.'))){
                    const dato = datosCdT.find(x=> x.IdTarea.ID === 274)
                    if(dato !== undefined){
                        if(!datos.some(x=> x.ID === dato.ID)){
                            datos.push(dato)
                        }
                    }
                }
            }
        })
        return datos
    },
    reduceArreglo: function(dataSource){
        const uniqByProp = prop => arr =>
        Object.values(
            arr.reduce(
            (acc, item) => item && item[prop] ? { ...acc, [item[prop]]: item } : acc, {})
        );

        const uniqueById = uniqByProp("ID");
        return uniqueById(dataSource);
    }
}
export default util;