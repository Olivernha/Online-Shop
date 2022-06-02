const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mongodb = require("mongodb");
const db = require("../data/database");

class User {
  constructor(
    email,
    password,
    fullname,
    street,
    postal,
    city,
    resetToken = null,
    resetTokenExpiration = null
  ) {
    this.email = email;
    this.password = password;
    this.name = fullname;
    this.address = {
      street: street,
      postalCode: postal,
      city: city,
    };
    this.resetToken = resetToken;
    this.resetTokenExpiration = resetTokenExpiration;
  }
  static async findById(userId) {
    const uid = new mongodb.ObjectID(userId);
    return db
      .getDb()
      .collection("users")
      .findOne(
        { _id: uid },
        {
          projection: {
            password: 0,
          },
        }
      );
  }
  getUserWithSameEmail() {
    return db.getDb().collection("users").findOne({ email: this.email });
  }

  async existsAlready() {
    const existingUser = await this.getUserWithSameEmail();
    if (existingUser) {
      return true;
    }
    return false;
  }

  async signup() {
    const hashedPassword = await bcrypt.hash(this.password, 12);
    await db.getDb().collection("users").insertOne({
      email: this.email,
      password: hashedPassword,
      name: this.name,
      address: this.address,
    });
  }
  hasMatchingPassword(hashedPassword) {
    return bcrypt.compare(this.password, hashedPassword);
  }

  static async generateResetToken() {
    const buffer = await crypto.randomBytes(32);
    const token = await buffer.toString("hex");
    return token;
  }
  saveResetToken(token, expiration, userId) {
    return db
      .getDb()
      .collection("users")
      .updateOne(
        { _id: userId },
        {
          $set: {
            resetToken: token,
            resetTokenExpiration: expiration,
          },
        }
      );
  }
  static async findByResetToken(token) {
    const user = await db
      .getDb()
      .collection("users")
      .findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
      });
    return user;
  }
  static async updatePassword(token,userId,password) {
    const user = await db
      .getDb()
      .collection("users")
      .findOneAndUpdate({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
        _id: new mongodb.ObjectID(userId),
      },{
        $set: {
          password: await bcrypt.hash(password,12),
          resetToken: null,
          resetTokenExpiration: null,
        },
      });
    return user;
  }
}

module.exports = User;
