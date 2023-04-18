import mongoose from 'mongoose';
import {Role, User} from '../../interfaces/User';

const userModel = new mongoose.Schema<User>({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [Role.PATIENT, Role.HEALTHCARE_PROVIDER, Role.ADMIN],
    required: true,
    defaultValue: Role.PATIENT,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  token: {
    type: String,
    required: false,
  },
});

/* userModel.virtual('id').get(function () {
  return this._id.toHexString();
});

userModel.set('toJSON', {
  virtuals: true,
}); */

export default mongoose.model<User>('User', userModel);
