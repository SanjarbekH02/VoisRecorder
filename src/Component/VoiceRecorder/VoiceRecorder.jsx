import React, { useState, useEffect, useRef } from 'react';
import recordImg from '../../images/voice_wave.gif'
import microphone from '../../images/image.png'
import './VoiceRecorder.css'

function VoiceRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioClips, setAudioClips] = useState([]); // Audiolarni saqlash uchun
    const recorderRef = useRef(null);
    const timeoutRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
                if (transcript.includes("hey alexa") && !isRecording) {
                    startRecording();
                } else if (isRecording) {
                    resetTimeout();
                }
            };

            recognitionRef.current.onend = () => recognitionRef.current.start();
            recognitionRef.current.start();
        }
    }, [isRecording]);

    const startRecording = () => {
        setIsRecording(true);
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                recorderRef.current = new MediaRecorder(stream);
                const chunks = [];
                recorderRef.current.ondataavailable = (e) => chunks.push(e.data);
                recorderRef.current.onstop = () => {
                    const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
                    const audioUrl = URL.createObjectURL(blob);
                    setAudioClips((prevClips) => [...prevClips, audioUrl]); // Yangi audio-ni listga qo'shish
                    setIsRecording(false);
                };
                recorderRef.current.start();
                setTimeoutHandler();
            });
    };

    const stopRecording = () => {
        if (recorderRef.current) {
            recorderRef.current.stop();
        }
        clearTimeout(timeoutRef.current);
    };

    const setTimeoutHandler = () => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            stopRecording();
        }, 3000);
    };

    const resetTimeout = () => {
        clearTimeout(timeoutRef.current);
        setTimeoutHandler();
    };

    const playAudio = (audioUrl) => {
        const audio = new Audio(audioUrl);
        audio.play();
    };

    return (
        <div className='record'>
            <h1 className='title'>Voice Recorder</h1>
            <div className="record-block">
                <div className='recording-box'>
                    {isRecording ? <div>
                        <img className='record-img' src={recordImg} alt="" />
                        <h2 className='recording-name'>Recording...</h2>
                    </div> : <div className='recording-card'>
                        <img className='mic-img' src={microphone} alt="microphone" />
                        <h2 className='record-title'>Say "Hey Alexa" to start recording</h2>
                    </div>}
                </div>

                <div className='recorded-message'>
                    <h2 className='recorded-name'>Recorded Messages</h2>
                    {audioClips.length > 0 ? (
                        <ul className='list'>
                            {audioClips.map((clip, index) => (
                                <li className='list-item' key={index}>
                                    <button className='play-btn' onClick={() => playAudio(clip)}>{index + 1} Play Recording</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className='no-record'>No recordings yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VoiceRecorder;
