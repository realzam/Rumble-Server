import { Router } from 'express';
import { check } from 'express-validator';
import { crearSala, ingresarSala } from '../controllers/games';
import validarCampos from '../middlewares/validar-campos';

const router = Router();
router.get(
  '/crear',
  [
    check('nick', 'El nickame es obligatorio').notEmpty(),
    check('game', 'El game es obligatorio').isNumeric(),
    validarCampos,
  ],
  crearSala,
);

router.get(
  '/ingresar',
  [
    check('nick', 'El nickame es obligatorio').notEmpty(),
    check('sala', 'El sala es obligatorio').notEmpty(),
    validarCampos,
  ],
  ingresarSala,
);

export default router;
