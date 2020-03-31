export default function padLeft(data,size,paddingChar) {
    return (new Array(size + 1).join(paddingChar || '0') + String(data)).slice(-size);
}  