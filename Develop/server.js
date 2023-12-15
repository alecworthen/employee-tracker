import inquirer from "inquirer";
import mysql from "mysql2";

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'employee_db',
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Database connection established.');
    start();
})

function start() {
    inquirer
      .prompt({
        type: 'list',
        name: 'selectedAction',
        message: 'What operation would you like to perform?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Add a manager',
          'Update an employee role',
          'Exit',
        ],
      })
      .then((response) => {
        switch (response.selectedAction) {
          case 'View all departments':
            displayAllDepartments();
            break;
          case 'View all roles':
            displayAllRoles();
            break;
          case 'View all employees':
            displayAllEmployees();
            break;
          case 'Add a department':
            createDepartment();
            break;
          case 'Add a role':
            createRole();
            break;
          case 'Add an employee':
            createEmployee();
            break;
          case 'Add a manager':
            assignManager();
            break;
          case 'Update an employee role':
            modifyEmployeeRole();
            break;
          case 'Exit':
            connection.end();
            console.log('See ya!');
            break;
        }
      });
  }
function displayAllDepartments() {
    const query = 'SELECT * FROM departments';
    connection.query(query, (err, res) => {
        if(err) throw err;
        console.table(res);
        start();
    });
}
function displayAllRoles() {
    const query = 'SELECT roles.title, roles.id, departments.departments_name, roles.salary from roles join departments on roles.department_id = departments.id';
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}
function displayAllEmployees() {
  const query =  `
  SELECT e.id, e.first_name, e.last_name, r.title, d.departments_name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager_name
  FROM employee e
  LEFT JOIN roles r ON e.role_id = r.id
  LEFT JOIN departments d ON r.department_id = d.id
  LEFT JOIN employee m ON e.manager_id = m.id;
  `;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}
function createDepartment() {
  inquirer
    .prompt({
      type: 'input',
      name: 'name',
      message: 'Input name of new department.',
    })
    .then((answer) => {
      console.log(answer.name);
      const query = `INSERT INTO departments (departments_name) VALUES ('${answer.name}')`;
      connection.query(query, (err, res) => {
        if (err) throw err;
        console.log(`Department ${answer.name} added to database.`);
        start();
        console.log(answer.name);
      });
    });
}
function createRole() {
  const query = 'SELECT * FROM departments';
  connection.query(query, (err, res) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'title',
          message: 'Please enter new role title:',
        },
        {
          type: 'input',
          name: 'salary',
          message: 'Please enter the salary of the new role:'
        },
        {
          type: 'list',
          name: 'department',
          message: 'Please select the department for the new role',
        },
      ])
      .then((answers) => {
        const department = res.find(
          (department) => department.name === answers.department
        );
        const query = 'INSERT INTO roles SET?';
        connection.query(
          query,
          {
            title: answers.title,
            salary: answers.salary,
            department_id: department.id,
          },
          (err, res) => {
            if (err) throw err;
            console.log(`${answers.title} role added with salry ${answers.salary} to the ${answers.department} department in the database.`);
            start();
          }
        );
      });
  });
}
function createEmployee() {
  connection.query('SELECT id, title FROM roles', (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    const roles = res.map(({ id, title }) => ({
      name: title,
      value: id,
    }));
    connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee',
      (err, res) => {
        if(err) {
          console.error(err);
          return;
        }
        const managers = res.map(({ id, name })=> ({
          name,
          value: id,
        }));
        inquirer
          .prompt([
            {
              type: 'input',
              name: 'firstName',
              message: 'Please enter employees first name:',
            },
            {
              type: 'input',
              name: 'lastName',
              message: 'Please enter employees last name:',
            },
            {
              type: 'list',
              name: 'roleId',
              message: 'Select employee role:',
              choices: roles,
            },
            {
              type: 'list',
              name: 'managerId',
              message: 'Select employee manager:',
              choices: [{name: 'none', value: null},
                ...managers,
              ],
            },
          ])
          .then((answers) => {
            const sql = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)';
            const values = [
              answers.firstName,
              answers.lastName,
              answers.roleId,
              answers.managerId,
            ];
            connection.query(sql, values, (err) => {
              if (err) {
                console.error(err);
                return;
              }
              console.log('New Employee Added!');
              start();
            });
          })
          .catch((err) => {
            console.error(err);
          });
      }
    )
  })
}
function assignManager() {
  const queryDepartments = 'SELECT * FROM departments';
  const queryEmployees = 'SELECT * FROM employee';

  connection.query(queryDepartments, (err, resDepartments) => {
    if (err) throw err;
    connection.query(queryEmployees, (err, resEmployees) => {
      if (err) throw err;
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'department',
            message: 'Please select an employee to add the manager to:',
            choices: resEmployees.map(
              (employee) => `${employee.first_name} ${employee.last_name}`
            ),
          },
          {
            type: 'list',
            name: 'manager',
            message: 'Select the employee manager:',
            choices: resEmployees.map(
              (employee) => `${employee.first_name} ${employee.last_name}`
            ),
          },
        ])
        .then((answers) => {
          console.log('Answers:', answers);

          const department = resDepartments.find(
            (department) =>
              department.departments_name === answers.department
          );
          const employee = resEmployees.find(
            (employee) => `${employee.first_name} ${employee.last_name}` === answers.department
          );
          const manager = resEmployees.find(
            (employee) => `${employee.first_name} ${employee.last_name}` === answers.manager
          );

          console.log('Department:', department);
          console.log('Employee:', employee);
          console.log('Manager:', manager);

          if (!department || !employee || !manager) {
            console.error('Error: Department, employee, or manager not found.');
            start();
            return;
          }

          const query = 'UPDATE employee SET manager_id = ? WHERE id = ? AND role_id IN (SELECT id FROM roles WHERE department_id = ?)';

          connection.query(query, 
            [manager.id, employee.id, department.id],
            (err, res) => {
              if (err) throw err;
              console.log(`${employee.first_name} ${employee.last_name} added to manager ${manager.first_name} ${manager.last_name} in ${department.departments_name} department.`);
              start();
            }
          );
        });
    });
  });
}

function modifyEmployeeRole() {
  const queryEmployees = 'SELECT employee_id, employee.first_name, employee.last_name, rolestitle FROM employee LEFT JOIN roles ON employee.role_id = roles.id';
  const queryRoles = 'SELECT * FROM roles';
  connection.query(queryEmployees, (err, resEmployees) => {
    if (err) throw err;
    connection.query(queryRoles, (err, resRoles) => {
      if (err) throw err;
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'employee',
            message: 'Please select the employee to update:',
            choices: resEmployees.map(
              (employee) => `${employee.first_name} ${employee.last_name}`
            ),
          },
          {
            type: 'list',
            name: 'role',
            message: 'Please select the new role:',
            choices: resRoles.map((role) => role.title),
          },
        ])
        .then((answers) => {
          const employee = resEmployees.find(
            (employee) => `${employee.first_name} ${employee.last_name}` === answers.employee
          );
          const role = resRoles.find(
            (role) => role.title === answers.role
          );
          const query = 'UPDATE employee SET role_id = ? WHERE id = ?';
          connection.query(
            query,
            [role.id, employee.id],
            (err, res) => {
              if (err) throw err;
              console.log(`${employee.first_name} ${employee.last_name} role has been updated to ${role.title} in the database.`);
              start();
            }
          );
        });
    });
  });
}

process.on('Quit', () => {
  connection.end();
});