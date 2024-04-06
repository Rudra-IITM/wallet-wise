import express from "express";
import db from "@repo/db/client";

const app = express();

app.use(express.json());

app.post("/hdfcWebhook",async (req, res) => {
    const paymentInformation = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    };

    try {
        await db.$transaction([
            db.balance.update({
                data: {
                    amount: {
                        increment: paymentInformation.amount
                    }
                },
                where: {
                    userId: paymentInformation.userId
                }
            }),
            db.onRampTransaction.update({
                data: {
                    status: "Success"
                },
                where: {
                    token: paymentInformation.token
                }
            })
        ]);

        res.json({
            message: "Payment Captured"
        })
    } catch (err) {
        console.error(err);
        res.status(411).json({
            message: "Error while capturing payment"
        })
    }
})

app.listen(3003);