// src/post/dto/post.dto.ts
import { createZodDto } from 'nestjs-zod/dto';
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});
export class CreatePostDto extends createZodDto(createPostSchema) {}

const updatePostSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
});
export class UpdatePostDto extends createZodDto(updatePostSchema) {}

const createCommentSchema = z.object({
  content: z.string().min(1),
});
export class CreateCommentDto extends createZodDto(createCommentSchema) {}

const createReactionSchema = z.object({
  type: z.enum(['like']), // For future-proofing
});
export class CreateReactionDto extends createZodDto(createReactionSchema) {}