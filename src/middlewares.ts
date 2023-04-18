import {NextFunction, Request, Response} from 'express';
import CustomError from './classes/CustomError';
import ErrorResponse from './interfaces/ErrorResponse';
import {UserOutput} from './interfaces/User';
import jwt from 'jsonwebtoken';
import userModel from './api/models/userModel';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response<ErrorResponse>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

const authorize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bearer = req.headers.authorization;
    if (!bearer) {
      next(new CustomError('Invalid token', 401));
      return;
    }

    const token = bearer.split(' ')[1];
    if (!token) {
      next(new CustomError('Invalid token', 401));
      return;
    }

    const userFromToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as UserOutput;
    const user = await userModel
      .findById(userFromToken.id)
      .select('-password -__v');

    if (!user) {
      next(new CustomError('Invalid token', 401));
      return;
    }

    const outputUser: UserOutput = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    };

    res.locals.user = outputUser;
    next();
  } catch (err) {
    next(new CustomError('Invalid token', 401));
  }
};

export {notFound, errorHandler, authorize};
