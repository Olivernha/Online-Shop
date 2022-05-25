const mongodb = require("mongodb");
const db = require("../database/database");
class Product {
  constructor(productData) {
    (this.title = productData.title),
      (this.summary = productData.summary),
      (this.price = +productData.price),
      (this.description = productData.description),
      (this.image = productData.image), //the name of the image file
      (this.imagePath = `product-data/images/${productData.image}`), //the path to the image file
      (this.imageUrl = `/products/assets/images/${productData.image}`); //the url to the image file`;
    if (productData._id) {
      this.id = productData._id.toString();
    }
  }
  static async findById(id) {
    let prodId;
    try {
      prodId = new mongodb.ObjectID(id);
    } catch (err) {
      err.code = 404;
      throw err;
    }
    const product = await db
      .getDb()
      .collection("products")
      .findOne({ _id: prodId });
    if (!product) {
      const error = new Error("Product not found with provided id");
      error.code = 404;
      throw error;
    }
    return product;
  }
  static async findAll() {
    const products = await db.getDb().collection("products").find().toArray();
    return products.map((product) => new Product(product));
  }
  async save() {
    const productData = {
      title: this.title,
      summary: this.summary,
      price: this.price,
      description: this.description,
      image: this.image,
    };
    await db.getDb().collection("products").insertOne(productData);
  }
}
module.exports = Product;
