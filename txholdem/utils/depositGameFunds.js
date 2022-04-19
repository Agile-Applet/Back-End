const dbo = require("../../infrastructure/conn");

/* Deposit funds from Texas Holdem 
      depositGameFunds({
        username: "otsojm",
        reqAmount: 100,
      });
      */
const depositGameFunds = async (data) => {
    const dbConnect = dbo.getDb();
    const { username, reqAmount } = data;

    /* Fetch existing balance */
    let query = { username: username };
    await dbConnect.collection("players").findOne(query, (err, result) => {
        if (result) {
            let oldAmount = parseFloat(result.amount);
            let newAmount = parseFloat(oldAmount) + parseFloat(reqAmount);
            dbConnect.collection("players").updateOne(
                {
                    username: username,
                },
                {
                    $set: {
                        amount: newAmount,
                    },
                },
                (err, result) => {
                    if (!err) {
                        console.log("Deposit successful.");
                        console.log(result);
                    } else {
                        console.error("Deposit failed.");
                    }
                }
            );
        } else if (err) {
            console.error("Deposit failed.");
        }
    });
};

module.exports = { depositGameFunds };
