import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

const CRUD = {
    createListItem: async function(web, lista, json){
        const returnData = await web.lists.getByTitle(lista).items.add(json)
        return returnData
    },
    updateListItem: async function(web, lista, id, json){
        await web.lists.getByTitle(lista).items.getById(id).update(json)
    },
    deleteListItem: async function(web, lista, idEliminar){
        await web.lists.getByTitle(lista).items.getById(idEliminar).delete()
    }
}

export default CRUD;