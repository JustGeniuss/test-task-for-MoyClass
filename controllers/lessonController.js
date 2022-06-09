const lessonService = require("../services/lessonService");

const DEFAULT_PAGE = 1;
const DEFAULT_LESSONS_PER_PAGE = 5;

class LessonController {
  async getLessons(req, res, next) {
    try {
      const params = {};
      console.log(req.query);
      if (req.query.date) params.date = req.query.date.split(",");
      if (req.query.status) params.status = req.query.status;
      if (req.query.teacherIds)
        params.teacherIds = req.query.teacherIds.split(",");
      if (req.query.studentsCount)
        params.studentsCount = req.query.studentsCount.split(",");

      params.page = req.query.page || DEFAULT_PAGE;
      params.lessonsPerPage =
        req.query.lessonsPerPage || DEFAULT_LESSONS_PER_PAGE;
      params.offset =
        params.page * params.lessonsPerPage - params.lessonsPerPage;

      let result = await lessonService.getLessonsByParams(params);
      res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }

  async addLesson(req, res, next) {
    try {
      const body = {};
      if (req.body.teacherIds) body.teacherIds = req.body.teacherIds;
      if (req.body.title) body.title = req.body.title;
      if (req.body.days) body.days = req.body.days;
      if (req.body.firstDate) body.firstDate = req.body.firstDate;
      if (req.body.lessonsCount) body.lessonsCount = req.body.lessonsCount;
      if (req.body.lastDate) body.lastDate = req.body.lastDate;
      let result = await lessonService.addLessons(body);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new LessonController();
