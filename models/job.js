"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlQueryJobSearch } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ title, salary, equity, companyHandle }) {

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [
          title,
          salary,
          equity,
          companyHandle
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, companyHandle }, ...]
   * */

  static async findAll(filters) {
    if (filters){
      const search = sqlQueryJobSearch(filters)
    //   console.log(search)
      const jobsRes = await db.query(
        `SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
         FROM jobs
         WHERE ${search}
         ORDER BY salary`);
    return jobsRes.rows;
    }
    
    const jobsRes = await db.query(
        `SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
         FROM jobs
         ORDER BY salary`);
    return jobsRes.rows;
  }

//   ** Get Job by ID
// * Return {id, title, salary, companyHandle}
// * Return "No Job id" If Job Does NOT exist
static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No Job: ${id}`);

    return job;
  }


//   ** Get Jobs by company_handle
// * Return {jobs: [{id, title, salary, companyHandle},...]}
// * Return "No Job id" If Job Does NOT exist
static async getCompanyJobs(handle) {
    const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE company_handle = $1`,
        [handle]);
    // if (!jobRes.rows[0]) throw new NotFoundError(`No Job: ${handle}`);

    const jobs = jobRes.rows

    return jobs;
  }


  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id,
                                title, 
                                salary, 
                                equity, 
                                "company_handle" AS "companyHandle"`;

    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job ID: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING title`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No Job ID: ${id}`);
  }
}


module.exports = Job;
