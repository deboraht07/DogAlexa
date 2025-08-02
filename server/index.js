// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3003;

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Simple multer setup
const upload = multer({ storage: multer.memoryStorage() });

// Mock animal responses
const responses = {
  dog: {
    animalType: "Excited Dog 🐕",
    dialog: "WOOF WOOF! Translation: 'OH MY GOD! Did someone say WALK?! I LOVE EVERYTHING!'",
    memeImageURL: "/assets/memes/excited-dog.gif",
    audioURL: "/assets/audio/excited-dog.mp3",
    mood: "excited"
  },
  cat: {
    animalType: "Sassy Cat 🐱", 
    dialog: "Meow... Translation: 'I am not impressed by your existence, human. Feed me immediately.'",
    memeImageURL: "/assets/memes/sassy-cat.jpg",
    audioURL: "/assets/audio/sassy-cat.mp3",
    mood: "sassy"
  },
  bird: {
    animalType: "Gossip Bird 🐦",
    dialog: "TWEET TWEET! Translation: 'ATTENTION EVERYONE! This human just did something embarrassing!'",
    memeImageURL: "/assets/memes/gossipy-bird.gif", 
    audioURL: "/assets/audio/chatty-bird.mp3",
    mood: "dramatic"
  },
  mosquito: {
    animalType: "Vampire Mosquito 🦟",
    dialog: "Bzzzzzz... Translation: 'Your blood type is DELICIOUS! Mind if I invite my cousins?'",
    memeImageURL: "/assets/memes/vampire-mosquito.jpg",
    audioURL: "/assets/audio/evil-mosquito.mp3", 
    mood: "chaotic"
  },
  human: {
    animalType: "HUMAN DETECTED! 🕵️‍♂️",
    dialog: "Random animal detected... Go away, imposter! 🚨 This app is for REAL animals only!",
    memeImageURL: "/assets/memes/busted-human.gif",
    audioURL: "/assets/audio/busted-sound.mp3",
    mood: "busted"
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'healthy', 
    message: '🐾 Animal Translation Service is running!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Simple classification function
function classifyAudio(audioBuffer) {
  const random = Math.random();
  
  // 15% chance of human detection
  if (random < 0.15) {
    return 'human';
  }
  
  // Random animal selection
  const animals = ['dog', 'cat', 'bird', 'mosquito'];
  return animals[Math.floor(Math.random() * animals.length)];
}

// Translation endpoint
app.post('/api/translate', upload.single('audio'), async (req, res) => {
  console.log('🎵 Translation request received');
  
  try {
    let audioBuffer = null;
    
    // Handle file upload
    if (req.file) {
      audioBuffer = req.file.buffer;
      console.log(`📁 File uploaded: ${req.file.size} bytes`);
    }
    // Handle base64 data  
    else if (req.body.audioData) {
      try {
        const base64Data = req.body.audioData.replace(/^data:audio\/[^;]+;base64,/, '');
        audioBuffer = Buffer.from(base64Data, 'base64');
        console.log(`📊 Base64 processed: ${audioBuffer.length} bytes`);
      } catch (err) {
        console.error('❌ Base64 error:', err);
        return res.status(400).json({
          error: 'Invalid base64 data',
          message: 'Could not decode audio data'
        });
      }
    }
    
    if (!audioBuffer) {
      return res.status(400).json({
        error: 'No audio data',
        message: 'Please provide audio file or base64 data'
      });
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Classify audio
    const animal = classifyAudio(audioBuffer);
    console.log(`🔍 Detected: ${animal}`);
    
    // Get response
    const response = responses[animal];
    
    // Send response
    res.json({
      success: true,
      ...response,
      metadata: {
        confidence: Math.round(85 + Math.random() * 14),
        processingTime: 1000,
        audioSize: audioBuffer.length,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log(`✅ Translation sent: ${response.animalType}`);
    
  } catch (error) {
    console.error('❌ Translation error:', error);
    res.status(500).json({
      error: 'Translation failed',
      message: 'Our animal translators are on break!'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Animal Translator API is running!
📡 Port: ${PORT}
🌐 Health: http://localhost:${PORT}/api/health
🐾 Ready to translate animal thoughts!
  `);
});

module.exports = app;