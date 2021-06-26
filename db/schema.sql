CREATE SCHEMA IF NOT EXISTS testschema;

DROP TABLE IF EXISTS features;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS sku;
DROP TABLE IF EXISTS related;
DROP TABLE IF EXISTS styles;
DROP TABLE IF EXISTS products;


CREATE TABLE products(
  product_id SERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(50),
  slogan VARCHAR(255),
  description VARCHAR(500),
  category VARCHAR(50),
  default_price INTEGER
);

COPY products(product_id, name, slogan, description, category, default_price)
FROM '/Users/josephbalaoing/Hackreactor/SDC/product-service/db/csv/product.csv'
DELIMITER ','
CSV HEADER;
CREATE INDEX ON products (product_id);

CREATE TABLE styles(
  style_id SERIAL NOT NULL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  name VARCHAR(255),
  sale_price INTEGER,
  original_price INTEGER,
  default_style BOOLEAN,
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

COPY styles(style_id, product_id, name, sale_price, original_price, default_style)
FROM '/Users/josephbalaoing/Hackreactor/SDC/product-service/db/csv/styles.csv'
DELIMITER ','
NULL AS 'null'
CSV HEADER;
CREATE INDEX style_index ON styles (style_id);
CREATE INDEX product_index ON styles (product_id);

UPDATE styles
SET sale_price=0
WHERE sale_price IS NULL;

CREATE TABLE related(
  related_id SERIAL NOT NULL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  related_product_id INTEGER NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

COPY related(related_id, product_id, related_product_id)
FROM '/Users/josephbalaoing/Hackreactor/SDC/product-service/db/csv/related.csv'
DELIMITER ','
CSV HEADER;
CREATE INDEX ON related (product_id);

CREATE TABLE sku(
  sku_id SERIAL NOT NULL PRIMARY KEY,
  style_id INTEGER,
  size VARCHAR(255),
  quantity INTEGER,
  FOREIGN KEY (style_id) REFERENCES styles(style_id)
);

COPY sku(sku_id, style_id, size, quantity)
FROM '/Users/josephbalaoing/Hackreactor/SDC/product-service/db/csv/skus.csv'
DELIMITER ','
CSV HEADER;
CREATE INDEX ON sku (style_id);

CREATE TABLE photos(
  photo_id SERIAL NOT NULL PRIMARY KEY,
  style_id INTEGER,
  url TEXT,
  thumbnail_url TEXT,
  FOREIGN KEY (style_id) REFERENCES styles(style_id)
);

COPY photos(photo_id, style_id, url, thumbnail_url)
FROM '/Users/josephbalaoing/Hackreactor/SDC/product-service/db/csv/photos.csv'
DELIMITER ','
CSV HEADER;
CREATE INDEX ON photos (style_id);

CREATE TABLE features(
  feature_id SERIAL NOT NULL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  feature VARCHAR(255),
  value VARCHAR(255),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

COPY features(feature_id, product_id, feature, value)
FROM '/Users/josephbalaoing/Hackreactor/SDC/product-service/db/csv/features.csv'
DELIMITER ','
CSV HEADER;
CREATE INDEX ON features (product_id);