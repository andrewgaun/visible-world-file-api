import express from 'express';
import bodyParser from 'body-parser';

import network from './models/network';
import errorHandler from './middleware/error-handler';

const app = express();
app.use(bodyParser.json());

app.get('/hosts', (req, res) => {
  res.json(network.getHosts());
});

app.post('/host', (req, res) => {
  network.addHost(req.body);
  res.json({
    status: 'added',
  });
});

app.post('/link', (req, res) => {
  network.addLink(req.body);
  res.json({
    status: 'added',
  });
});

app.get('/links', (req, res) => {
  res.json(network.getLinks());
});

app.get('/path/:source/to/:target', (req, res) => {
  res.json(network.path(req.params.source, req.params.target));
});

app.use(errorHandler);

app.listen(process.env.PORT || 3000);
