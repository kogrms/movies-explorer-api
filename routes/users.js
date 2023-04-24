const router = require('express').Router();
const { updateUserProfileValidation } = require('../middlewares/validation');
const { updateUserProfile, getUserProfile } = require('../controllers/users');

router.get('/me', getUserProfile);

router.patch('/me', updateUserProfileValidation, updateUserProfile);

module.exports = router;
