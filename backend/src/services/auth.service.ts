import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

// Campos a devolver del usuario (nunca el password)
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  active: true,
  createdAt: true,
};

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError('Email already in use', 409);
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        // El primer usuario registrado podría ser admin, pero para portafolio
        // el rol se asigna desde seed o desde el panel de admin
      },
      select: userSelect,
    });

    const tokenPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return { user, accessToken, refreshToken };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    // Mensaje genérico: no revelar si el email existe (previene user enumeration)
    if (!user || !user.active) {
      throw new AppError('Invalid credentials', 401);
    }

    const passwordMatch = await comparePassword(input.password, user.password);
    if (!passwordMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokenPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken };
  },

  async refresh(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: userSelect,
      });

      if (!user || !user.active) {
        throw new AppError('Invalid refresh token', 401);
      }

      const tokenPayload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  },
};
