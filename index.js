
const express = require('express');
const path = require('path')
const cors = require('cors');
const cookieParser = require('cookie-parser'); 
const corsOptions = require('./config/corsOptions');
require('dotenv').config(); 

const PORT = process.env.PORT;

const verifyJWT = require('./middleware/verifyJWT');
const credentials = require('./middleware/credentials');
const uploadProfile = require('./routes/uploadProfile');


// Import routes
const tasksRoutes = require('./routes/tasksRoutes');
const authRoutes = require('./routes/authRoutes');
const refresh = require('./routes/refresh');

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use("/static", express.static(path.join(__dirname, "/static")));

app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// Use routes
app.use('/auth', authRoutes);
app.use('/refresh', refresh);
app.use(verifyJWT); // Protect the following routes
app.use('/tasks', tasksRoutes);
app.use('/upload', uploadProfile);



app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));



