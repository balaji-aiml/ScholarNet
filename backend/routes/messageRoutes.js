import { Router } from 'express';
import { conversations, thread, send, read } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const r = Router();
r.use(protect);
r.get('/conversations', conversations); // before '/:userId'
r.route('/:userId').get(thread).post(send);
r.put('/:userId/read', read);
export default r;
