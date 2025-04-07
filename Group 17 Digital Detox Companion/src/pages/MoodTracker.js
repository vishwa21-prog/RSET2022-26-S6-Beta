// App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { db } from './firebase';
import {
  collection, addDoc, getDocs, query, orderBy, where, serverTimestamp, deleteDoc, doc
} from 'firebase/firestore';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSmile, FaFrown, FaMeh, FaAngry, FaBed, FaTrash, FaSave, FaCalendar, FaMicrophone
} from 'react-icons/fa';

const moodIcons = {
  "Happy": <FaSmile />,
  "Sad": <FaFrown />,
  "Neutral": <FaMeh />,
  "Angry": <FaAngry />,
  "Tired": <FaBed />,
};

const moodTips = {
  "Happy": "Keep spreading the positivity!",
  "Sad": "It's okay to feel down. Take some time for self-care.",
  "Neutral": "A calm mind is a powerful mind.",
  "Angry": "Take deep breaths. Try to cool off with music or a walk.",
  "Tired": "Get some rest. Your body and mind will thank you.",
};

function MoodTracker() {
  const [mood, setMood] = useState('');
  const [submittedMood, setSubmittedMood] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [chartData, setChartData] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mood) return;
    try {
      await addDoc(collection(db, "moods"), {
        mood: mood,
        timestamp: serverTimestamp()
      });
      setSubmittedMood(mood);
      setMood('');
      fetchMoodHistory();
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  const fetchMoodHistory = async () => {
    try {
      const moodsCollection = collection(db, "moods");
      let q;
      const now = new Date();
      if (filter === "today") {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        q = query(moodsCollection, where("timestamp", ">=", startOfDay), orderBy("timestamp", "desc"));
      } else if (filter === "week") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        q = query(moodsCollection, where("timestamp", ">=", sevenDaysAgo), orderBy("timestamp", "desc"));
      } else {
        q = query(moodsCollection, orderBy("timestamp", "desc"));
      }

      const querySnapshot = await getDocs(q);
      const moods = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMoodHistory(moods);

      const moodCounts = {};
      moods.forEach((entry) => {
        const date = entry.timestamp?.toDate().toLocaleDateString() || "Unknown";
        moodCounts[date] = (moodCounts[date] || 0) + 1;
      });

      const formattedChartData = Object.keys(moodCounts).map((date) => ({
        date,
        count: moodCounts[date],
      }));

      setChartData(formattedChartData);
    } catch (error) {
      console.error('Error fetching mood history:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "moods", id));
      fetchMoodHistory();
    } catch (error) {
      console.error("Error deleting mood:", error);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      const recognizedMood = Object.keys(moodIcons).find((m) => m.toLowerCase() === transcript);
      if (recognizedMood) {
        setMood(recognizedMood);
      } else {
        alert("Mood not recognized. Try saying: Happy, Sad, Neutral, Angry, Tired.");
      }
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      alert("Voice recognition error: " + event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  useEffect(() => {
    fetchMoodHistory();
  }, [filter, submittedMood]);

  return (
    <div className="App">
      <h1>Mood Tracker</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="mood" id="mood-label">How are you feeling today?</label><br /><br />
        <select
          id="mood"
          aria-labelledby="mood-label"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        >
          <option value="">Select mood</option>
          {Object.keys(moodIcons).map((moodOption) => (
            <option key={moodOption} value={moodOption}>
              {moodOption}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={`mic-button ${isListening ? 'pulse' : ''}`}
          onClick={handleVoiceInput}
          aria-label="Speak your mood"
        >
          <FaMicrophone />
        </button>
        <motion.button
          type="submit"
          className="glow-button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaSave style={{ marginRight: '8px' }} /> Save Mood
        </motion.button>
      </form>

      {submittedMood && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <h2><FaSave /> Last Mood Logged:</h2>
          <p>{moodIcons[submittedMood]} {submittedMood}</p>
          <p className="tip">{moodTips[submittedMood]}</p>
        </motion.div>
      )}

      <div>
        <h2><FaCalendar /> Filter Mood Logs</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter mood logs"
        >
          <option value="all">All</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
        </select>
      </div>

      <div className="mood-history">
        <h2>Mood History</h2>
        <ul>
          <AnimatePresence>
            {moodHistory.map((entry) => (
              <motion.li
                key={entry.id}
                className={`mood-card mood-${entry.mood.toLowerCase()}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                tabIndex="0"
                aria-label={`Mood: ${entry.mood}`}
              >
                <strong>{moodIcons[entry.mood]} {entry.mood}</strong>
                <div className="timestamp">{entry.timestamp?.toDate().toLocaleString() || "Unknown time"}</div>
                <div className="tip">{moodTips[entry.mood]}</div>
                <motion.button
                  className="delete-btn"
                  onClick={() => handleDelete(entry.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Delete mood entry"
                >
                  <FaTrash />
                </motion.button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>Mood Chart (per Day)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MoodTracker;
