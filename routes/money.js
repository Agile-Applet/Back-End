require("dotenv").config();
const express = require("express");
const router = express.Router();
const dbo = require("../infrastructure/conn");

/* Endpoint to update players balance. */
router.post("/deposit", async (req, res) => {
  const dbConnect = dbo.getDb();
  const { username, reqAmount } = req.body;

  console.log(req.body);

  /* Fetch existing balance. */
  let query = { username: username };
  await dbConnect.collection("players").findOne(query, (err, result) => {
    if (result) {
      console.log();
      let oldAmount = parseFloat(result.amount);
      let newSaldo = parseFloat(oldAmount) + parseFloat(reqAmount);
      dbConnect.collection("players").updateOne(
        {
          username: username,
        },
        {
          $set: {
            amount: newSaldo,
          },
        },
        (err, result) => {
          if (!err) {
            res
              .status(200)
              .json({ amount: newSaldo, message: "Deposit succesful." });
          } else {
            res.status(500).json({ amount: reqAmount, message: "Deposit failed." });
          }
        }
      );
    } else if (err) {
      res.status(500).json({ message: "Deposit failed." });
    } else {
      res.status(500).json({ message: "Deposit failed." });
    }
  });
});

module.exports = router;
