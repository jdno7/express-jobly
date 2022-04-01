const { max } = require("pg/lib/defaults");
const { BadRequestError, ExpressError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

// take submitted "dataToUpdate" and return an object with :

  //                  {setCols : '"column_to_set"= $1, "column_to_set"=$2 ....'  
  //                        (dynamic SET SQL String)  Example: `UDPATE table SET ${set.Cols}`
  //                  values : [Array of, corresponding values, to setCols]}
  //                       
  // Pass an object in the jsToSql parameter to convert JS variables to SQL column names
  //                Example: {firstName: "first_name",lastName: "last_name", isAdmin: "is_admin"}

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  
  // {firstName: "Jimbo", lastName: "Jim"} => [firstName,lastName]
  const keys = Object.keys(dataToUpdate);
  // If there is no dataToUpdate or keys throw error
  if (keys.length === 0) throw new BadRequestError("No data");

  // [firstName, lastName] => ['"first_name"=$1', '"last_name"=$2']
  const cols = keys.map((colName, idx) =>
    // if the colName exists in jsToSql, use that value as colName 
    //          (converts JS variable to SQL column name)
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

//  Used to enhance the Company.getAll() class method 
// if search values are passed as a query string
// Pass req.query obj as "filters" 
// Will return a string 'search' to add after WHERE in the sql query
// name: will return any company name containig that string (case incensitive)
// minEmployees: will return companies with 'num_employees' greater than or equal to its value
// maxEmployees: will return companies with 'num_employees' less than or equal to its value

// {name: 'Binks', minEmployees: 60, maxEmployees: 500} => `name LIKE binks AND num_employees BETWEEN 60 AND 500`
function sqlQueryCompanySearch(filters){
  
  for (let key of Object.keys(filters)){
    if (!['name', 'minEmployees', 'maxEmployees'].includes(key)) {
      throw new ExpressError(`${key} is not a valid search. Must be name, minEmployees or maxEmployees`, 400)
    }

  if (+filters.minEmployees > +filters.maxEmployees){
    throw new ExpressError(`minEmployees:${filters.minEmployees} is Greater Than maxEmployees:${filters.maxEmployees}`)
  }
  }
  let search
  if (filters.name && !filters.minEmployees && !filters.maxEmployees){
    search = `lower(name) LIKE lower('%${filters.name}%')`
    return search
  }

  else if (filters.name && filters.minEmployees && filters.maxEmployees){
    
    search = `lower(name) LIKE lower('%${filters.name}%') AND num_employees BETWEEN ${filters.minEmployees} AND ${filters.maxEmployees}`
     
    return search
  }

  else if (filters.minEmployees && filters.maxEmployees){
    search = `num_employees BETWEEN ${filters.minEmployees} AND ${filters.maxEmployees}`
     
    return search
  }

  else if (filters.name && filters.minEmployees){
    search = `lower(name) LIKE lower('%${filters.name}%') AND num_employees >= ${filters.minEmployees}`
   
    return search
  }

  else if (filters.name && filters.maxEmployees){
    search = `lower(name) LIKE lower('%${filters.name}%') AND num_employees <= ${filters.maxEmployees}`
     
    return search
  }

  else if (filters.maxEmployees){
    search = `num_employees <= ${filters.maxEmployees}`
     
    return search
  }

  else if (filters.minEmployees){
    search = `num_employees >= ${filters.minEmployees}`
     
    return search
  }

  
}


function sqlQueryJobSearch(filters){
  
  for (let key of Object.keys(filters)){
    if (!['title', 'minSalary', 'maxSalary'].includes(key)) {
      throw new ExpressError(`${key} is not a valid search. Must be title, minSalary, or maxSalary`, 400)
    }

  if (+filters.minSalary > +filters.maxSalary){
    throw new ExpressError(`minSalary:${filters.minSalary} is Greater Than maxSalary:${filters.maxSalary}`)
  }
  }
  let search
  if (filters.title && !filters.minSalary && !filters.maxSalary){
    search = `lower(title) LIKE lower('%${filters.title}%')`
    return search
  }

  else if (filters.title && filters.minSalary && filters.maxSalary){
    
    search = `lower(title) LIKE lower('%${filters.title}%') AND salary BETWEEN ${filters.minSalary} AND ${filters.maxSalary}`
     
    return search
  }

  else if (filters.minSalary && filters.maxSalary){
    search = `salary BETWEEN ${filters.minSalary} AND ${filters.maxSalary}`
     
    return search
  }

  else if (filters.title && filters.minSalary){
    search = `lower(title) LIKE lower('%${filters.title}%') AND salary >= ${filters.minSalary}`
    return search
  }

  else if (filters.title && filters.maxSalary){
    search = `lower(title) LIKE lower('%${filters.title}%') AND salary <= ${filters.maxSalary}`
     
    return search
  }

  else if (filters.maxSalary){
    search = `salary <= ${filters.maxSalary}`
     
    return search
  }

  else if (filters.minSalary){
    search = `salary >= ${filters.minSalary}`
     
    return search
  }

  
}


module.exports = { sqlForPartialUpdate, sqlQueryCompanySearch, sqlQueryJobSearch };
