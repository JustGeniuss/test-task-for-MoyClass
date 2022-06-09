const { Lesson, Student, Teacher, LessonTeacher } = require("../models/models");
const { Sequelize, Op } = require("sequelize");
const differenceInYears = require("date-fns/differenceInYears");
const sequelize = require("../db");
const validator = require("../validators/lessons.validator");
const ApiError = require("../error/ApiError");

class LessonService {
  async getLessonsByParams(params) {
    const validParams = validator.getParams(params);
    console.log(validParams);
    if (validParams.validated) {
      if (params.studentsCount && !params.studentsCount[1]) {
        params.studentsCount[1] = params.studentsCount[0];
      }
      console.log(params.date);
      let object = await this.createObjectForFiltre(params.date, params.status);
      const lessonIds = await this.getIdForQuery(params.teacherIds);
      const ObjectForFiltreTeachersByLessonsId = this.getTeachersId(
        params.teacherIds,
        lessonIds
      );
      const lessons = await Lesson.findAll({
        include: [
          {
            model: Student,
            as: "students",
            through: {
              attributes: ["visit"],
            },
            required: false,
          },
          {
            model: Teacher,
            as: "teachers",
            through: {
              attributes: [],
              where: ObjectForFiltreTeachersByLessonsId,
            },
            required: true,
          },
        ],
        attributes: {
          include: [
            [
              Sequelize.literal(`(SELECT COUNT(*)::INTEGER FROM lesson_students AS lesson_students  WHERE 
        lesson_students.lesson_id = "lessons"."id" AND lesson_students.visit = true)`),
              "visitCount",
            ],
          ],
        },

        limit: params.lessonsPerPage,
        offset: params.offset,

        where: {
          [Op.and]: [
            object,
            params.studentsCount
              ? Sequelize.where(
                  Sequelize.literal(`(SELECT COUNT(*) FROM lesson_students AS lesson_students  WHERE 
          lesson_students.lesson_id = "lessons"."id" AND lesson_students.visit = true)`),
                  {
                    [Op.between]: params.studentsCount,
                  }
                )
              : "",
          ],
        },

        order: ["date"],
      });
      return lessons;
    }
    throw ApiError.badRequest(validParams.error.details);
  }

  async addLessons(body) {
    const validParams = validator.postBody(body);
    console.log(validParams);
    const t = await sequelize.transaction();
    const wrongTeachersId = [];
    if (validParams.validated) {
      try {
        const validateTeachersId = await Teacher.findAll({
          attributes: ["id"],
          where: {
            id: { [Op.in]: body.teacherIds },
          },
        }).then((result) => result.map((e) => e.dataValues.id));
        console.log(validateTeachersId, body.teacherIds.length);
        if (validateTeachersId.length !== body.teacherIds.length) {
          for (let i = 0; i < body.teacherIds.length; i++) {
            if (validateTeachersId.indexOf(body.teacherIds[i]) === -1) {
              wrongTeachersId.push(body.teacherIds[i]);
            }
          }
          throw new Error();
        }
      } catch (e) {
        throw ApiError.badRequest(
          `These teacherIds Not Found: ${wrongTeachersId}`
        );
      }
      try {
        const arrayOfObjectsForLessonCreate = [];
        const firstDate = new Date(body.firstDate);
        const lastDate = new Date(body.lastDate);
        console.log(lastDate);
        body.days.sort((a, b) => a - b);
        const dayOfFirstLesson = this.getDayOfFirstLesson(body.days, firstDate);
        const diffBetweenDays =
          this.convertArrayOfDaysOfWeekToDifferenceBetweenThem(body.days);

        let date = new Date(firstDate);
        date.setDate(firstDate.getDate() + dayOfFirstLesson[0]);

        this.createArrayOfLessons(
          body,
          date,
          firstDate,
          lastDate,
          arrayOfObjectsForLessonCreate,
          diffBetweenDays,
          dayOfFirstLesson
        );
        const newLesson = await Lesson.bulkCreate(
          arrayOfObjectsForLessonCreate,
          {
            transaction: t,
          }
        );
        const lessonTeacherCreateObject = [];
        for (let j = 0; j < newLesson.length; j++) {
          for (let i = 0; i < body.teacherIds.length; i++) {
            lessonTeacherCreateObject.push({
              lesson_id: newLesson[j].dataValues.id,
              teacher_id: body.teacherIds[i],
            });
          }
        }
        const LessonTeachers = await LessonTeacher.bulkCreate(
          lessonTeacherCreateObject,
          { transaction: t }
        );
        await t.commit();
        return newLesson.map((e) => e.dataValues.id);
        // return arrayOfObjectsForLessonCreate;
      } catch (e) {
        await t.rollback();
        throw new Error();
      }
    }
    throw ApiError.badRequest(validParams.error.details);
  }

  getDayOfFirstLesson(arrOfDays, firstDate) {
    let amountDaysBetweenFirstDateAndFirstLessonAndWeekDayOfFirstLesson = [];
    for (let i = 0; i < arrOfDays.length; i++) {
      if (arrOfDays[i] >= firstDate.getDay()) {
        amountDaysBetweenFirstDateAndFirstLessonAndWeekDayOfFirstLesson = [
          arrOfDays[i] - firstDate.getDay(),
          i,
        ];
        break;
      }
      amountDaysBetweenFirstDateAndFirstLessonAndWeekDayOfFirstLesson = [
        arrOfDays[i] - firstDate.getDay() + 6,
        0,
      ];
    }
    return amountDaysBetweenFirstDateAndFirstLessonAndWeekDayOfFirstLesson;
  }

  convertArrayOfDaysOfWeekToDifferenceBetweenThem(arrOfDays) {
    const diffBetweenDays = arrOfDays.map((e, i, arr) => {
      if (i == arr.length - 1) {
        return (e = arr[0] - arr[i] + 7);
      }
      return (e = arr[i + 1] - e);
    });
    diffBetweenDays.unshift(diffBetweenDays[diffBetweenDays.length - 1]);
    diffBetweenDays.pop();
    return diffBetweenDays;
  }

  createArrayOfLessons(
    body,
    date,
    firstDate,
    lastDate,
    arrayOfObjectsForLessonCreate,
    diffBetweenDays,
    dayOfFirstLesson
  ) {
    for (
      let i = 0;
      (i < body.lessonsCount || date <= lastDate) && i <= 300;
      i++
    ) {
      arrayOfObjectsForLessonCreate.push({
        title: body.title,
        status: 0,
        date: date.toJSON().substring(0, 10),
        day: date.getDay(),
      });
      date.setDate(
        date.getDate() +
          diffBetweenDays[
            (i + dayOfFirstLesson[1] + 1) % diffBetweenDays.length
          ]
      );
      if (differenceInYears(date, firstDate) >= 1) {
        break;
      }
    }
  }

  async createObjectForFiltre(date, status) {
    const object = {};
    if (date !== undefined) {
      object.date = {
        [Op.or]: {
          [Op.and]: {
            [Op.gte]: date[0],
            [Op.lte]: date[1],
          },
          [Op.eq]: date[0],
        },
      };
    }
    if (status !== undefined) {
      object.status = status;
    }
    return object;
  }

  async getIdForQuery(teacherIds) {
    if (teacherIds) {
      console.log(teacherIds);
      const lessonsIds = await Lesson.findAll({
        attributes: ["id"],
        include: [
          {
            model: Teacher,
            as: "teachers",
            where: {
              id: { [Op.in]: teacherIds },
            },
          },
        ],
      });
      const LessonIds = [];
      lessonsIds.forEach((e) => {
        LessonIds.push(e.dataValues.id);
      });
      return LessonIds;
    }
  }

  getTeachersId(teachersId, lessonsId) {
    if (teachersId !== undefined) {
      return { lesson_id: { [Op.in]: lessonsId } };
    }
  }
}

module.exports = new LessonService();
