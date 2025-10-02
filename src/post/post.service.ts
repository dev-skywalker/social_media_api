import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async createPost(userId: number, dto: CreatePostDto, imagePath?: string) {
    return this.prisma.post.create({
      data: {
        ...dto,
        image: imagePath,
        userId,
      },
    });
  }

  async updatePost(
    userId: number,
    postId: number,
    dto: UpdatePostDto,
    imagePath?: string,
  ) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        ...dto,
        ...(imagePath && { image: imagePath }), // Only update image if a new one is provided
      },
    });
  }

  async getMyPosts(userId: number, page: number, limit: number) {
    const posts = await this.prisma.post.findMany({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true,email:true,createdAt:true },
        },
        comments: {
          select:{id:true,content:true,createdAt:true,userId:true,postId:true, author:{
              select:{
                id:true,name:true,email:true,createdAt:true 
              }
            }}
        },
        _count: {
          select: { comments: true, reactions: true },
        },
      },
    });
    return posts.map((post) => ({
      ...post,
      reaction_count: post._count.reactions,
      comment_count: post._count.comments,
    }));
  }

  async getAllPosts(page: number, limit: number) {
    const posts = await this.prisma.post.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true ,email:true,createdAt:true },
        },
        comments: {
          select:{
            id:true,content:true,createdAt:true,userId:true,postId:true, author:{
              select:{
                id:true,name:true,email:true,createdAt:true 
              }
            }}
        },
        _count: {
          select: { comments: true, reactions: true },
        },
      },
    });
    return posts.map((post) => ({
      ...post,
      reaction_count: post._count.reactions,
      comment_count: post._count.comments,
    }));
  }

  async createComment(userId: number, postId: number, content: string) {
    return this.prisma.comment.create({
      data: {
        content,
        userId,
        postId,
      },
    });
  }

  async toggleReaction(userId: number, postId: number) {
    const existingReaction = await this.prisma.reaction.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingReaction) {
      await this.prisma.reaction.delete({ where: { id: existingReaction.id } });
      return { status: 'unliked' };
    } else {
      await this.prisma.reaction.create({ data: { userId, postId } });
      return { status: 'liked' };
    }
  }

  async deletePost(userId: number, postId: number) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.post.delete({ where: { id: postId } });
  }
}