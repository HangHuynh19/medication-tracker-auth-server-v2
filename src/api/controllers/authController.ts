import {Request, Response, NextFunction} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CustomError from '../../classes/CustomError';
import userModel from '../models/userModel';
import {UserOutput} from '../../interfaces/User';
import DBResponse from '../../interfaces/DBResponse';

const login = async (
  req: Request<{}, {}, {email: string; password: string}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {email, password} = req.body;
    const user = await userModel.findOne({email});
    if (!user) {
      next(new CustomError('Invalid credentials', 401));
      return;
    }

    if (!bcrypt.compareSync(password, user.password)) {
      next(new CustomError('Invalid credentials', 401));
      return;
    }

    const token = jwt.sign(
      {id: user.id, role: user.role},
      process.env.JWT_SECRET as string
    );
    const userOutput: UserOutput = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token,
    };
    const message: DBResponse = {
      message: 'Login successful',
      user: userOutput,
    };

    res.json(message);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export {login};
