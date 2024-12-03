const bcrypy = require('bcryptjs');

const helpers = {};


//METODO CUANDO SE REGISTRA EL USUARIO
helpers.encryptContrasenia = async(contrasenia) => {
    const salt = await bcrypy.genSalt(10);
    const finalContrasenia = await bcrypy.hash(contrasenia, salt);
    return finalContrasenia;
};

//METODO PARA CUANDO EL USUARIO SE LOGEA
helpers.compararContrasenia = async(contrasenia, savedContrasenia) => {
    try {
        return await bcrypy.compare(contrasenia, savedContrasenia);
    } catch(e) {
        console.log(e);
    }
};

module.exports = helpers;