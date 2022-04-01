const { BadRequestError } = require('../expressError');
const { commonBeforeEach } = require('../routes/_testCommon')
const {sqlForPartialUpdate} = require('./sql')


let data;
let jstoSql;
  
describe("Testing sqlForPartialUpdate Functionaliy", function () {
    beforeEach(function() {
        data = {
            firstName: "JD",
            lastName: "Test",
            username: "jdtest",
            password: "password",
            isAdmin: false
        }
        
        jstoSql = {
            firstName: "first_name",
            lastName: "last_name",
            isAdmin: "is_admin",
          }
    })
        test("get proper response data", function(){
            const {setCols, values} = sqlForPartialUpdate(data, jstoSql)
            expect(setCols.indexOf('$5')).not.toBe(-1)
            expect(values.length).toBe(5)
            expect(values.length).toBe(5)
            expect(values.includes('jdtest')).toBeTruthy()
            expect(setCols.includes('isAdmin')).toBeFalsy()
            expect(setCols.includes('is_admin')).toBeTruthy()
        })
        test("pass no data", function(){
            expect( () => {
                sqlForPartialUpdate({}, jstoSql)
                .toThrow()
                } 
            )
        })
        test("pass no data", function(){
            expect( () => {
                sqlForPartialUpdate({}, jstoSql)
                .toThrow(BadRequestError)
                } 
            )
        })
    })
    


 