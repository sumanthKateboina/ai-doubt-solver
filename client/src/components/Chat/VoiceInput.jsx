// ============================================
// VoiceInput.jsx - Voice Recording Component
// ============================================
// Three-state UI: idle → recording → stopped
// Uses MediaRecorder API to capture audio and
// produces an audio/webm blob for the parent.
//
// Props:
//   onRecorded(audioBlob) - called when student clicks Send
//   onCancel()            - called when student clicks ✕
//   disabled              - disables Send while message is uploading
// ============================================

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VoiceInput({ onRecorded, onCancel, disabled }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'recording' | 'stopped'
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const timerRef         = useRef(null);

  // Cleanup on unmount: stop the timer and release the microphone
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopStream();
    };
  }, []);

  // Helper: stop all microphone tracks
  const stopStream = () => {
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mediaRecorder;
      const options = { mimeType: 'audio/webm;codecs=opus' };
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        mediaRecorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        setStatus('stopped');
        stopStream();
      };

      mediaRecorder.start(250);
      setStatus('recording');
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= 119) {
            // Stop recording when we hit max 2 minutes (120s)
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error(err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error('Microphone access was denied. Please check site permissions.');
      } else {
        toast.error('Failed to access microphone for recording.');
      }
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onRecorded(audioBlob);
    }
  };

  const handleDiscard = () => {
    stopRecording();
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setStatus('idle');
    setDuration(0);
  };

  // Utility: format seconds as MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm text-gray-700">Voice Input</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── IDLE state ─────────────────────────────────────────── */}
      {status === 'idle' && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-4">Press the button and speak your doubt clearly</p>
          <button
            onClick={startRecording}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg transition-colors"
          >
            <Mic className="w-7 h-7" />
          </button>
          <p className="text-xs text-gray-400 mt-3">Max 2 minutes</p>
        </div>
      )}

      {/* ── RECORDING state ────────────────────────────────────── */}
      {status === 'recording' && (
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-500 font-medium text-sm">Recording...</span>
          </div>
          <p className="text-3xl font-mono font-bold text-gray-900 mb-4">{formatTime(duration)}</p>
          {/* Waveform animation */}
          <div className="flex items-center justify-center gap-1 mb-4 h-8">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-blue-400 rounded-full animate-bounce"
                style={{
                  height: `${Math.random() * 20 + 8}px`,
                  animationDelay: `${i * 50}ms`,
                  animationDuration: `${400 + Math.random() * 300}ms`,
                }}
              />
            ))}
          </div>
          <button
            onClick={stopRecording}
            className="w-14 h-14 bg-gray-800 hover:bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto shadow-lg transition-colors"
          >
            <Square className="w-5 h-5" />
          </button>
          <p className="text-xs text-gray-400 mt-2">Tap to stop</p>
        </div>
      )}

      {/* ── STOPPED state ──────────────────────────────────────── */}
      {status === 'stopped' && (
        <div className="py-2">
          <p className="text-sm text-gray-600 mb-3 text-center">
            Recording complete ({formatTime(duration)})
          </p>
          {audioUrl && (
            <audio controls src={audioUrl} className="w-full mb-4 rounded-lg" />
          )}
          <div className="flex gap-2">
            <button onClick={handleDiscard} className="btn-secondary flex-1 text-sm py-2">
              <X className="w-4 h-4" /> Discard
            </button>
            <button onClick={handleSend} disabled={disabled} className="btn-primary flex-1 text-sm py-2">
              {disabled
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                : <><Send className="w-4 h-4" /> Send</>
              }
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Will be transcribed by AssemblyAI
          </p>
        </div>
      )}
    </div>
  );
}
