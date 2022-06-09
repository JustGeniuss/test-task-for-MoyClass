const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Lesson = sequelize.define(
  "lessons",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.DATEONLY, allowNull: false},
    title: { type: DataTypes.STRING(100)},
    status: { type: DataTypes.INTEGER, defaultValue: 0},
  },
  { timestamps: false, }
);

const Student = sequelize.define(
  "students",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(10)},
  },
  { timestamps: false }
);

const Teacher = sequelize.define(
  "teachers",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(10)},
  },
  { timestamps: false }
);

const LessonStudent = sequelize.define(
  "lesson_students",
  {
    visit: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: false }
);

const LessonTeacher = sequelize.define(
  "lesson_teachers",
  {},
  { timestamps: false }
);


Lesson.belongsToMany(Student, {through: LessonStudent, foreignKey: 'lesson_id'})
Student.belongsToMany(Lesson, {through: LessonStudent, foreignKey: 'student_id'})


Lesson.belongsToMany(Teacher, {through: LessonTeacher, foreignKey: 'lesson_id'})
Teacher.belongsToMany(Lesson, {through: LessonTeacher, foreignKey: 'teacher_id'})


module.exports = {
  Lesson, Student, Teacher, LessonStudent, LessonTeacher
}