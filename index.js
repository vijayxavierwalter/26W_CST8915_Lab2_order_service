
const express = require('express');
const amqp = require('amqplib/callback_api');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const RABBITMQ_CONNECTION_STRING =
const RABBITMQ_CONNECTION_STRING = process.env.RABBITMQ_CONNECTION_STRING || 'amqp://RabbitMQ-VM:Vijayxavier$56@20.116.27.141:5672/';  // Fallback to localhost if not defined
const PORT = process.env.PORT || 3000;

let orders = [];

app.get('/', (req, res) => {
  res.send('Order service is running');
});

app.get('/orders', (req, res) => {
  res.json(orders);
});

app.post('/orders', (req, res) => {
  const order = req.body;
  orders.push(order);

  amqp.connect(RABBITMQ_CONNECTION_STRING, (err, conn) => {
    if (err) {
      return res.status(500).send('Error connecting to RabbitMQ');
    }

    conn.createChannel((err, channel) => {
      if (err) {
        return res.status(500).send('Error creating channel');
      }

      const queue = 'order_queue';
      const msg = JSON.stringify(order);

      channel.assertQueue(queue, { durable: false });
      channel.sendToQueue(queue, Buffer.from(msg));

      console.log('Sent order to queue:', msg);

      res.status(201).json({ message: 'Order received' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Order service is running on http://localhost:${PORT}`);
});
