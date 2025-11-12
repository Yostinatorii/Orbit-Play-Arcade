const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;

const USERS_FILE = path.join(__dirname, "users.json");
const UPLOAD_DIR = path.join(__dirname, "uploads");

// Ensure folders exist
if(!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if(!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({}));

app.use(express.static("."));
app.use(express.json());
app.use("/uploads", express.static(UPLOAD_DIR));

// Multer setup for multiple files
const storage = multer.diskStorage({
    destination: (req,file,cb)=> cb(null, UPLOAD_DIR),
    filename: (req,file,cb)=> cb(null,file.originalname)
});
const upload = multer({storage});

// Auth route
app.post("/auth", async (req,res)=>{
    const {username,password} = req.body;
    if(!username||!password) return res.json({success:false,message:"Invalid input"});
    const users = JSON.parse(fs.readFileSync(USERS_FILE));
    if(users[username]){
        const match = await bcrypt.compare(password, users[username].password);
        if(match) return res.json({success:true});
        return res.json({success:false,message:"Wrong password"});
    } else {
        // New user signup
        const hash = await bcrypt.hash(password,10);
        users[username] = {password:hash};
        fs.writeFileSync(USERS_FILE, JSON.stringify(users,null,2));
        return res.json({success:true});
    }
});

// Upload route
app.post("/upload", upload.array("gameFiles"), (req,res)=>{
    if(!req.files) return res.json({success:false});
    res.json({success:true, files:req.files.map(f=>f.originalname)});
});

// Get list of games
app.get("/games", (req,res)=>{
    fs.readdir(UPLOAD_DIR,(err,files)=>{
        if(err) return res.json([]);
        const all = ["neonclicker.surge.sh", ...files];
        res.json(all);
    });
});

// Start server
app.listen(PORT, ()=> console.log(`OrbitPlay running on port ${PORT}`));
