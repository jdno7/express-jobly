"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function (){
    const newJob = {
        title: "new",
        salary: 100000,
        equity: .1,
        companyHandle: "c1"
    }


    test("works", async function (){
        let job = await Job.create(newJob)
        job.id = 99
        expect(job).toEqual({
            id: 99,
            title: "new",
            salary: 100000,
            equity: "0.1",
            companyHandle: "c1"
        })
    })
})

describe("findAll", function (){

    test("get all jobs", async function (){
        const jobs = await Job.findAll();
        expect(jobs).toEqual(
            [
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
                },
                {
                  id: 2,
                  title: 'Operations Director',
                  salary: 185000,
                  equity: '0.125',
                  companyHandle: 'c1'
                }
              ]
    )
    })
})

describe("get", function (){

    test("get job", async function (){
        const job = await Job.get(3);
        expect(job).toEqual(
                {
                  id: 3,
                  title: 'Sales Associate',
                  salary: 80000,
                  equity: '0',
                  companyHandle: 'c2'
                }
    )
    })

    test("Job Not Found", async function (){
        await expect(Job.get(66)).rejects.toThrow(NotFoundError)
    })
})

describe("Update", function (){
    const data = {
        title:"Updated Title",
        salary: 99999
    }
    test("Update Job", async function (){
        const updated = await Job.update(1,data)
        expect(updated).toEqual({
            id: 1,
            title: 'Updated Title',
            salary: 99999,
            equity: '0.05',
            companyHandle: 'c1'
        })
    })
   
})

describe("Delete", function (){

    test("Delete Job", async function (){
        const deleted = await Job.remove(1)
        expect(deleted).toEqual(undefined)
        await expect(Job.get(1)).rejects.toThrow(NotFoundError)
    })
   
})