import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/tantverk"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const port = process.env.PORT || 9000
const app = express()

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 140
  },
  name: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
 })

 const Message = mongoose.model('Message', messageSchema)

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({
      message: 'Service unavailable'
    })
  }
})

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.get('/messages', async (req, res) => {
  try {
  const messages = await Message.find().sort({ createdAt: 'desc' }).exec()
  res.json({
    success: true,
    messages
  })
} catch {
  res.status(400).json({ error: `Invalid request` })
}
})

///messages?per_page=10&page={sidonummer}

/* app.get('/messages', async (req, res) => {
  const page = Number(req.query.page)
  const per_page = Number(req.query.per_page)

  const messages = await Message.aggregate([
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $skip: Number((page - 1) * per_page + 1)
    },
    {
      $limit: Number(per_page)
    }
  ])
  res.json(messages)
}) */


app.post('/messages', async (req, res) => {
  try {
    const newMessage = await new Message(req.body).save()
    res.status(200).json({
      success: true,
      newMessage
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    })
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
