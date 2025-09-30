// src/auth/dto/auth.dto.ts
import { createZodDto } from 'nestjs-zod/dto';
import { z } from 'zod';

const registerSchema = z
  .object({
    name: z.string().min(1).max(255),
    email: z.email(),
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });

export class RegisterDto extends createZodDto(registerSchema) {}

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export class LoginDto extends createZodDto(loginSchema) {}