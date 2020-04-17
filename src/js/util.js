import favoritos_icon from '../imagenes/favoritos_icon.png';
import favoritos_icon_clicked from '../imagenes/favoritos_icon_clicked.png';
import "@pnp/sp/site-users/web";

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
                    { titulo: 'Responsable', interN: 'GrupoResponsable', Tipo: "Act", value: 'NombreCortoGantt', Arreglo: arreglo, estilo: 'col-sm-1' },
                    { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "Act", Arreglo: arreglo, estilo: 'col-sm-1' },
                    { titulo: 'Linea base', interN: 'LineaBase', value: 'Title', Tipo: "Act", Arreglo: arreglo, estilo: 'col-sm-1' },
                    { titulo: 'F. estimada', interN: 'FechaEstimada', value: 'Title', Tipo: "Act", Arreglo: arreglo, estilo: 'col-sm-1' },
                    { titulo: 'Estatus', interN: 'Estatus', value: 'Title', Tipo: "Estatus", Arreglo: arreglo, estilo: 'col-sm-1' },
                    { titulo: 'Adjunto', interN: 'Adjunto', value: 'Adjunto', Tipo: "Act", Arreglo: arreglo, estilo: 'col-sm-1' },
                    { titulo: 'Detalle', interN: 'Detalle', value: 'Detalle', Tipo: "Act", Arreglo: arreglo, estilo: 'col-sm-1' },
                    { titulo: 'Favoritos', interN: 'Favoritos', Tipo: "Act", value: 'Favoritos', Arreglo: arreglo, estilo: 'col-sm-1' }
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
            { this.removejscssfile(fileName, "css") }
        }
        var sheet = document.createElement('link');
        sheet.rel = 'stylesheet';
        sheet.href = url;
        sheet.type = 'text/css';
        document.head.appendChild(sheet);
    },

    //Función utilizada para remover las hojas de estilo que no se utilizan al momento de dar clic en cada botón
    removejscssfile: function (filename, filetype) {
        var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "link" : "none" //determine element type to create nodelist from
        var targetattr = (filetype == "js") ? "src" : (filetype == "css") ? "href" : "none" //determine corresponding attribute to test for
        var allsuspects = document.getElementsByTagName(targetelement)
        for (var i = allsuspects.length; i >= 0; i--) { //search backwards within nodelist for matching elements to remove
            if (allsuspects[i] && allsuspects[i].getAttribute(targetattr) != null && allsuspects[i].getAttribute(targetattr).indexOf(filename) != -1)
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

        var state = document.getElementById(id);
        if (state !== null) {
            if (state.style.display == 'block') {
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
                var state = document.getElementById(id + "*");
                if (state.style.display == 'block') {
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
            var state = document.getElementById(getNewId);

            if (state !== null) {
                if (state.style.display == 'block') {
                    state.style.display = 'none';
                } else {
                    state.style.display = 'block';
                }
            }
        }
    },

    //Función utilizada para colocar check o un check 
    toggleCheck: function (id, datos) {
        datos.map((fila) => {
            var state = document.getElementById(id + fila.ID);
            var ckeck = document.getElementById(id);
            if (state !== null) {
                if (ckeck.checked === true)
                {
                    //state.checked = fila.seleccionado;
                    state.disabled = false;
                }
                else {
                    //state.checked = fila.seleccionado;
                    state.disabled = true;
                }
            }
        })
    },

    //Función que se utiliza para mostrar y ocultar los cluster de EG dependiendo el clic con base a los elementos
    bodyFunEG: function (terr, props, fila) {
        var nombreTerreno = '';
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
        var nombreTerreno = '';
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
    }

}
export default util;