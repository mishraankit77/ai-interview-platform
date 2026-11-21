import { Router } from 'express';
import { interviewController } from '../controllers/interviewController';

const router = Router();

// Track & role discovery
router.get('/roles', (req, res) => interviewController.getRoles(req, res));

// Start a new interview session
router.post('/start', (req, res) => interviewController.startInterview(req, res));

// Submit candidate answer
router.post('/:id/answer', (req, res) => interviewController.submitAnswer(req, res));

// Retrieve session telemetry & state
router.get('/:id', (req, res) => interviewController.getSession(req, res));

// Retrieve final executive report
router.get('/:id/report', (req, res) => interviewController.getReport(req, res));

export default router;
