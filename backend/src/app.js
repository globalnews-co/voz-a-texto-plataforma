import express from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from 'body-parser';
import notasRoutes from "./routes/notas.routes.js";

const app=express();


//setings
app.set('port',3010)

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

//app.use(express.urlencoded({limit:'50mb', extended: true }));
//app.use(express.json({limit: '50mb', extended: true}));



app.use(bodyParser.json({limit: '50mb'}));


//routes
app.use("/api", notasRoutes);

export default app