import { Router } from 'express';
import {
  listEvents, getEvent, createEvent, updateEvent, deleteEvent, toggleLike, addComment, deleteComment,
} from '../controllers/eventController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { POSTER_ROLES } from '../../shared/constants.js';

const r = Router();
r.use(protect);
r.route('/').get(listEvents).post(requireRole(...POSTER_ROLES), createEvent);
r.route('/:id').get(getEvent).put(requireRole(...POSTER_ROLES), updateEvent).delete(requireRole(...POSTER_ROLES), deleteEvent);
r.post('/:id/like', toggleLike);
r.post('/:id/comments', addComment);
r.delete('/:id/comments/:commentId', deleteComment);
export default r;
