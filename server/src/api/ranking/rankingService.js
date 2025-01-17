const { pool } = require("../../../config/db");
const dao = require("./rankingDao");
const bcrypt = require("bcrypt");
const createJWT = require("../../function/createJWT");

exports.getRank = async (subjectId, userId) => {
  const con = await pool.getConnection(async (conn) => conn);
  try {
    const query = dao.getRankBySubject(con, subjectId, userId);
    return query;
  } catch (err) {
    logger.err("Getting rank Service Error!\n : ${err.message}");
  } finally {
    con.release();
  }
};

exports.getAllSubRank = async (subjectId, userId) => {
  const con = await pool.getConnection(async (conn) => conn);
  try {
    const query = dao.getSubjectTopRanking(con, subjectId);
    return query;
  } catch (err) {
    logger.err("Getting rank Service Error!\n : ${err.message}");
  } finally {
    con.release();
  }
};
