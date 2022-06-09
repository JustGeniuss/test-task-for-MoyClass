const request = require("supertest");

const app = require("../index.js");

describe("GET /api/", () => {
  it("expect array lessons (with filters#1)", async () => {
    const res = await request(app)
      .get("/")
      .query("date=2019-06-17")
      .query("status=0")
      .query("teacherIds=1")
      .query("studentsCount=2")
      .query("page=1")
      .query("lessonsPerPage=5");

    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          date: expect.any(String),
          title: expect.any(String),
          status: expect.any(Number),
          visitCount: expect.any(Number),
          students: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              name: expect.any(String),
              lesson_students: expect.objectContaining({
                visit: expect.any(Boolean),
              }),
            }),
          ]),
          teachers: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              name: expect.any(String),
            }),
          ]),
        }),
      ])
    );
  });

  it("expect array lessons (with filters#2)", async () => {
    const res = await request(app)
      .get("/")
      .query("date=2019-06-01,2019-12-12")
      .query("status=0")
      .query("teacherIds=1,2,3,4")
      .query("studentsCount=1,4")
      .query("page=2")
      .query("lessonsPerPage=2");

    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          date: expect.any(String),
          title: expect.any(String),
          status: expect.any(Number),
          visitCount: expect.any(Number),
          students: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              name: expect.any(String),
              lesson_students: expect.objectContaining({
                visit: expect.any(Boolean),
              }),
            }),
          ]),
          teachers: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              name: expect.any(String),
            }),
          ]),
        }),
      ])
    );
  });

  it("expect array lessons (without filters)", async () => {
    const res = await request(app).get("/");
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          date: expect.any(String),
          title: expect.any(String),
          status: expect.any(Number),
          visitCount: expect.any(Number),
          students: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              name: expect.any(String),
              lesson_students: expect.objectContaining({
                visit: expect.any(Boolean),
              })
            }),
          ]),
          teachers: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              name: expect.any(String),
            }),
          ]),
        }),
      ])
    );
  });

  it("expect status 400 (with incorrect filters)", async () => {
    const res = await request(app)
      .get("/")
      .query("date=error")
      .query("status=error")
      .query("teacherIds=error")
      .query("studentsCount=error")
      .query("page=error")
      .query("lessonsPerPage=error");
    expect(res.status).toEqual(400);
  });
});

describe('POST /api/lessons', () => {
  it('expect status 200 and numbers array by lessonsCount', async () => {
      const res = await request(app)
          .post('/lessons').send({
              teacherIds: [1, 2],
              title: 'Test title',
              days: [0, 1, 2],
              firstDate: '2019-01-01',
              lessonsCount: 4,
          });
      expect(res.status).toEqual(200);
      expect(res.body).toEqual(expect.arrayContaining([
          expect.any(Number),
      ]));
  });

  it('expect status 200 and numbers array by lastDate', async () => {
      const res = await request(app)
          .post('/lessons').send({
              teacherIds: [1, 2],
              title: 'Test title',
              days: [0, 1, 2],
              firstDate: '2019-01-01',
              lastDate: '2023-01-01',
          });
      expect(res.status).toEqual(200);
      expect(res.body).toEqual(expect.arrayContaining([
          expect.any(Number),
      ]));
  });

  it('expect status 400 (with incorrect teachersIds)', async () => {
      const res = await request(app)
          .post('/lessons').send({
              teacherIds: [-9, 0],
              title: 'Test title',
              days: [1, 2],
              firstDate: '2019-01-01',
              lessonsCount: 2,
          });
      expect(res.status).toEqual(400);
  });

  it('expect status 400 (with incorrect days)', async () => {
      const res = await request(app)
          .post('/lessons').send({
              teacherIds: [1, 2],
              title: 'Test title',
              days: [5, 7, 8],
              firstDate: '2019-01-01',
              lessonsCount: 2,
          });
      expect(res.status).toEqual(400);
  });

  it('expect status 400 (with incorrect firstDate)', async () => {
      const res = await request(app)
          .post('/lessons').send({
              teacheryIds: [1, 2],
              title: 'Test title',
              days: [1, 2],
              firstDate: 'right now',
              lessonsCount: 2,
          });
      expect(res.status).toEqual(400);
  });
});
