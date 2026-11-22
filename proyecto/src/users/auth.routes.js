import { Router } from 'express';
import { z } from 'zod';
import { parse } from '../lib/validation.js';

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(128),
});

/**
 * @param {{
 *   auth: ReturnType<typeof import('./auth.service.js').createAuthService>,
 *   requireAuth: import('express').RequestHandler,
 *   limiter: import('express').RequestHandler,
 * }} deps
 */
export function authRouter({ auth, requireAuth, limiter }) {
  const router = Router();

  router.post('/register', limiter, async (req, res) => {
    const credentials = parse(credentialsSchema, req.body);
    res.status(201).json(await auth.register(credentials));
  });

  router.post('/login', limiter, async (req, res) => {
    const credentials = parse(credentialsSchema, req.body);
    res.json(await auth.login(credentials));
  });

  router.get('/me', requireAuth, (req, res) => {
    res.json(auth.me(req.user.id));
  });

  return router;
}
