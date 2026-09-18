require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const uri = process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TEST :
process.env.MONGO_URI;

mongoose.connect(process.env.MONGO_URI).then(() => {
app.listen(process.env.PORT, () => console.log(`ShopEase API on port
${process.env.PORT}`));
});
