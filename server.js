// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let messages = [];        // chat messages
let devices = {};         // deviceId -> { name, connected }
let requests = [];        // pending connection requests

function nowISO(){ return new Date().toISOString(); }

app.get("/api/check", (req,res)=> res.json({ status:'ok', time: nowISO() }));

app.post("/api/connect", (req,res)=>{
  const { deviceId, name } = req.body;
  if(!deviceId || !name) return res.status(400).json({ error:'deviceId & name required' });
  devices[deviceId] = devices[deviceId] || { name, connected:false };
  const id = Math.random().toString(36).slice(2,9);
  const obj = { id, deviceId, name, time: nowISO() };
  requests.push(obj);
  res.json({ ok:true, request: obj });
});

app.get("/api/requests", (req,res)=> res.json(requests));

app.post("/api/accept", (req,res)=>{
  const { requestId } = req.body;
  const idx = requests.findIndex(r=> r.id === requestId);
  if(idx === -1) return res.status(404).json({ error:'not found' });
  const r = requests.splice(idx,1)[0];
  devices[r.deviceId] = { name: r.name, connected: true };
  res.json({ ok:true, deviceId: r.deviceId, device: devices[r.deviceId] });
});

app.post("/api/messages", (req,res)=>{
  const { from, text } = req.body;
  if(!from || !text) return res.status(400).json({ error:'from & text required' });
  const m = { from, text, time: nowISO() };
  messages.push(m);
  if(messages.length > 1000) messages = messages.slice(-500);
  res.json(m);
});

app.get("/api/messages", (req,res)=>{
  const last = parseInt(req.query.last)||100;
  res.json(messages.slice(-last));
});

app.get("/api/devices", (req,res)=>{
  const arr = Object.keys(devices).map(id=> ({ deviceId:id, name:devices[id].name, connected:devices[id].connected }));
  res.json(arr);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log('Server running on port', PORT));
