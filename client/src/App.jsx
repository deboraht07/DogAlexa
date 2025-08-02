import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Volume2, Sparkles, Heart, Zap } from 'lucide-react';

const AnimalTranslator = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const responseAudioRef = useRef(null);

  // Mock translation results for different animals
  const animalResponses = {
    dog: {
      animalType: "Dog 🐕",
      dialog: "Woof! Translation: 'Did someone say WALK?! Or TREAT?! Or did you just breathe?! I'M SO EXCITED!'",
      memeImageURL: "/api/placeholder/400/300", // Placeholder for your custom dog meme
      audioURL: "/api/placeholder/audio", // Placeholder for your custom audio
      mood: "excited"
    },
    cat: {
      animalType: "Cat 🐱",
      dialog: "Meow... Translation: 'I am not impressed by your existence, human. Feed me immediately or face my wrath.'",
      memeImageURL: "/api/placeholder/400/300", // Placeholder for your custom cat meme
      audioURL: "/api/placeholder/audio",
      mood: "sassy"
    },
    bird: {
      animalType: "Bird 🐦",
      dialog: "Tweet tweet! Translation: 'ATTENTION EVERYONE! This human thinks they own this place! How DARE they!'",
      memeImageURL: "/api/placeholder/400/300", // Placeholder for your custom bird meme
      audioURL: "/api/placeholder/audio",
      mood: "dramatic"
    },
    mosquito: {
      animalType: "Mosquito 🦟",
      dialog: "Bzzzz... Translation: 'Your blood type is delicious! Mind if I invite my 47,000 cousins over?'",
      memeImageURL: "/api/placeholder/400/300", // Placeholder for your custom mosquito meme
      audioURL: "/api/placeholder/audio",
      mood: "chaotic"
    },
    human: {
      animalType: "HUMAN DETECTED! 🕵️‍♂️",
      dialog: "Random animal detected... Go away, imposter! 🚨",
      memeImageURL: "/api/placeholder/400/300", // Placeholder for your custom "exposed" meme
      audioURL: "/api/placeholder/audio", // Placeholder for your custom "busted" sound
      mood: "busted"
    }
  };

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to use the Animal Translator!');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeAudio = async () => {
    if (!audioBlob) return;

    setIsAnalyzing(true);
    setResult(null);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock "AI" classification - randomly pick an animal or sometimes detect "human"
    const animals = ['dog', 'cat', 'bird', 'mosquito'];
    const randomChoice = Math.random();
    
    let selectedAnimal;
    if (randomChoice < 0.15) { // 15% chance of "human detection"
      selectedAnimal = 'human';
    } else {
      selectedAnimal = animals[Math.floor(Math.random() * animals.length)];
    }

    setResult(animalResponses[selectedAnimal]);
    setIsAnalyzing(false);
  };

  const playResponseAudio = () => {
    // This would play your custom audio files
    setIsPlayingResponse(true);
    // Simulate audio playing
    setTimeout(() => setIsPlayingResponse(false), 3000);
  };

  const resetApp = () => {
    setAudioBlob(null);
    setResult(null);
    setIsAnalyzing(false);
    setIsPlayingResponse(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'excited': return 'from-yellow-400 to-orange-500';
      case 'sassy': return 'from-purple-400 to-pink-500';
      case 'dramatic': return 'from-blue-400 to-indigo-500';
      case 'chaotic': return 'from-red-400 to-pink-500';
      case 'busted': return 'from-gray-600 to-red-600';
      default: return 'from-green-400 to-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🐾 Animal Translator 🎤
          </h1>
          <p className="text-xl text-white/90 font-medium">
            Let your pets finally tell you what they REALLY think! 🤔💭
          </p>
        </div>

        {/* Main Recording Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6">
          {!result && !isAnalyzing && (
            <div className="text-center">
              {/* Recording Button */}
              <div className="mb-8">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg transition-all duration-300 transform hover:scale-110 ${
                    isRecording 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse' 
                      : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                  }`}
                >
                  {isRecording ? <MicOff size={48} /> : <Mic size={48} />}
                </button>
              </div>

              {/* Recording Status */}
              {isRecording && (
                <div className="mb-6">
                  <div className="text-2xl font-bold text-red-600 mb-2">
                    🔴 RECORDING...
                  </div>
                  <div className="text-lg text-gray-600">
                    {formatTime(recordingTime)}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {audioBlob ? '🎵 Ready to Translate!' : '🎯 How it Works:'}
                </h2>
                {!audioBlob ? (
                  <div className="text-gray-600 space-y-2">
                    <p>1. Click the microphone and let your pet make some noise! 🐕🐱</p>
                    <p>2. Our advanced AI will decode their secret message 🤖</p>
                    <p>3. Get ready for some surprising revelations! 😱</p>
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Great! Now let's see what your furry friend has to say...
                  </p>
                )}
              </div>

              {/* Analyze Button */}
              {audioBlob && (
                <button
                  onClick={analyzeAudio}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Sparkles className="inline mr-2" size={24} />
                  Translate Animal Speech!
                </button>
              )}
            </div>
          )}

          {/* Analyzing Animation */}
          {isAnalyzing && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto border-8 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                🔍 Analyzing Animal Speech...
              </h2>
              <div className="text-lg text-gray-600 space-y-2">
                <p>🧠 Running advanced pet psychology algorithms...</p>
                <p>🎵 Decoding frequency patterns...</p>
                <p>💭 Translating thoughts to human language...</p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Animal Type Header */}
              <div className={`text-center p-6 rounded-2xl bg-gradient-to-r ${getMoodColor(result.mood)} text-white`}>
                <h2 className="text-3xl font-bold mb-2">
                  {result.animalType}
                </h2>
                {result.mood === 'busted' && (
                  <div className="text-xl">🚨 IMPOSTER ALERT! 🚨</div>
                )}
              </div>

              {/* Translation Dialog */}
              <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-purple-500">
                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                  <Volume2 className="mr-2" size={24} />
                  Translation:
                </h3>
                <p className="text-lg text-gray-700 italic leading-relaxed">
                  "{result.dialog}"
                </p>
              </div>

              {/* Meme Image Placeholder */}
              <div className="text-center">
                <div className="bg-gray-200 rounded-2xl p-8 border-2 border-dashed border-gray-400">
                  <div className="text-6xl mb-4">🖼️</div>
                  <p className="text-gray-600 font-medium">
                    [Your Custom Meme Image Will Appear Here]
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Image URL: {result.memeImageURL}
                  </p>
                </div>
              </div>

              {/* Audio Response Placeholder */}
              <div className="text-center">
                <button
                  onClick={playResponseAudio}
                  disabled={isPlayingResponse}
                  className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${
                    isPlayingResponse 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transform hover:scale-105'
                  }`}
                >
                  {isPlayingResponse ? (
                    <>
                      <Pause className="inline mr-2" size={20} />
                      Playing Response...
                    </>
                  ) : (
                    <>
                      <Play className="inline mr-2" size={20} />
                      Play Audio Response
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Audio URL: {result.audioURL}
                </p>
              </div>

              {/* Try Again Button */}
              <div className="text-center pt-4">
                <button
                  onClick={resetApp}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  🔄 Translate Another Animal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features Footer */}
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
            <Heart className="mx-auto mb-3 text-red-500" size={32} />
            <h3 className="font-bold text-gray-800 mb-2">Loving Messages</h3>
            <p className="text-sm text-gray-600">Discover your pet's sweet side</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
            <Zap className="mx-auto mb-3 text-yellow-500" size={32} />
            <h3 className="font-bold text-gray-800 mb-2">Sassy Comebacks</h3>
            <p className="text-sm text-gray-600">They have opinions about everything</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
            <Sparkles className="mx-auto mb-3 text-purple-500" size={32} />
            <h3 className="font-bold text-gray-800 mb-2">Dramatic Reveals</h3>
            <p className="text-sm text-gray-600">The truth behind every meow</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalTranslator;