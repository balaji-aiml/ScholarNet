import { Router } from 'express';
import { listConnections, sendRequest, acceptRequest, removeConnection } from '../controllers/connectionController.js';
import { protect } from '../middleware/auth.js';

const r = Router();
r.use(protect);
r.get('/', listConnections);
r.post('/:userId', sendRequest);
r.put('/:id/accept', acceptRequest);
r.delete('/:id', removeConnection);
export default r;
