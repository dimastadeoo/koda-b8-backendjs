CREATE TABLE "product_categorie" (
    "id_product"    BIGINT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "id_categorie"  BIGINT NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
    PRIMARY KEY ("id_product", "id_categorie")
);