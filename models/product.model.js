const mongodb = require("mongodb");
const deleteFile = require("../util/detachFile");
const db = require("../data/database");

class Product {
  constructor(productData) {
    this.title = productData.title;
    this.summary = productData.summary;
    this.price = +productData.price;
    this.description = productData.description;
    this.image = productData.image; // the name of the image file
    this.updateImageData();
    if (productData._id) {
      this.id = productData._id.toString();
    }
  }

  static async findById(productId) {
    let prodId;
    try {
      prodId = new mongodb.ObjectId(productId);
    } catch (error) {
      error.code = 404;
      throw error;
    }
    const product = await db
      .getDb()
      .collection("products")
      .findOne({ _id: prodId });

    if (!product) {
      const error = new Error("Could not find product with provided id.");
      error.code = 404;
      throw error;
    }

    return new Product(product);
  }

  static async findAll(page, ITEMS_PER_PAGE) {
    const numProducts = await db
      .getDb()
      .collection("products")
      .countDocuments();
    const totalItems = numProducts;
    const products = await db
      .getDb()
      .collection("products")
      .find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(+ITEMS_PER_PAGE)
      .toArray();

    return products.map(function (productDocument) {
      return new Product(productDocument);
    });
  }
  static async countProducts() {
    return await db.getDb().collection("products").countDocuments();
  }
  static async findMultiple(ids) {
    const productIds = ids.map(function (id) {
      return new mongodb.ObjectId(id);
    });

    const products = await db
      .getDb()
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray();

    return products.map(function (productDocument) {
      return new Product(productDocument);
    });
  }

  updateImageData() {
    this.imagePath = `product-data/images/${this.image}`;
    this.imageUrl = `/products/assets/images/${this.image}`;
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
      const productId = new mongodb.ObjectId(this.id);
      if (!this.image) {
        delete productData.image;
      } else {
        const product = await Product.findById(this.id);
        const deleteImage = product.image;
        await deleteFile(deleteImage);
      }

      await db.getDb().collection("products").updateOne(
        { _id: productId },
        {
          $set: productData,
        }
      );
    } else {
      await db.getDb().collection("products").insertOne(productData);
    }
  }

  replaceImage(newImage) {
    this.image = newImage;
    this.updateImageData();
  }

  remove() {
    const productId = new mongodb.ObjectId(this.id);
    deleteFile(this.image);
    return db.getDb().collection("products").deleteOne({ _id: productId });
  }
}

module.exports = Product;
