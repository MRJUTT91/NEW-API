const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// ✅ CORS allow karo for all origins (web + desktop)
app.use(cors({
  origin: "*"
}));

app.use(bodyParser.json());

let messages = [];

// ✅ Root
app.get("/", (req, res) => {
  res.json({ status: "API is running ✅" });
});

// ✅ Get messages
app.get("/messages", (req, res) => {
  res.json(messages);
});

// ✅ Post message
app.post("/messages", (req, res) => {
  const msg = { text: req.body.text, createdAt: new Date() };
  messages.push(msg);
  res.json({ reply: "Server received: " + msg.text });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
