const { Schema } = require("mongoose");

module.exports.OrdersSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    qty: {
        type: Number,
        required: true,
        min:1
    },
    price: {
        type: Number,
        required: true,
        min:0
    },
    mode: {
        type: String,
        required: true,
    },
});
