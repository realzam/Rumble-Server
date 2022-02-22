import express, { Router } from 'express';
import { check } from 'express-validator';
import { crearSala, ingresarSala, renewToken } from '../controllers/base';
import validarCampos from '../middlewares/validar-campos';
import validarJWTMiddleware from '../middlewares/validar-jwt';

const router = Router();
router.post(
  '/crear',
  [
    check('nick', 'El nickame es obligatorio').notEmpty(),
    check('password', 'El password es obligatorio').notEmpty(),
    check('game', 'El game es obligatorio').isNumeric(),
    validarCampos,
  ],
  crearSala,
);

router.post(
  '/ingresar',
  [
    check('nick', 'El nickame es obligatorio').notEmpty(),
    check('password', 'El password es obligatorio').notEmpty(),
    check('sala', 'El sala es obligatorio').notEmpty(),
    validarCampos,
  ],
  ingresarSala,
);

router.get('/validar', [validarJWTMiddleware], renewToken);

const a = async (
  req: express.Request,
  res: express.Response,
): Promise<express.Response> => {
  console.log(req.body);
  return res.json({ ok: true });
};

router.get('/xd', a);

export default router;
