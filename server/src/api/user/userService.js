const dao = require("./userDao");
const { pool } = require("../../../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.duplicateTest = async (req_body) => {
  const con = await pool.getConnection(async (conn) => conn);
  const query = dao.duplicateTestQuery;
  const { email, nickName, phone } = req_body;
  const duplicateTestInfo = [email, nickName, phone];

  try {
    await con.beginTransaction();
    const row = await con.query(query, duplicateTestInfo);
    await con.commit();
    return row[0][0] ? 0 : 1;
  } catch (e) {
    await con.rollback();
    console.log(`Service error \n ${e}`);
    return null;
  } finally {
    con.release();
  }
};

exports.signIn = async (req_body) => {
  const { email, nickName, password, phone, emailAdv, smsAdv } = req_body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const signInInfo = [email, nickName, hashedPassword, phone, emailAdv, smsAdv];

  const con = await pool.getConnection(async (conn) => conn);
  const query = dao.singInDao;
  try {
    await con.beginTransaction();
    const row = await con.query(query, signInInfo);
    await con.commit();
    return row[0].affectedRows;
  } catch (e) {
    await con.rollback();
    console.log(`Service error \n ${e}`);
    return null;
  } finally {
    con.release();
  }
};

exports.login = async (req_body) => {
  const con = await pool.getConnection(async (conn) => conn);
  const query = dao.getUserByEamilQuery;
  const { email, password } = req_body;
  try {
    await con.beginTransaction();
    const row = await con.query(query, email);
    await con.commit();
    const user = row[0][0];

    if (!user) {
      return "noEmail";
    }

    const hashedPassword = user.password;
    const compare = bcrypt.compareSync(password, hashedPassword);
    if (!compare) {
      return "wrongPassword";
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }
    );
    const refreshToken = jwt.sign(
      {
        userId: user.id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }
    );

    const returnToken = { accessToken, refreshToken };
    return returnToken;
  } catch (e) {
    await con.rollback();
    console.log(`Service Error \n ${e}`);
  } finally {
    con.release();
  }
};
