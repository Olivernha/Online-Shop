const mongodb = require("mongodb");
const db = require("../database/database");
class Product {
  constructor(productData) {
    (this.title = productData.title),
      (this.summary = productData.summary),
      (this.price = +productData.price),
      (this.description = productData.description),
      (this.image = productData.image), //the name of the image file
      this.updateImageData();
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
    return new Product(product);
  }
  static async findAll() {
    const products = await db.getDb().collection("products").find().toArray();
    return products.map((product) => new Product(product));
  }
  updateImageData() {
    (this.imagePath = `product-data/images/${this.image}`), //the path to the image file
      (this.imageUrl = `/products/assets/images/${this.image}`); //the url to the image file`;
  }
  async save() {
    const productData = {
      title: this.title,
      summary: this.summary,
      price: this.price,
      description: this.description,
      image: this.image,
    };
    if (this.id) {
      const prodId = new mongodb.ObjectID(this.id);
      if (!this.image) {
        delete productData.image;
      }
      const product = await db
        .getDb()
        .collection("products")
        .updateOne({ _id: prodId }, { $set: productData });
      return product;
    } else {
      await db.getDb().collection("products").insertOne(productData);
    }
  }
  async replaceImage(newImage) {
    this.image = newImage;
    this.updateImageData();
  }
  remove() {
    const prodId = new mongodb.ObjectID(this.id);
    return db.getDb().collection("products").deleteOne({ _id: prodId });
  }
}
module.exports = Product;
