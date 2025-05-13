import express from 'express'
import cors from 'cors'

const app = express()
// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to my Express.js app</h1>
    <p>This is a simple web server built with Express.js.</p>
  `)
})
app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
