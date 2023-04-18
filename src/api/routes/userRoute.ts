import express from 'express';
import {
  check,
  checkToken,
  userDelete,
  userGet,
  userListGet,
  userPost,
  userPut,
} from '../controllers/userController';
import {authorize} from '../../middlewares';

const router = express.Router();

router
  .route('/')
  .get(userListGet)
  .post(userPost)
  .put(authorize, userPut)
  .delete(authorize, userDelete);

router.get('/token', authorize, checkToken);

router.route('/check').get(check);

router.route('/:id').get(userGet);
//  .put(authorize, userPutAsAdmin)
//  .delete(authorize, userDeleteAsAdmin);

export default router;
