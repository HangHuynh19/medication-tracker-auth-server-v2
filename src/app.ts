require('dotenv').config();
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import {errorHandler, notFound} from './middlewares';
import morgan from 'morgan';
import MessageResponse from './interfaces/MessageResponse';
import api from './api';

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API location: api/v1',
  });
});

app.use('/api/v1', api);

app.use(notFound);
app.use(errorHandler);

export default app;
