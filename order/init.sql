CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  price INT,
  stock INT
);

INSERT INTO products (name, price, stock)
VALUES
  ('Laptop', 800, 5),
  ('Phone', 400, 10),
  ('Headphone', 100, 20);
