// Import necessary modules
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
dotenv.config({ path: '.env' });


connectDB()
const app = express();
app.use(cors())

// const allowedOrigin =
//   process.env.NODE_ENV === 'production'
//     ? 'https://clientverse.vercel.app'
//     : 'http://localhost:5173';



// const corsOptions = {
//   origin: allowedOrigin, // Allow requests from this origin
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Define allowed HTTP methods
//   credentials: true, // Allow cookies if needed
// };

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON bodies

// Set up routes
app.use('/', (req,res)=>{
    res.send('hello wtf!')
});




// Start the servers
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}, you better catch it!`);
});
export default app