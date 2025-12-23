const { Schema } = require("mongoose");

module.exports.PositionsSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    product: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    qty: {
        type: Number,
        required: true,
    },
    avg: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    net: {
        type: String,
        required: true,
    },
    day: {
        type: String,
        required: true,
    },
    isLoss: {
        type: Boolean,
        required: true,
    },
});