import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { authService, userService, tokenService, emailService } from '../services';
import exclude from '../utils/exclude';
import { User } from '@prisma/client';
import config from '../config/config';

const parseCookies = (cookieHeader?: string) => {
  if (!cookieHeader) {
    return {} as Record<string, string>;
  }

  return cookieHeader.split(';').reduce<Record<string, string>>((cookies, entry) => {
    const [rawKey, ...rawValue] = entry.trim().split('=');
    if (!rawKey) {
      return cookies;
    }
    cookies[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.join('='));
    return cookies;
  }, {});
};

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: config.jwt.cookieSecure,
  path: '/'
};

const setSessionCookies = (res: any, accessToken: string, refreshToken: string) => {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: config.jwt.accessExpirationMinutes * 60 * 1000
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000
  });
};

const register = catchAsync(async (req, res) => {
  const { email, password, name } = req.body;
  const user = await userService.createUser(email, password, name);
  const userWithoutPassword = exclude(user, ['password', 'createdAt', 'updatedAt']);
  await authService.sendVerificationEmailToUser(user);
  res.status(httpStatus.CREATED).send({ user: userWithoutPassword });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  setSessionCookies(res, tokens.access.token, tokens.refresh!.token);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  await authService.logout(req.body.refreshToken ?? cookies.refreshToken);
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const refreshToken = req.body.refreshToken ?? cookies.refreshToken;
  const tokens = await authService.refreshAuth(refreshToken);
  setSessionCookies(res, tokens.access.token, tokens.refresh!.token);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token as string, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const user = req.user as User;
  await authService.sendVerificationEmailToUser(user);
  res.status(httpStatus.NO_CONTENT).send();
});

const resendVerificationEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  await authService.sendVerificationEmailToEmail(email);
  res.status(httpStatus.OK).send({ message: 'Verification email sent successfully' });
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token as string);
  res.status(httpStatus.NO_CONTENT).send();
});

const me = catchAsync(async (req, res) => {
  const user = await authService.getCurrentSessionUser((req.user as User).id);
  res.send({ user });
});

export default {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  resendVerificationEmail,
  verifyEmail,
  me
};
