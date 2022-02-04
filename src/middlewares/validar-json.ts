import { IncomingMessage, ServerResponse } from 'http';

const validarJson = (_: IncomingMessage, __: ServerResponse, buf: Buffer) => {
  try {
    console.log('validarJson', buf.toString());
    JSON.parse(buf.toString());
  } catch (e) {
    throw new Error('invalid JSON');
  }
};

export default validarJson;
