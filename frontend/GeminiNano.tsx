import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    ai: any;
  }
}

export default function GeminiNano() {
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('Waiting for input...');
  const [session, setSession] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef(null);

  // Check for window.ai availability and initialize the session
  useEffect(() => {
    const initializeSession = async () => {
      if (!window.ai) {
        setOutput('Error: window.ai is not available. Please ensure you are using a compatible browser (e.g., Chrome Canary with flags enabled).');
        return;
      }
      try {
        const availability = await window.ai.canCreateGenericSession();
        if (availability !== 'readily-available') {
          setOutput(`Error: AI model not readily available. Status: ${availability}. Please check your browser settings and hardware requirements.`);
          return;
        }
        // @ts-ignore
        const newSession = await window.ai.createGenericSession({
          expectedInputs: [{ type: 'text' }, { type: 'image' }],
          expectedOutputs: [{ type: 'text' }]
        });
        setSession(newSession);
        setOutput('AI session initialized. Upload an image and enter a prompt.');
      } catch (error) {
        setOutput(`Error initializing AI session: ${error.message}`);
      }
    };
    initializeSession();
  }, []);

  const generate = async () => {
    if (!session) {
      setOutput('Error: AI session not initialized. Please refresh the page.');
      return;
    }

    if (!imageUrl && !prompt) {
      setOutput('Please upload an image or enter a text prompt.');
      return;
    }

    setOutput('Sending prompt...');

    try {
      const promptParts = [];
      if (prompt) {
        promptParts.push({ type: 'text', text: prompt });
      }
      if (imageUrl) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        promptParts.push({ type: 'image', image: blob });
      }
      // @ts-ignore
      const result = await session.prompt(promptParts);
      setOutput(result.text);
    } catch (error) {
      // @ts-ignore
      setOutput(`Error during prompting: ${error.message}`);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gemini Nano (Client-side)</h1>
      <div className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
        <button
          className="w-full p-2 bg-gray-200 rounded"
          // @ts-ignore
          onClick={() => fileInputRef.current.click()}
        >
          Select Image
        </button>
        {imageUrl && (
          <img src={imageUrl} alt="Selected" className="w-full h-auto rounded" />
        )}
        <textarea
          className="w-full p-2 border border-gray-300 rounded"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt..."
        />
        <button
          className="w-full p-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          onClick={generate}
          disabled={!session}
        >
          {session ? 'Generate' : 'Loading model...'}
        </button>
        <div className="p-2 border border-gray-300 rounded bg-gray-100">
          <p>{output}</p>
        </div>
      </div>
    </div>
  );
}
