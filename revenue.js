require('dotenv').config();

const mongoose = require('mongoose');
const Order = require('./models/Order');

async function main() {
    await mongoose.connect(process.env.MONGO_URI);

    const revenueByCategory = await Order.aggregate([
        {
            $unwind: '$items'
        },
        {
            $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'productInfo'
            }
        },
        {
            $unwind: '$productInfo'
        },
        {
            $group: {
                _id: '$productInfo.category',
                totalRevenue: {
                    $sum: {
                        $multiply: [
                            '$items.price',
                            '$items.qty'
                        ]
                    }
                }
            }
        },
        {
            $sort: {
                totalRevenue: -1
            }
        }
    ]);

    console.log(revenueByCategory);

    await mongoose.disconnect();
}

main();