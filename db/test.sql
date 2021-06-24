CREATE SCHEMA IF NOT EXISTS testschema;

DROP TABLE IF EXISTS products;
CREATE TABLE products(
  id INTEGER PRIMARY KEY,
  name VARCHAR(50),
  slogan VARCHAR(255),
  description VARCHAR(500),
  category VARCHAR(50),
  default_price INTEGER
);

COPY products(id, name, slogan, description, category, default_price)
FROM '/Users/josephbalaoing/Hackreactor/SDC/product-service/db/csv/product.csv'
DELIMITER ','
CSV HEADER;

DROP TABLE IF EXISTS sku;
CREATE TABLE sku(
  id INTEGER PRIMARY KEY,
  styleId INTEGER,
  size VARCHAR(255),
  quantity INTEGER
);

COPY sku(id, styleId, size, quantity)
FROM '/Users/josephbalaoing/Hackreactor/SDC/product-service/db/csv/skus.csv'
DELIMITER ','
CSV HEADER;


