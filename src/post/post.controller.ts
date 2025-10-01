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
  async createPost(@Req() req, @Body() dto: CreatePostDto) {
    let imagePath: string | undefined;
    if (req.isMultipart()) {
      const data = await req.file();
      if (data) {
        const uploadsDir = join(process.cwd(), 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = `${uniqueSuffix}-${data.filename}`;
        imagePath = `/uploads/${filename}`;
        const buffer = await data.toBuffer();
        await fs.writeFile(join(uploadsDir, filename), buffer);
      }
    }
    return this.postService.createPost(req.user.id, dto, imagePath);
  }

  @Put(':postId')
  async updatePost(
    @Req() req,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: UpdatePostDto,
  ) {
    let imagePath: string | undefined;
    if (req.isMultipart()) {
      const data = await req.file();
      if (data) {
        const uploadsDir = join(process.cwd(), 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = `${uniqueSuffix}-${data.filename}`;
        imagePath = `/uploads/${filename}`;
        const buffer = await data.toBuffer();
        await fs.writeFile(join(uploadsDir, filename), buffer);
      }
    }
    return this.postService.updatePost(req.user.id, postId, dto, imagePath);
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
}