import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, Volume2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const VoiceSearchModal = ({ isOpen, onClose, onSearchParsed }) => {
  const { lang, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript('');
      setParsedResult(null);
      setErrorMsg('');
      return;
    }

    startListening();
  }, [isOpen]);

  const parseVoiceInput = (text) => {
    const lower = text.toLowerCase();
    const result = {
      rawText: text,
      locality: '',
      purpose: '',
      bhk: '',
      propertyType: '',
    };

    // Locality detection
    if (lower.includes('crossing') || lower.includes('क्रॉसिंग')) result.locality = 'Crossing Republik';
    else if (lower.includes('indirapuram') || lower.includes('इंदिरापुरम')) result.locality = 'Indirapuram';
    else if (lower.includes('raj nagar') || lower.includes('राज नगर')) result.locality = 'Raj Nagar Extension';
    else if (lower.includes('sector 62') || lower.includes('सेक्टर 62') || lower.includes('noida') || lower.includes('नोएडा')) result.locality = 'Sector 62';
    else if (lower.includes('golf course') || lower.includes('gurgaon') || lower.includes('गुड़गांव')) result.locality = 'Golf Course Road';

    // Purpose detection
    if (lower.includes('rent') || lower.includes('kiraya') || lower.includes('किराए') || lower.includes('किराया')) {
      result.purpose = 'rent';
    } else if (lower.includes('buy') || lower.includes('kharid') || lower.includes('खरीद') || lower.includes('sale') || lower.includes('बेचना')) {
      result.purpose = 'sale';
    } else if (lower.includes('pg') || lower.includes('पीजी') || lower.includes('hostel')) {
      result.purpose = 'pg';
    }

    // BHK detection
    if (lower.includes('1 bhk') || lower.includes('1bhk') || lower.includes('1 कमरा') || lower.includes('एक')) result.bhk = '1';
    else if (lower.includes('2 bhk') || lower.includes('2bhk') || lower.includes('2 कमरा') || lower.includes('दो')) result.bhk = '2';
    else if (lower.includes('3 bhk') || lower.includes('3bhk') || lower.includes('तीन')) result.bhk = '3';
    else if (lower.includes('4 bhk') || lower.includes('4bhk') || lower.includes('चार')) result.bhk = '4';

    // Property Type
    if (lower.includes('flat') || lower.includes('फ्लैट') || lower.includes('apartment')) result.propertyType = 'flat';
    else if (lower.includes('villa') || lower.includes('विला') || lower.includes('kothi')) result.propertyType = 'villa';
    else if (lower.includes('house') || lower.includes('makan') || lower.includes('मकान') || lower.includes('builder floor')) result.propertyType = 'independent_house';
    else if (lower.includes('office') || lower.includes('दुकान') || lower.includes('shop') || lower.includes('commercial')) result.propertyType = 'office';

    return result;
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg(
        lang === 'hi'
          ? 'आपके ब्राउज़र में वॉइस सर्च सपोर्टेड नहीं है। कृपया Chrome इस्तेमाल करें।'
          : 'Voice search is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg('');
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
        const parsed = parseVoiceInput(text);
        setParsedResult(parsed);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        setErrorMsg(
          lang === 'hi'
            ? 'आवाज़ साफ़ सुनाई नहीं दी। कृपया दोबारा माइक दबाकर बोलें।'
            : 'Could not hear speech clearly. Please try speaking again.'
        );
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to initialize microphone');
    }
  };

  const handleApplySearch = () => {
    if (onSearchParsed && parsedResult) {
      onSearchParsed(parsedResult);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pulsating Microphone */}
        <div className="mb-6 flex justify-center">
          <div
            onClick={startListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-100 shadow-xl'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md'
            }`}
          >
            {isListening ? <Mic className="w-10 h-10 animate-bounce" /> : <Mic className="w-10 h-10" />}
          </div>
        </div>

        <h3 className="text-xl font-black text-[#222222] mb-1">
          {isListening ? (lang === 'hi' ? 'सुन रहे हैं... बोलिए' : 'Listening... Speak now') : (lang === 'hi' ? 'माइक पर टैप करके बोलें' : 'Tap Mic to Speak')}
        </h3>
        <p className="text-xs text-[#777777] mb-4">
          {lang === 'hi'
            ? 'उदाहरण: "Crossing Republik mein 3 BHK flat rent" या "Indirapuram mein kothi"'
            : 'Example: "3 BHK flat for rent in Crossing Republik" or "Shop in Sector 62 Noida"'}
        </p>

        {/* Live Transcript Display */}
        <div className="bg-[#F8F8F8] p-4 rounded-2xl border border-[#EEEEEE] mb-4 min-h-[64px] flex items-center justify-center">
          {transcript ? (
            <p className="text-sm font-bold text-[#222222] italic">"{transcript}"</p>
          ) : (
            <p className="text-xs text-gray-400">
              {isListening
                ? (lang === 'hi' ? 'आप जो बोलेंगे यहाँ दिखेगा...' : 'Your speech will appear here...')
                : (lang === 'hi' ? 'बोलने के लिए माइक बटन दबाएं' : 'Click the microphone button to start')}
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-[#C62828] rounded-xl text-xs font-semibold mb-4">
            {errorMsg}
          </div>
        )}

        {/* Parsed Keywords Tags */}
        {parsedResult && (
          <div className="mb-6 bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-left space-y-1.5 text-xs text-[#2E7D32]">
            <div className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {lang === 'hi' ? 'पहचाने गए फ़िल्टर्स:' : 'Understood Filters:'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {parsedResult.locality && (
                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold">
                  📍 {parsedResult.locality}
                </span>
              )}
              {parsedResult.purpose && (
                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold uppercase">
                  {parsedResult.purpose}
                </span>
              )}
              {parsedResult.bhk && (
                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold">
                  {parsedResult.bhk} BHK
                </span>
              )}
              {parsedResult.propertyType && (
                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold capitalize">
                  {parsedResult.propertyType}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={startListening}
            className="flex-1 py-2.5 rounded-xl border border-[#EEEEEE] text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            {lang === 'hi' ? 'दोबारा बोलें' : 'Speak Again'}
          </button>
          <button
            type="button"
            disabled={!transcript}
            onClick={handleApplySearch}
            className="flex-1 py-2.5 rounded-xl bg-[#C62828] text-white text-xs font-bold hover:bg-[#B71C1C] disabled:opacity-40 shadow-md"
          >
            {lang === 'hi' ? 'सर्च अप्लाई करें →' : 'Apply Search →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceSearchModal;
