// Translation routes for Animal Translator API

const express = require('express');
const router = express.Router();
const { createUploadConfig, translationRateLimit } = require('../middleware');
const animalData = require('../data/animals');

const upload = createUploadConfig();

// Simple "AI" classification based on audio characteristics
function classifyAudio(audioBuffer, originalName = '') {
  const random = Math.random();
  
  // Check filename for hints (optional helper)
  const filename = originalName.toLowerCase();
  if (filename.includes('human') || filename.includes('voice') || filename.includes('speech')) {
    return 'human';
  }
  
  // 15% chance of human detection
  if (random < 0.15) {
    return 'human';
  }
  
  // Mock classification based on "audio analysis"
  const audioLength = audioBuffer.length;
  const mockFrequency = Math.random() * 1000;
  const mockIntensity = audioLength / 1000; // Rough intensity measure
  
  // Classification logic based on mock audio features  
  if (mockFrequency < 200 && mockIntensity > 5) {
    return 'dog'; // "Low frequency, high intensity" = excited dog
  } else if (mockFrequency >= 200 && mockFrequency < 400) {
    return 'cat'; // "Mid frequency" = cat sounds
  } else if (mockFrequency >= 400 && mockFrequency < 700) {
    return 'bird'; // "High frequency" = bird chirps
  } else if (mockFrequency >= 700) {
    return 'mosquito'; // "Very high frequency" = mosquito buzz
  } else {
    // Fallback to random
    const animals = ['dog', 'cat', 'bird', 'mosquito'];
    return animals[Math.floor(Math.random() * animals.length)];
  }
}

// Main translation endpoint
router.post('/', translationRateLimit, upload.single('audio'), async (req, res) => {
  try {
    console.log('🎵 Processing audio translation request...');
    
    let audioBuffer;
    let originalName = '';
    
    // Handle different input formats
    if (req.file) {
      // Multer file upload
      audioBuffer = req.file.buffer;
      originalName = req.file.originalname;
      console.log(`📁 File: ${originalName} (${req.file.size} bytes)`);
    } else if (req.body.audioData) {
      // Base64 audio data
      try {
        const base64Data = req.body.audioData.replace(/^data:audio\/[a-z0-9+-]+;base64,/, '');
        audioBuffer = Buffer.from(base64Data, 'base64');
        console.log(`📊 Base64 audio: ${audioBuffer.length} bytes`);
      } catch (err) {
        return res.status(400).json({
          error: 'Invalid audio data',
          message: 'Could not decode base64 audio data'
        });
      }
    } else {
      return res.status(400).json({
        error: 'No audio provided',
        message: 'Please provide audio file or base64 data'
      });
    }
    
    // Validate audio buffer
    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(400).json({
        error: 'Empty audio',
        message: 'The audio file appears to be empty. Did your pet forget to speak?'
      });
    }
    
    // Simulate AI processing time (more realistic)
    const processingDelay = 1200 + Math.random() * 1800; // 1.2-3 seconds
    await new Promise(resolve => setTimeout(resolve, processingDelay));
    
    // "Analyze" the audio
    const detectedAnimal = classifyAudio(audioBuffer, originalName);
    console.log(`🔍 Detected: ${detectedAnimal}`);
    
    // Get response from animal database
    let response;
    if (detectedAnimal === 'human') {
      response = { ...animalData.responses.human };
    } else {
      const animalOptions = animalData.responses[detectedAnimal];
      if (!animalOptions || animalOptions.length === 0) {
        throw new Error(`No responses available for ${detectedAnimal}`);
      }
      response = { ...animalOptions[Math.floor(Math.random() * animalOptions.length)] };
    }
    
    // Add metadata
    response.metadata = {
      processingTime: Math.round(processingDelay),
      confidence: Math.round((0.82 + Math.random() * 0.17) * 100), // 82-99%
      audioSize: audioBuffer.length,
      timestamp: new Date().toISOString(),
      detectedAnimal
    };
    
    console.log(`✅ Translation complete: ${response.animalType}`);
    
    res.json({
      success: true,
      ...response
    });
    
  } catch (error) {
    console.error('❌ Translation error:', error);
    res.status(500).json({
      error: 'Translation failed',
      message: error.message || 'Our animal translators are having a coffee break. Please try again!',
      timestamp: new Date().toISOString()
    });
  }
});

// Get translation statistics
router.get('/stats', (req, res) => {
  const stats = animalData.getStats();
  res.json(stats);
});

module.exports = router;