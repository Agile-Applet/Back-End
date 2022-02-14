require("dotenv").config();
const express = require("express");
const router = express.Router();
const dbo = require("../conn");

/* Yay free money!! */
router.post("/deposit", async (req, res) => {
  const dbConnect = dbo.getDb();
  const { username, amount } = req.body;
  /* Fetch existing saldo */
  let query = { username: username };
  await dbConnect.collection("players").findOne(query, (err, result) => {
    if (result) {
      let saldo = parseFloat(result.saldo);
      let newSaldo = parseFloat(saldo) + parseFloat(amount);
      dbConnect.collection("players").updateOne(
        {
          username: username,
        },
        {
          $set: {
            saldo: newSaldo,
          },
        },
        (err, result) => {
          if (!err) {
            res
              .status(200)
              .json({ saldo: newSaldo, message: "Deposit succesful" });
          } else {
            res.status(500).json({ saldo: saldo, message: "Deposit failed" });
          }
        }
      );
    } else if (err) {
      res.status(500).json({ message: "Deposit failed" });
    } else {
      res.status(500).json({ message: "Deposit failed" });
    }
  });
});

module.exports = router;
