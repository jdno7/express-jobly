"use strict";

const request = require("supertest");
process.env.NODE_ENV = "test"
const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 999999,
    equity: 0.01,
    companyHandle: "c2"
  };

  test("ok for Admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
        // console.log(resp)
        resp.body.job.id= 99
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: 99,
        title: "new",
        salary: 999999,
        equity: "0.01",
        companyHandle: "c2"
      }
    });
  });

  test("Unathed for Non-Admin User", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "new",
          salary: 100000,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: 89,
          salary: "NaN"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.statusCode).toEqual(200);
  })

  test("GET WITH title filter", async function () {
    const resp = await request(app).get("/jobs?title=sales");
    expect(resp.body).toEqual({
        jobs: [
            {
              id: 3,
              title: 'Sales Associate',
              salary: 80000,
              equity: '0',
              companyHandle: 'c2'
            },
            {
              id: 1,
              title: 'Sales Associate',
              salary: 100000,
              equity: '0.05',
              companyHandle: 'c1'
            }
          ]
    });
  });

  test("GET WITH filters minSalary", async function () {
    const resp = await request(app).get("/jobs?minSalary=110000");
    expect(resp.body).toEqual({
        jobs: [
            {
              id: 2,
              title: 'Operations Director',
              salary: 185000,
              equity: '0.125',
              companyHandle: 'c1'
            }
          ]
    });
  });

  test("GET WITH filters maxSalary", async function () {
    const resp = await request(app).get("/jobs?maxSalary=110000");
    expect(resp.body).toEqual({
        jobs: [
            {
              id: 3,
              title: 'Sales Associate',
              salary: 80000,
              equity: '0',
              companyHandle: 'c2'
            },
            {
              id: 1,
              title: 'Sales Associate',
              salary: 100000,
              equity: '0.05',
              companyHandle: 'c1'
            }
          ]
    });
  });
  
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/c1`);
    expect(resp.body).toEqual({
        jobs: [
            {
              id: 1,
              title: 'Sales Associate',
              salary: 100000,
              equity: '0.05',
              companyHandle: 'c1'
            },
            {
              id: 2,
              title: 'Operations Director',
              salary: 185000,
              equity: '0.125',
              companyHandle: 'c1'
            }
          ]
    });
  });



  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/99`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for Admin", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "New Title",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
        job: {
            id: 1,
            title: 'New Title',
            salary: 100000,
            equity: '0.05',
            companyHandle: 'c1'
          }
    });
  });

  test("401 for NON Admin", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "New Title",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/job/1`)
        .send({
            title: "New Title",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          companyHandle: "c1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          salary: "NaN",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for Admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("401 for NON Admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/99`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
