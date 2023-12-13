INSERT INTO departments (departments_name)
VALUES
('Management Team'),
('Public Relations'),
('Personnel Management'),
('Financial Services'),
('Software Development'),
('IT Services'),
('Customer Support'),
('R&D Division'),
('Legal Affairs'),
('Facility Management');

INSERT INTO roles (title, salary, department_id)
VALUES 
('CEO', 555000.00, 1),
('Marketing Manager', 125000.00, 2),
('HR Director', 189000.00, 3),
('Finance Head', 145000.00, 4),
('Senior Engineer', 185000.00, 5),
('IT Manager', 125000.00, 6),
('Customer Relations Manager', 75000.00, 7),
('R&D Manager', 185000.00, 8),
('Legal Manager', 95000.00, 9),
('Maintenance Manager', 135000.00, 10);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Tony', 'Stark', 1, 1),
('Steve', 'Rogers', 2, 2),
('Peter', 'Parker', 3, 3),
('Matt', 'Murdock', 4, 4),
('Stephen', 'Strange', 5, 5),
('Reed', 'Richards', 6, 6),
('Bucky', 'Barnes', 7, 7),
('Miles', 'Morales', 8, 8),
('Jessica', 'Jones', 9, 9),
('Kamala', 'Khan', 10, 10)