import { Router } from 'express';
import { listUsers, getUser, updateMe, deleteMe } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const r = Router();
r.use(protect);
r.get('/', listUsers);
r.route('/me').put(updateMe).delete(deleteMe); // declared before '/:id'
r.get('/:id', getUser);
export default r;
