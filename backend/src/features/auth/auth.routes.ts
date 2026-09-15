import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();
const controller = new AuthController();

router.post('/login', (req, res, next) => controller.login(req, res, next));
router.post('/register', (req, res, next) => controller.register(req, res, next));

export default router;
