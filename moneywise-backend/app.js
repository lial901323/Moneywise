const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const expenseRoutes = require('./routes/expenseRoutes');
const authRoutes = require('./routes/auth');
const depositRoutes = require('./routes/depositRoutes');
const statsRoutes = require('./routes/statsRoutes');



require('dotenv').config();


const app = express();
dotenv.config();
 

app.use(cors());
app.use(express.json());

app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/stats', require('./routes/statsRoutes'));




mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
