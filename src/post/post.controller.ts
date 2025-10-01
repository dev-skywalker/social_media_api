import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Put,
  Param,
  ParseIntPipe,
  Get,
  Query,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateCommentDto,
  CreatePostDto,
  CreateReactionDto,
  UpdatePostDto,
} from './dto/post.dto';
import * as fs from 'fs/promises';
import { join } from 'path';

@Controller('api/posts')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private postService: PostService) {}

  @Post()
  async createPost(@Req() req) {
    let imagePath: string | undefined;
    let title: string;
    let content: string;

    if (req.isMultipart()) {
      const parts = req.parts();
      const fields: Record<string, string> = {};

      for await (const part of parts) {
        if (part.type === 'file') {
          const uploadsDir = join(process.cwd(), 'uploads');
          await fs.mkdir(uploadsDir, { recursive: true });
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filename = `${uniqueSuffix}-${part.filename}`;
          imagePath = `/uploads/${filename}`;
          const buffer = await part.toBuffer();
          await fs.writeFile(join(uploadsDir, filename), buffer);
        } else {
          // Collect form fields
          fields[part.fieldname] = (part as any).value;
        }
      }

      title = fields.title;
      content = fields.content;
    } else {
      // Handle JSON request
      const body = req.body as CreatePostDto;
      title = body.title;
      content = body.content;
    }

    if (!title || !content) {
      throw new BadRequestException('Title and content are required');
    }

    return this.postService.createPost(
      req.user.id,
      { title, content },
      imagePath,
    );
  }

  @Put(':postId')
  async updatePost(
    @Req() req,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    let imagePath: string | undefined;
    let title: string | undefined;
    let content: string | undefined;

    if (req.isMultipart()) {
      const parts = req.parts();
      const fields: Record<string, string> = {};

      for await (const part of parts) {
        if (part.type === 'file') {
          const uploadsDir = join(process.cwd(), 'uploads');
          await fs.mkdir(uploadsDir, { recursive: true });
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filename = `${uniqueSuffix}-${part.filename}`;
          imagePath = `/uploads/${filename}`;
          const buffer = await part.toBuffer();
          await fs.writeFile(join(uploadsDir, filename), buffer);
        } else {
          // Collect form fields
          fields[part.fieldname] = (part as any).value;
        }
      }

      title = fields.title;
      content = fields.content;
    } else {
      // Handle JSON request
      const body = req.body as UpdatePostDto;
      title = body.title;
      content = body.content;
    }

    return this.postService.updatePost(
      req.user.id,
      postId,
      { title, content },
      imagePath,
    );
  }

  @Get('/my-posts')
  getMyPosts(
    @Req() req,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.postService.getMyPosts(req.user.id, page, limit);
  }

  @Get()
  getAllPosts(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.postService.getAllPosts(page, limit);
  }

  @Post(':postId/comments')
  createComment(
    @Req() req,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postService.createComment(req.user.id, postId, dto.content);
  }

  @Post(':postId/reaction')
  toggleReaction(
    @Req() req,
    @Param('postId', ParseIntPipe) postId: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() dto: CreateReactionDto,
  ) {
    return this.postService.toggleReaction(req.user.id, postId);
  }

  @Delete(':postId')
  deletePost(@Req() req, @Param('postId', ParseIntPipe) postId: number) {
    return this.postService.deletePost(req.user.id, postId);
  }
}