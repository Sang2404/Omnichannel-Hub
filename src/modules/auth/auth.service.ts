import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { ApiError } from '../../shared/utils/api-error';
import { UserPayload } from '../../shared/types';
import { Role } from '@prisma/client';
import { registerSchema, loginSchema } from './auth.validation';
import { z } from 'zod';

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

export class AuthService {
  /**
   * Registers a new user. Salts and hashes the password before persistence.
   * Only accessible by ADMIN.
   * 
   * @param input - The registration payload validated by Zod
   * @returns The registered user object without password
   */
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw ApiError.badRequest('Email is already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(input.password, salt);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: input.role,
      },
    });

    // Exclude password from return
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Validates user credentials. Computes bcrypt hash compare.
   * Generates and returns JWT token upon successful authentication.
   * 
   * @param input - The email and password payload validated by Zod
   * @returns Object containing JWT token and authenticated user profile
   */
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      shopName: user.shopName || 'Bình Dương Commerce',
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  /**
   * Retrieves all users for platform/tenant administration.
   */
  async listUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        shopName: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Updates a user's role or assigned shop.
   */
  async updateUserRole(id: string, role: Role, shopName?: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        role,
        ...(shopName ? { shopName } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        shopName: true,
        createdAt: true,
      },
    });

    return updated;
  }

  /**
   * Retrieves platform overview metrics for Super Admin.
   */
  async getSystemOverview() {
    const [totalUsers, totalOrders, totalProducts, users] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.findMany({ select: { shopName: true } }),
    ]);

    // Count distinct shops
    const shopsSet = new Set(users.map((u) => u.shopName || 'Bình Dương Commerce'));

    return {
      totalUsers,
      totalOrders,
      totalProducts,
      totalShops: shopsSet.size,
      services: [
        { name: 'PayOS VietQR Gateway', status: 'ONLINE', latency: '42ms', uptime: '99.98%' },
        { name: 'Giao Hàng Nhanh (GHN) API', status: 'ONLINE', latency: '68ms', uptime: '99.95%' },
        { name: 'Shopee Open Platform', status: 'ONLINE', latency: '115ms', uptime: '99.90%' },
        { name: 'Meta Messenger Webhook', status: 'ONLINE', latency: '54ms', uptime: '99.99%' },
      ],
    };
  }
}

