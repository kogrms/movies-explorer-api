const router = require('express').Router();
const { createUserValidation, loginValidation } = require('../middlewares/validation');
const userRouter = require('./users');
const movieRouter = require('./movies');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/NotFoundError');
const { createUser, login } = require('../controllers/users');

// создаёт пользователя с переданными в теле email, password и name
router.post('/signup', createUserValidation, createUser);

// проверяет переданные в теле почту и пароль и возвращает JWT
router.post('/signin', loginValidation, login);

router.use(auth); // авторизация

router.use('/users', userRouter);
router.use('/movies', movieRouter);

router.use('*', () => {
  throw new NotFoundError('Данные по указанному запросу не существуют');
});

module.exports = router;
