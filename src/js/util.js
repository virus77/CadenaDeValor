const util = {
    padLeft: function (data,size,paddingChar) {
        return (new Array(size + 1).join(paddingChar || '0') + String(data)).slice(-size);
    },
    
    asyncForEach: async function (array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }
}

export default util;