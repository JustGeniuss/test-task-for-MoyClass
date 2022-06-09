const Router = require('express');
const lessonController = require('../controllers/lessonController')


const router = new Router()


router.get('/', lessonController.getLessons),
router.post('/lessons', lessonController.addLesson),

module.exports = router