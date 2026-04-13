import { Router } from 'express';
import { unifiedSearch } from '../controllers/searchController.js';
const router = Router();
router.get('/', unifiedSearch);
export default router;
//# sourceMappingURL=searchRoutes.js.map