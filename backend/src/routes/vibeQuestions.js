import { VIBE_QUESTIONS } from '../services/vibeQuestionService.js';

export default async function vibeQuestionsRoutes(fastify) {
  // GET /vibe-questions - return the full structured question bank
  fastify.get('/', async () => {
    return VIBE_QUESTIONS;
  });
}
