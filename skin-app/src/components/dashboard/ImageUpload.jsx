import { useState, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Webcam from 'react-webcam';
import PredictionResult from './PredictionResult';
import { addDoc, collection, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import { 
  Microscope, 
  Upload, 
  Camera, 
  UploadCloud, 
  FolderOpen, 
  CheckCircle, 
  RefreshCw, 
  Loader2, 
  Brain, 
  CameraOff, 
  RotateCw, 
  HelpCircle, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Layers
} from 'lucide-react';

// Helper to compute consensus prediction from an array of results or image objects
const getConsensus = (analyzedItems) => {
  if (analyzedItems.length < 2) return null;

  const diseaseSums = {};
  const diseaseCounts = {};

  analyzedItems.forEach(item => {
    const result = item.result || item;
    const probs = result.probabilities || [];
    probs.forEach(p => {
      diseaseSums[p.name] = (diseaseSums[p.name] || 0) + p.score;
      diseaseCounts[p.name] = (diseaseCounts[p.name] || 0) + 1;
    });

    if (result.disease && diseaseSums[result.disease] === undefined) {
      diseaseSums[result.disease] = result.confidence;
      diseaseCounts[result.disease] = 1;
    }
  });

  const totalImages = analyzedItems.length;
  const averagedProbabilities = Object.keys(diseaseSums).map(name => {
    const averageScore = Math.round((diseaseSums[name] / totalImages) * 10) / 10;
    return { name, score: averageScore };
  });

  averagedProbabilities.sort((a, b) => b.score - a.score);

  const topDisease = averagedProbabilities[0]?.name || "Unknown";
  const topConfidence = averagedProbabilities[0]?.score || 0;

  const severityMap = { 'Low': 1, 'Medium': 2, 'High': 3 };
  const inverseSeverityMap = { 1: 'Low', 2: 'Medium', 3: 'High' };
  let maxSeverityVal = 1;

  analyzedItems.forEach(item => {
    const result = item.result || item;
    const val = severityMap[result.severity] || 1;
    if (val > maxSeverityVal) maxSeverityVal = val;
  });

  const consensusSeverity = inverseSeverityMap[maxSeverityVal];

  return {
    disease: topDisease,
    confidence: topConfidence,
    severity: consensusSeverity,
    probabilities: averagedProbabilities
  };
};

const ImageUpload = ({ images, setImages, selectedImageId, setSelectedImageId }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState('upload'); // 'upload' or 'webcam'
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [webcamReady, setWebcamReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [facingMode, setFacingMode] = useState('user');

  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);

  // Helper to convert base64 (webcam capture) to a File object for the API request
  const convertBase64ToFile = async (base64String, filename = 'webcam-capture.jpg') => {
    const res = await fetch(base64String);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/jpeg' });
  };

  // Add selected files to the images state
  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    
    const newImages = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        status: 'ready',
        result: null,
        error: null
      }));

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      // If nothing is selected, select the first newly added image
      if (!selectedImageId) {
        setSelectedImageId(newImages[0].id);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  // Capture image from webcam and add to image list
  const handleCapture = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) return;

    const id = 'webcam-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const newImage = {
      id,
      file: null, // will convert from preview base64 on-demand when analyzing
      preview: screenshot,
      status: 'ready',
      result: null,
      error: null
    };

    setImages(prev => [...prev, newImage]);
    if (!selectedImageId) {
      setSelectedImageId(id);
    }
  }, [webcamRef, selectedImageId, setImages, setSelectedImageId]);

  // Helper to save a prediction result to Firestore and increment user scans count
  const savePredictionToFirestore = async (prediction, isConsensus = false, source = 'upload') => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, 'predictions'), {
        userId: user.uid,
        userName: user.displayName || user.email.split('@')[0],
        userEmail: user.email,
        disease: prediction.disease,
        confidence: prediction.confidence,
        severity: prediction.severity,
        probabilities: prediction.probabilities || [],
        source,
        isConsensus,
        createdAt: serverTimestamp()
      });

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        scans: increment(1)
      });
      console.log("Prediction successfully saved to Firebase!");
    } catch (err) {
      console.error("Error saving prediction to Firestore:", err);
    }
  };

  // Perform prediction request for a single image item
  const runPrediction = async (img) => {
    // Set individual status to analyzing
    setImages(prev => prev.map(item => item.id === img.id ? { ...item, status: 'analyzing', error: null } : item));

    try {
      let file = img.file;
      // If captured from webcam and file is null, convert preview base64 to File
      if (!file && img.preview.startsWith('data:image')) {
        file = await convertBase64ToFile(img.preview, `${img.id}.jpg`);
        // Update images list with generated File object
        setImages(prev => prev.map(item => item.id === img.id ? { ...item, file } : item));
      }

      if (!file) throw new Error("No image file found");

      const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log(`Flask Response for ${img.id}:`, result);

      if (!response.ok) {
        throw new Error(result.error || "Prediction failed");
      }

      const safeResult = {
        disease: result.disease || "Unknown",
        confidence: result.confidence || 0,
        severity: result.severity || "Medium",
        probabilities: Array.isArray(result.probabilities) ? result.probabilities : [],
        gradcam_url: result.gradcam_url || null,
      };

      setImages(prev => prev.map(item => item.id === img.id ? {
        ...item,
        status: 'success',
        result: safeResult
      } : item));

      return safeResult;

    } catch (error) {
      console.error(`Prediction Error for ${img.id}:`, error);
      setImages(prev => prev.map(item => item.id === img.id ? {
        ...item,
        status: 'error',
        error: error.message || "Failed to analyze image"
      } : item));
      return null;
    }
  };

  // Analyze all ready or failed images in parallel
  const handleAnalyzeAll = async () => {
    const targetImages = images.filter(img => img.status === 'ready' || img.status === 'error');
    if (targetImages.length === 0) return;

    setLoading(true);
    // Execute all predictions concurrently
    const results = await Promise.all(targetImages.map(img => runPrediction(img)));
    setLoading(false);

    // Collect all successful analyzed results
    const allAnalyzedResults = [];
    images.forEach((img) => {
      if (img.status === 'success' && img.result) {
        allAnalyzedResults.push(img.result);
      } else {
        const targetIdx = targetImages.findIndex(t => t.id === img.id);
        if (targetIdx !== -1 && results[targetIdx]) {
          allAnalyzedResults.push(results[targetIdx]);
        }
      }
    });

    if (allAnalyzedResults.length >= 2) {
      setSelectedImageId('consensus');
      const consensus = getConsensus(allAnalyzedResults);
      if (consensus) {
        const hasWebcam = images.some(img => img.id.startsWith('webcam') && (img.status === 'success' || targetImages.some(t => t.id === img.id)));
        const source = hasWebcam ? 'webcam' : 'upload';
        await savePredictionToFirestore(consensus, true, source);
      }
    } else if (allAnalyzedResults.length === 1) {
      const singleRes = allAnalyzedResults[0];
      const matchingImg = images.find(img => img.status === 'success') || targetImages.find((img, idx) => results[idx]);
      if (matchingImg && singleRes) {
        const source = matchingImg.id.startsWith('webcam') ? 'webcam' : 'upload';
        await savePredictionToFirestore(singleRes, false, source);
      }
    }
  };
  
  // Analyze a single image
  const handleAnalyzeSingle = async (img) => {
    setLoading(true);
    const result = await runPrediction(img);
    setLoading(false);

    if (result) {
      const source = img.id.startsWith('webcam') ? 'webcam' : 'upload';
      await savePredictionToFirestore(result, false, source);
    }
  };

  // Remove a single image from the list
  const handleRemoveImage = (id, e) => {
    e.stopPropagation(); // Avoid triggering card selection
    
    // Revoke object URL to prevent memory leaks if it is a local file
    const target = images.find(img => img.id === id);
    if (target && target.preview && target.preview.startsWith('blob:')) {
      URL.revokeObjectURL(target.preview);
    }

    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      
      // Handle adjusting selection
      if (selectedImageId === id) {
        if (filtered.length === 0) {
          setSelectedImageId(null);
        } else {
          // Select consensus if enough success images exist, otherwise first image
          const successCount = filtered.filter(img => img.status === 'success').length;
          if (successCount >= 2) {
            setSelectedImageId('consensus');
          } else {
            setSelectedImageId(filtered[0].id);
          }
        }
      }
      return filtered;
    });
  };

  const handleClearAll = () => {
    images.forEach(img => {
      if (img.preview && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setImages([]);
    setSelectedImageId(null);
  };

  // Compute consensus prediction
  const consensusResult = useMemo(() => {
    const analyzedImages = images.filter(img => img.status === 'success' && img.result);
    return getConsensus(analyzedImages);
  }, [images]);

  // Determine representative image for consensus prediction
  const representativeImage = useMemo(() => {
    if (!consensusResult) return null;
    const matchingImg = images.find(img => img.status === 'success' && img.result && img.result.disease === consensusResult.disease);
    if (matchingImg) return matchingImg.preview;
    const firstAnalyzed = images.find(img => img.status === 'success');
    return firstAnalyzed ? firstAnalyzed.preview : null;
  }, [images, consensusResult]);

  // Helper properties
  const analyzedImagesCount = useMemo(() => images.filter(img => img.status === 'success').length, [images]);
  const readyImagesCount = useMemo(() => images.filter(img => img.status === 'ready' || img.status === 'error').length, [images]);
  const isAnalyzingAny = useMemo(() => images.some(img => img.status === 'analyzing'), [images]);

  // Active view model
  const activeImage = useMemo(() => {
    if (!selectedImageId || selectedImageId === 'consensus') {
      // If consensus selected but not available, default to first image
      if (!consensusResult && images.length > 0) {
        return images[0];
      }
      return null;
    }
    return images.find(img => img.id === selectedImageId) || images[0] || null;
  }, [images, selectedImageId, consensusResult]);

  return (
    <div className="space-y-6">
      
      {/* Top Description and General Info */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1.5 flex items-center gap-2">
          <Microscope className="w-5.5 h-5.5 text-blue-600 dark:text-blue-400" />
          <span>{t('dashboard.scan.title', 'Skin Image Analysis')}</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {t('dashboard.scan.subtitle', 'Upload multiple skin images or capture webcam photos. Multiple perspectives of the same spot provide a highly robust consensus prediction.')}
        </p>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input, Image List & Actions (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Uploader / Webcam controls card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            {/* Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 mb-5">
              <button
                onClick={() => setMode('upload')}
                disabled={isAnalyzingAny}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  mode === 'upload'
                    ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                } disabled:opacity-50`}
              >
                <Upload className="w-4 h-4" />
                {t('dashboard.scan.upload', 'Upload Files')}
              </button>
              <button
                onClick={() => { setMode('webcam'); setCameraError(false); }}
                disabled={isAnalyzingAny}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  mode === 'webcam'
                    ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                } disabled:opacity-50`}
              >
                <Camera className="w-4 h-4" />
                {t('dashboard.scan.webcam', 'Webcam')}
              </button>
            </div>

            {/* UPLOAD PANEL */}
            {mode === 'upload' && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => !isAnalyzingAny && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  isAnalyzingAny 
                    ? 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 cursor-not-allowed'
                    : dragOver
                    ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 scale-[1.01] cursor-pointer'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-450 hover:bg-slate-50/80 dark:hover:bg-slate-750/30 cursor-pointer'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                  disabled={isAnalyzingAny}
                />
                <UploadCloud className={`w-12 h-12 mx-auto mb-3 ${dragOver ? 'text-blue-500 animate-bounce' : 'text-slate-400 dark:text-slate-550'}`} />
                <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-0.5">
                  {dragOver ? t('dashboard.scan.dropHere', 'Drop images here!') : t('dashboard.scan.dragDrop', 'Drag & drop skin images')}
                </p>
                <p className="text-slate-400 text-xs mb-3">
                  {t('dashboard.scan.browse', 'or click to browse')}
                </p>
                <span className="inline-flex bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs px-3 py-1.5 rounded-lg font-bold border border-blue-100 dark:border-blue-900/60 transition-colors hover:bg-blue-600 hover:text-white">
                  {t('dashboard.scan.chooseImage', 'Select Images')}
                </span>
              </div>
            )}

            {/* WEBCAM PANEL */}
            {mode === 'webcam' && (
              <div className="space-y-4">
                {cameraError ? (
                  <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-6 text-center">
                    <CameraOff className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <p className="font-semibold text-red-700 dark:text-red-400 text-sm mb-0.5">{t('dashboard.scan.cameraDenied', 'Camera Access Denied')}</p>
                    <p className="text-red-500 dark:text-red-350 text-xs mb-3">
                      {t('dashboard.scan.cameraHint', 'Please allow camera access in your browser settings.')}
                    </p>
                    <button
                      onClick={() => setCameraError(false)}
                      className="bg-red-650 hover:bg-red-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all"
                    >
                      {t('dashboard.scan.tryAgain', 'Try Again')}
                    </button>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video max-h-56">
                    {!webcamReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-spin" />
                          <p className="text-slate-400 text-xs">{t('dashboard.scan.startingCamera', 'Starting camera...')}</p>
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
                      className="w-full h-full object-cover"
                    />

                    {webcamReady && (
                      <>
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                          {t('dashboard.scan.live', 'LIVE')}
                        </div>
                        <button
                          onClick={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')}
                          className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md hover:bg-black/80 transition-colors flex items-center gap-1"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>{t('dashboard.scan.flip', 'Flip')}</span>
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Capture button */}
                <button
                  onClick={handleCapture}
                  disabled={!webcamReady || isAnalyzingAny}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4 text-white" />
                  {t('dashboard.scan.capture', 'Capture Spot Image')}
                </button>
              </div>
            )}
          </div>

          {/* Uploaded Spot Images list card */}
          {images.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                    {t('dashboard.scan.spotsList', 'Uploaded Spot Images')} ({images.length})
                  </h3>
                  {analyzedImagesCount > 0 && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {analyzedImagesCount} of {images.length} analyzed
                    </p>
                  )}
                </div>
                <button 
                  onClick={handleClearAll}
                  disabled={isAnalyzingAny}
                  className="text-xs text-red-500 hover:text-red-650 font-semibold disabled:opacity-40 transition-colors"
                >
                  {t('dashboard.scan.clearAll', 'Clear All')}
                </button>
              </div>

              {/* Grid of thumbnails */}
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, idx) => {
                  const isActive = activeImage?.id === img.id && selectedImageId !== 'consensus';
                  let borderStyle = 'border-slate-200 dark:border-slate-700';
                  
                  if (isActive) {
                    borderStyle = 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-800 border-blue-500';
                  } else if (img.status === 'analyzing') {
                    borderStyle = 'border-blue-450 animate-pulse';
                  } else if (img.status === 'success') {
                    borderStyle = 'border-green-500';
                  } else if (img.status === 'error') {
                    borderStyle = 'border-red-500';
                  }

                  return (
                    <div
                      key={img.id}
                      onClick={() => setSelectedImageId(img.id)}
                      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border bg-slate-50 dark:bg-slate-900 group transition-all hover:scale-[1.02] ${borderStyle}`}
                    >
                      <img
                        src={img.preview}
                        alt={`Spot ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Close/Remove button */}
                      <button
                        onClick={(e) => handleRemoveImage(img.id, e)}
                        disabled={isAnalyzingAny}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors opacity-90 sm:opacity-0 group-hover:opacity-100 disabled:opacity-40"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      {/* Status Badges */}
                      {img.status === 'success' && (
                        <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      {img.status === 'error' && (
                        <div className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm">
                          <AlertCircle className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      {img.status === 'analyzing' && (
                        <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[1px] flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                        </div>
                      )}

                      {/* Thumbnail Footer label if success */}
                      {img.status === 'success' && img.result && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-[1px] text-white text-[9px] py-0.5 px-1 truncate font-medium text-center">
                          {img.result.disease} ({img.result.confidence}%)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action: Run Analysis */}
              {readyImagesCount > 0 && (
                <button
                  onClick={handleAnalyzeAll}
                  disabled={loading || isAnalyzingAny}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('dashboard.scan.analyzing', 'Analyzing Spot Images...')}
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      {t('dashboard.scan.analyzeMultiple', 'Analyze Ready Spots ({{count}})').replace('{{count}}', readyImagesCount)}
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Quick instructions / Info tip */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/60 rounded-xl p-4 flex gap-3">
            <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1.5">
              <p className="font-semibold">{t('dashboard.scan.tipTitle', 'Tips for Better Analysis')}</p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>{t('dashboard.scan.tip1', 'Ensure good, bright lighting on the spot.')}</li>
                <li>{t('dashboard.scan.tip2', 'Upload multiple angles or distances of the same skin area.')}</li>
                <li>{t('dashboard.scan.tip3', 'Position spots clearly centered in the frame.')}</li>
              </ul>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Active Preview & Prediction Details (7 columns) */}
        <div className="lg:col-span-7">
          
          {/* EMPTY STATE: No images uploaded */}
          {images.length === 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/55 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-900/50">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                {t('dashboard.scan.awaitingImages', 'Awaiting Skin Images')}
              </h3>
              <p className="text-slate-400 dark:text-slate-450 text-sm max-w-sm">
                {t('dashboard.scan.awaitingSubtitle', 'Upload image files or capture photos on the left. The AI analysis and consensus report will appear here.')}
              </p>
            </div>
          )}

          {/* CONTENT STATE: Images exist */}
          {images.length > 0 && (
            <div className="space-y-6">
              
              {/* Tab selector for Consensus vs Individual */}
              {consensusResult && (
                <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-2">
                  <button
                    onClick={() => setSelectedImageId('consensus')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      selectedImageId === 'consensus'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-650 text-white shadow'
                        : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700/55'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('dashboard.scan.consensusReport', '✨ Combined Consensus Report')}</span>
                  </button>
                  <button
                    onClick={() => {
                      const firstSuccess = images.find(img => img.status === 'success');
                      setSelectedImageId(firstSuccess ? firstSuccess.id : images[0].id);
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      selectedImageId !== 'consensus'
                        ? 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700/55'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{t('dashboard.scan.individualSpots', 'Individual Spot Results')}</span>
                  </button>
                </div>
              )}

              {/* CONSENSUS DETAIL PANEL */}
              {selectedImageId === 'consensus' && consensusResult && (
                <div className="space-y-4">
                  {/* Consensus Summary header */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-indigo-600/10 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-5 border border-blue-100/50 dark:border-blue-900/30 flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-none shrink-0">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-base">
                        {t('dashboard.scan.consensusActive', 'Multi-Image Consensus Summary')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('dashboard.scan.consensusDesc', 'Computed by merging findings from {{count}} spot images for a more stable prediction.').replace('{{count}}', images.filter(img => img.status === 'success').length)}
                      </p>
                    </div>
                  </div>

                  {/* Render aggregate PredictionResult */}
                  <PredictionResult data={consensusResult} image={representativeImage} />
                </div>
              )}

              {/* INDIVIDUAL DETAIL PANEL */}
              {selectedImageId !== 'consensus' && activeImage && (
                <div className="space-y-6">
                  
                  {/* Selected Spot image preview and individual state */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                      <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
                        <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>{t('dashboard.scan.spotDetails', 'Spot Details')}</span>
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-450 dark:text-slate-400 uppercase tracking-wide">
                        {activeImage.id.startsWith('webcam') ? 'Webcam Snap' : 'Uploaded Image'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Left: Image Box */}
                      <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 aspect-video md:aspect-square max-h-64 md:max-h-none">
                        <img
                          src={activeImage.preview}
                          alt="Active Spot"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Right: Actions / Quick status */}
                      <div className="flex flex-col justify-center space-y-4">
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                            {t('dashboard.scan.status', 'Analysis Status')}
                          </div>
                          
                          {activeImage.status === 'ready' && (
                            <div className="inline-flex items-center gap-1.5 bg-slate-150 dark:bg-slate-700 text-slate-700 dark:text-slate-350 text-xs px-3 py-1 rounded-full font-bold">
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                              <span>{t('dashboard.scan.readyToScan', 'Ready to Scan')}</span>
                            </div>
                          )}

                          {activeImage.status === 'analyzing' && (
                            <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400 text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{t('dashboard.scan.analyzingLabel', 'Running AI analysis...')}</span>
                            </div>
                          )}

                          {activeImage.status === 'success' && (
                            <div className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-950/45 text-green-700 dark:text-green-400 text-xs px-3 py-1 rounded-full font-bold">
                              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                              <span>{t('dashboard.scan.analyzed', 'Scan Successful')}</span>
                            </div>
                          )}

                          {activeImage.status === 'error' && (
                            <div className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-950/45 text-red-750 dark:text-red-400 text-xs px-3 py-1 rounded-full font-bold">
                              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                              <span>{t('dashboard.scan.failed', 'Scan Failed')}</span>
                            </div>
                          )}
                        </div>

                        {activeImage.status === 'ready' && (
                          <div className="space-y-2">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {t('dashboard.scan.readyExpl', 'This specific spot has not been scanned yet. You can scan it individually or run analysis on all ready spots.')}
                            </p>
                            <button
                              onClick={() => handleAnalyzeSingle(activeImage)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                            >
                              <Brain className="w-3.5 h-3.5" />
                              <span>{t('dashboard.scan.runScan', 'Run AI Scan')}</span>
                            </button>
                          </div>
                        )}

                        {activeImage.status === 'error' && (
                          <div className="space-y-2 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/50 rounded-xl p-3">
                            <p className="text-xs text-red-700 dark:text-red-400">
                              {activeImage.error || t('dashboard.scan.defaultError', 'Failed to predict skin condition. Please try again.')}
                            </p>
                            <button
                              onClick={() => handleAnalyzeSingle(activeImage)}
                              className="w-full bg-red-650 hover:bg-red-700 text-white font-semibold text-xs py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>{t('dashboard.scan.retry', 'Retry Analysis')}</span>
                            </button>
                          </div>
                        )}

                        {activeImage.status === 'success' && activeImage.result && (
                          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              {t('dashboard.scan.predictionSummary', 'Prediction Summary')}
                            </div>
                            <div className="flex justify-between text-xs text-slate-700 dark:text-slate-350">
                              <span>Condition:</span>
                              <span className="font-bold text-slate-900 dark:text-white">{activeImage.result.disease}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-700 dark:text-slate-350">
                              <span>Confidence:</span>
                              <span className="font-bold text-slate-900 dark:text-white">{activeImage.result.confidence}%</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-700 dark:text-slate-350">
                              <span>Risk Level:</span>
                              <span className="font-bold text-slate-900 dark:text-white">{activeImage.result.severity}</span>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>

                  {/* Render the individual prediction results details below if success */}
                  {activeImage.status === 'success' && activeImage.result && (
                    <PredictionResult data={activeImage.result} image={activeImage.preview} />
                  )}
                  
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ImageUpload;