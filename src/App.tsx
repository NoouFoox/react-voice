import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [defaultVoicse, setDefaultVoicse] = useState<
    SpeechSynthesisVoice | undefined
  >(undefined);
  const [readTxt, setReadTxt] = useState<string>("");
  useEffect(() => {
    const handleVoicesChanged = () => {
      const defaultVoicse = speechSynthesis
        .getVoices()
        .find((voice) => voice.default);
      setDefaultVoicse(defaultVoicse);
    };
    speechSynthesis.onvoiceschanged = handleVoicesChanged;
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  });
  const [utter, setUtter] = useState<SpeechSynthesisUtterance | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const handlePlay = () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setUtter(null);
      setIsPlaying(false);
      setProgress(0);
      return;
    }
    const newUtter = new SpeechSynthesisUtterance(readTxt);
    newUtter.onstart = () => setIsPlaying(true);
    newUtter.onend = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    newUtter.onboundary = (event) => {
      if (event.name === 'word') {
        const spokenLength = event.charIndex + event.charLength;
        const totalLength = readTxt.length;
        setProgress((spokenLength / totalLength) * 100);
      }
    };
    setUtter(newUtter);
  };
  useEffect(() => {
    if (utter) {
      speechSynthesis.speak(utter);
    }
  }, [utter]);
  return (
    <div className="h-full w-full">
      {defaultVoicse && (
        <div className="p-2 flex flex-col h-full">
          <div className="bg-slate-500 rounded-lg text-white p-2 mb-2">
            <div>默认模型:{defaultVoicse.name}</div>
            <div>语言:{defaultVoicse.lang}</div>
          </div>
          <textarea
            value={readTxt}
            onChange={(event) => setReadTxt(event.target.value)}
            className="w-full rounded-lg p-1 mb-2 flex-1"
          />
          <button className="w-full" onClick={handlePlay}>
            {isPlaying ? "停止" : "播放"}
            {progress!==0&&progress}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
