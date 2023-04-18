import bcrypt from 'bcryptjs';
import {Request, Response, NextFunction} from 'express';
import userModel from '../models/userModel';
import CustomError from '../../classes/CustomError';
import {Role, User, UserOutput} from '../../interfaces/User';
import DBResponse from '../../interfaces/DBResponse';
import {validationResult} from 'express-validator';

const salt = bcrypt.genSaltSync(12);

const check = (req: Request, res: Response) => {
  res.json({
    message: 'Auth server is up and running',
  });
};

const userListGet = async (
  req: Request,
  res: Response<{}, {users: User[]}>,
  next: NextFunction
) => {
  try {
    const users = await userModel.find().select('-password -role');
    if (!users) {
      next(new CustomError('No users found', 404));
      return;
    }
    res.json(users);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userGet = async (
  req: Request<{id: string}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userModel
      .findById(req.params.id)
      .select('-password -role');
    if (!user) {
      next(new CustomError('User not found', 404));
      return;
    }
    res.json(user);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userPost = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessage = errors
        .array()
        .map((error) => error.msg)
        .join(', ');
      next(new CustomError(errorMessage, 400));
      return;
    }
    const user = req.body;
    user.password = bcrypt.hashSync(user.password, salt);
    user.role = Role.PATIENT;

    const newUser = await userModel.create(user);
    const response: DBResponse = {
      message: 'User created',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    };
    res.json(response);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userPut = async (
  req: Request<{}, {}, User>,
  res: Response<{}, {user: UserOutput}>,
  next: NextFunction
) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      const errorMessage = error
        .array()
        .map((error) => error.msg)
        .join(', ');
      next(new CustomError(errorMessage, 400));
      return;
    }

    const userFromToken = res.locals.user;
    if (!userFromToken) {
      next(new CustomError('Unauthorized', 401));
      return;
    }

    if (req.body.password) {
      req.body.password = bcrypt.hashSync(req.body.password, salt);
    }

    const user = req.body;
    const result = await userModel
      .findByIdAndUpdate(userFromToken.id, user, {
        new: true,
      })
      .select('-password -role');
    if (!result) {
      next(new CustomError('User not found', 404));
      return;
    }

    const response: DBResponse = {
      message: 'User updated',
      user: {
        id: result.id,
        username: result.username,
        email: result.email,
        avatar: result.avatar,
      },
    };
    res.json(response);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userDelete = async (
  req: Request,
  res: Response<{}, {user: UserOutput}>,
  next: NextFunction
) => {
  try {
    const userFromToken = res.locals.user;
    if (!userFromToken) {
      next(new CustomError('Unauthorized', 401));
      return;
    }

    const deletedUser = await userModel.findByIdAndDelete(userFromToken.id);
    if (!deletedUser) {
      next(new CustomError('User not found', 404));
      return;
    }

    const response: DBResponse = {
      message: 'User deleted',
      user: {
        id: userFromToken.id,
        username: userFromToken.username,
        email: userFromToken.email,
        avatar: userFromToken.avatar,
      },
    };

    res.json(response);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const checkToken = (
  req: Request,
  res: Response<{}, {user: UserOutput}>,
  next: NextFunction
) => {
  const userFromToken = res.locals.user;
  if (!userFromToken) {
    next(new CustomError('Unauthorized', 401));
    return;
  }
  const response: DBResponse = {
    message: 'Token is valid',
    user: userFromToken,
  };
  res.json(response);
};

export {check, userListGet, userGet, userPost, userPut, userDelete, checkToken};
