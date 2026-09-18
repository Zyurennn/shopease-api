require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('./models/Product');

async function main() {
    await mongoose.connect(process.env.MONGO_URI);

    const plan = await Product
        .find({ category: 'Electronics' })
        .explain('executionStats');

    console.log(
        plan.executionStats.executionStages.stage
    );

    await mongoose.disconnect();
}

main();