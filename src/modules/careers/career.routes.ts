import { Router } from 'express';
import { careerController } from './career.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { uploadResume } from '../../middleware/upload';
import { PERMISSIONS } from '../../constants/permissions';
import { createCareerSchema, updateCareerSchema, applyCareerSchema, updateApplicantStatusSchema } from '../../validators/career.validator';

const router = Router();

// Public
router.get('/public', careerController.getActiveJobs);
router.get('/public/:slug', careerController.getJobBySlug);
router.post('/public/:id/apply', uploadResume.single('resume'), validate(applyCareerSchema, 'body'), careerController.applyForJob);

// Admin
router.use(authenticate);
router.get('/', authorize(PERMISSIONS.CAREERS_READ), careerController.getAllJobs);
router.get('/:id', authorize(PERMISSIONS.CAREERS_READ), careerController.getJobById);
router.post('/', authorize(PERMISSIONS.CAREERS_WRITE), validate(createCareerSchema), careerController.createJob);
router.put('/:id', authorize(PERMISSIONS.CAREERS_WRITE), validate(updateCareerSchema), careerController.updateJob);
router.delete('/:id', authorize(PERMISSIONS.CAREERS_DELETE), careerController.deleteJob);
router.get('/:id/applicants', authorize(PERMISSIONS.APPLICANTS_READ), careerController.getApplicants);
router.put('/:id/applicants/:applicantId/status', authorize(PERMISSIONS.APPLICANTS_WRITE), validate(updateApplicantStatusSchema), careerController.updateApplicantStatus);

export default router;
