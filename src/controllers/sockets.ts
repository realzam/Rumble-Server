import Usuario from '../database/models/usuario';
import Mensaje from '../database/models/mensaje';
import { IMessagepayload } from '../types/socket';

const usuarioConectado = async (uid: string) => {
  const usuario = await Usuario.findById(uid);
  if (usuario) {
    usuario.online = true;
    await usuario.save();
  }
  return usuario;
};

const usuarioDesconectado = async (uid: string) => {
  const usuario = await Usuario.findById(uid);
  if (usuario) {
    usuario.online = false;
    await usuario.save();
  }
  return usuario;
};

const getUsuarios = async () => {
  const usuarios = await Usuario.find().sort('-online');
  return usuarios;
};

const grabarMensaje = async (payload: IMessagepayload, de: string) => {
  try {
    console.log(payload);
    const mensaje = new Mensaje({ ...payload, de });
    await mensaje.save();
    return mensaje;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export { usuarioConectado, usuarioDesconectado, getUsuarios, grabarMensaje };
