import React, { useEffect, useRef, useState } from 'react';

const VoisRecorder = () => {

    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const recorderRef = useRef(null);
    const timeoutRef = useRef(null);
    const recognitionRef = useRef(null);


    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults;

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
                    const blob = new Blob(chunks, {type: 'audio/ogg; codecs=opus'});
                    setAudioUrl(URL.createObjectURL(blob));
                    setIsRecording(false);
                };

                recorderRef.current.start();
                setTimeoutHandler();
            })

    }

    const stopRecording = () => {
        if(recorderRef.current) {
            recorderRef.current.stop();
        }
        clearTimeout(timeoutRef.current);
    }

    const setTimeoutHandler = () => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            stopRecording();
        }, 2000);
    }

    const resetTimeout = () => {
        clearTimeout(timeoutRef.current)
        setTimeoutHandler();
    }

    const playAudio = () => {
        if(audioUrl){
            const audio = new Audio(audioUrl);
            audio.play();
        }
    }

    return (
        <div>
            <h1>Vois Recorder</h1>
            {isRecording ? <p>Recording...</p> : <p>Say "Hey Alexa" to start recording</p>}
            {audioUrl && (
                <div>
                    <button>Play Recorded Message</button>
                </div>
            )}
        </div>
    );
}

export default VoisRecorder;
