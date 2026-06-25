import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Webcam from 'react-webcam';
import PredictionResult from './PredictionResult';


const ImageUpload = ({ onPrediction, predictionData }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState('upload'); // 'upload' or 'webcam'
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [webcamReady, setWebcamReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [facingMode, setFacingMode] = useState('user');

  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    onPrediction(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleCapture = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) return;
    setImagePreview(screenshot);
    // Convert base64 to file for API
    fetch(screenshot)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
        setImage(file);
      });
    onPrediction(null);
  }, [webcamRef, onPrediction]);

 const handleAnalyze = async () => {
    if (!image) return;
     console.log("API URL:", process.env.REACT_APP_API_URL)
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      onPrediction(data);
    } catch (error) {
      console.error('Prediction failed:', error);
    }
    setLoading(false);
  };

  const handleRetake = () => {
    setImage(null);
    setImagePreview(null);
    onPrediction(null);
    setWebcamReady(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    handleRetake();
    setCameraError(false);
  };

  return (
    <div className="space-y-6">

      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
          🔬 {t('dashboard.scan.title')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          {t('dashboard.scan.subtitle')}
        </p>

        {/* Mode Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 mb-6 w-full max-w-xs">
          <button
            onClick={() => switchMode('upload')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              mode === 'upload'
                ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            📤 {t('dashboard.scan.upload')}
          </button>
          <button
            onClick={() => switchMode('webcam')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              mode === 'webcam'
                ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            📷 {t('dashboard.scan.webcam')}
          </button>
        </div>

        {/* UPLOAD MODE */}
        {mode === 'upload' && (
          <>
            {!imagePreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
                    : 'border-slate-200 dark:border-slate-600 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <div className="text-6xl mb-4">
                  {dragOver ? '📂' : '📤'}
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-semibold text-lg mb-1">
                  {dragOver ? t('dashboard.scan.dropHere') : t('dashboard.scan.dragDrop')}
                </p>
                <p className="text-slate-400 text-sm mb-6">{t('dashboard.scan.browse')}</p>
                <span className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2.5 rounded-xl font-medium transition-all">
                  {t('dashboard.scan.chooseImage')}
                </span>
                <p className="text-xs text-slate-400 mt-4">
                  {t('dashboard.scan.fileTypes')}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-80 object-contain"
                  />
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-lg font-medium">
                    ✅ {t('dashboard.scan.ready')}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleRetake}
                    className="flex-1 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    🔄 {t('dashboard.scan.chooseDifferent')}
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 shadow-lg shadow-blue-200 dark:shadow-blue-900"
                  >
                    {loading ? `⏳ ${t('dashboard.scan.analyzing')}` : `🧠 ${t('dashboard.scan.analyze')}`}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* WEBCAM MODE */}
        {mode === 'webcam' && (
          <div className="space-y-4">
            {!imagePreview ? (
              <>
                {cameraError ? (
                  // Camera error state
                  <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-8 text-center">
                    <div className="text-5xl mb-3">📵</div>
                    <p className="font-semibold text-red-700 dark:text-red-400 mb-1">{t('dashboard.scan.cameraDenied')}</p>
                    <p className="text-red-500 dark:text-red-300 text-sm mb-4">
                      {t('dashboard.scan.cameraHint')}
                    </p>
                    <button
                      onClick={() => setCameraError(false)}
                      className="bg-red-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-red-700 transition-all"
                    >
                      {t('dashboard.scan.tryAgain')}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Live webcam feed */}
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900">
                      {!webcamReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10 rounded-2xl">
                          <div className="text-center">
                            <div className="text-4xl mb-3 animate-pulse">📷</div>
                            <p className="text-slate-400 text-sm">{t('dashboard.scan.startingCamera')}</p>
                          </div>
                        </div>
                      )}
                      <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode }}
                        onUserMedia={() => setWebcamReady(true)}
                        onUserMediaError={() => { setCameraError(true); setWebcamReady(false); }}
                        className="w-full rounded-2xl"
                        style={{ maxHeight: '340px', objectFit: 'cover' }}
                      />

                      {/* Live indicator */}
                      {webcamReady && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                          {t('dashboard.scan.live')}
                        </div>
                      )}

                      {/* Flip camera button */}
                      {webcamReady && (
                        <button
                          onClick={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')}
                          className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg hover:bg-black/70 transition-all"
                        >
                          🔄 {t('dashboard.scan.flip')}
                        </button>
                      )}

                      {/* Scanning overlay */}
                      {webcamReady && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <div className="w-48 h-48 border-2 border-blue-400/60 rounded-2xl relative">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400 rounded-tl-lg"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400 rounded-tr-lg"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400 rounded-bl-lg"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400 rounded-br-lg"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3 flex gap-2">
                      <span>💡</span>
                      <p className="text-blue-700 dark:text-blue-300 text-xs">
                        {t('dashboard.scan.tip')}
                      </p>
                    </div>

                    {/* Capture button */}
                    <button
                      onClick={handleCapture}
                      disabled={!webcamReady}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900 flex items-center justify-center gap-2"
                    >
                      <span className="text-xl">📸</span>
                      {t('dashboard.scan.capture')}
                    </button>
                  </>
                )}
              </>
            ) : (
              // Captured image preview
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                  <img
                    src={imagePreview}
                    alt="Captured"
                    className="w-full max-h-80 object-contain"
                  />
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-lg font-medium">
                    📸 {t('dashboard.scan.captured')}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleRetake}
                    className="flex-1 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    🔄 {t('dashboard.scan.retake')}
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 shadow-lg shadow-blue-200 dark:shadow-blue-900"
                  >
                    {loading ? `⏳ ${t('dashboard.scan.analyzing')}` : `🧠 ${t('dashboard.scan.analyze')}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading Animation */}
      {loading && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
          <div className="text-6xl mb-4 animate-pulse">🔬</div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
            {t('dashboard.scan.loadingTitle')}
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            {t('dashboard.scan.loadingSubtitle')}
          </p>
          {/* Animated progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full animate-pulse w-2/3"></div>
          </div>
          <p className="text-xs text-slate-400">{t('dashboard.scan.loadingModel')}</p>
        </div>
      )}

      {/* Prediction Result */}
      {predictionData && !loading && (
        <PredictionResult data={predictionData} image={imagePreview} />
      )}

    </div>
  );
};

export default ImageUpload;