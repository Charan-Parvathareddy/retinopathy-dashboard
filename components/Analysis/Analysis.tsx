"use client";
import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, Info } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/ui/file-upload";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import ErrorModal from '@/components/Analysis/ErrorModal';
import ModelRender from '@/components/Analysis/model-render';
import Benefits from '@/components/Analysis/Benefits';

interface EyeResult {
  predicted_class: number;
  confidence: number;
  explanation: string;
  Risk_Factor: number;
  Stage: string;
  Note: string;
}

interface ApiResponse {
  left_eye?: EyeResult;
  right_eye?: EyeResult;
  message?: string;
  error?: string;
}

interface ChartDataItem {
  name: string;
  value: number;
  displayValue: string;
  markers?: { position: number; label: string }[];
  isConfidence?: boolean;
  isPredictionClass?: boolean;
}

const getTooltipContent = (itemName: string): string => {
  switch (itemName) {
    case 'Prediction Class':
      return 'The model evaluates and indicates the Stage of diabetic retinopathy it has identified in your case.';
    case 'Confidence':
      return 'This shows how sure the model is about its prediction, with a higher number meaning more certainty.';
    case 'Risk_Factor':
      return 'This indicates the chance that your condition might get worse over time.';
    default:
      return '';
  }
};

const getColorForValue = (value: number, isConfidence: boolean, isPredictionClass: boolean): string => {
  if (isPredictionClass) {
    switch (value) {
      case 0: return 'hsl(120, 100%, 35%)'; // Green for No DR
      case 1: return 'hsl(60, 81.81818181818183%, 65.49019607843137%)';  // Yellow for Moderate DR
      case 2: return 'hsl(30, 100%, 50%)';  // Orange for Severe DR
      case 3: return 'hsl(0, 100%, 50%)';   // Red for Proliferative DR
      default: return 'hsl(0, 0%, 50%)';    // Gray for unknown
    }
  } else if (isConfidence) {
    if (value <= 33) return 'hsl(0, 100%, 50%)';    // Red for Low
    if (value <= 66) return 'hsl(30, 100%, 50%)';   // Orange for Medium
    return 'hsl(120, 100%, 35%)';                   // Green for High
  } else {
    // For Risk_Factor
    if (value <= 25) return 'hsl(120, 100%, 35%)';  // Green for Low
    if (value <= 50) return 'hsl(60, 81.81818181818183%, 65.49019607843137%)';   // Yellow for Medium-Low
    if (value <= 75) return 'hsl(30, 100%, 50%)';   // Orange for Medium-High
    return 'hsl(0, 100%, 50%)';                     // Red for High
  }
};

const CustomBarChart = ({ data }: { data: ChartDataItem[] }) => {
  return (
    <div className="space-y-6">
      {data.map((item) => (
        <motion.div 
          key={item.name} 
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-300 flex items-center">
              {item.name}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="ml-1 h-4 w-4 text-gray-400 " />
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1A2C4E] text-white rounded-lg border border-gray-600 shadow-lg p-2">
                    <p>{getTooltipContent(item.name)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="text-sm font-bold text-gray-100">{item.displayValue}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-5">
            <motion.div
              className="h-5 rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${item.isPredictionClass ? ((item.value + 1) / 4) * 100 : item.value}%`,
                backgroundColor: getColorForValue(item.value, item.isConfidence || false, item.isPredictionClass || false),
              }}
              initial={{ width: 0 }}
              animate={{ width: `${item.isPredictionClass ? ((item.value + 1) / 4) * 100 : item.value}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
          {item.markers && (
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              {item.markers.map((marker, idx) => (
                <div key={idx} className="text-center" style={{ width: '25%' }}>
                  {marker.label}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

const EyeAnalysisCard = ({ eye, data }: { eye: string; data: EyeResult }) => {
  const { Stage, confidence, explanation, Risk_Factor, predicted_class } = data;
  const chartData: ChartDataItem[] = [
    {
      name: 'Prediction Class',
      value: predicted_class,
      displayValue: Stage,
      markers: [
        { position: 25, label: 'No DR' },
        { position: 50, label: 'Moderate' },
        { position: 75, label: 'Severe' },
        { position: 100, label: 'Proliferative' },
      ],
      isPredictionClass: true
    },
    {
      name: 'Confidence',
      value: confidence,
      displayValue: `${confidence.toFixed(2)}%`,
      markers: [
        { position: 33, label: 'Low' },
        { position: 66, label: 'Medium' },
        { position: 100, label: 'High' },
      ],
      isConfidence: true
    },
    {
      name: 'Risk',
      value: Risk_Factor,
      displayValue: `${Risk_Factor.toFixed(2)}%`,
      markers: [
        { position: 25, label: 'Low' },
        { position: 50, label: 'Medium' },
        { position: 75, label: 'High' },
        { position: 100, label: 'Very High' },
      ]
    },
  ];

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 bg-[#112240] text-white">
      <CardHeader className="bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold mb-2 flex items-center">
          <Eye className="mr-2" /> {eye} Eye Analysis
        </CardTitle>
        <Separator className="my-3 bg-white/20" />
        <CardDescription className="text-lg mt-3 font-medium text-white/90">
          {Stage.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <CustomBarChart data={chartData} />
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t border-gray-700 p-4 bg-[#1A2C4E]">
        <div className="text-sm font-medium mb-1 text-gray-300">Note:</div>
        <div className="text-sm text-gray-400">
          {explanation.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

const MovingImage = ({ src, alt, isMoving, isAnalyzing }: { src: string; alt: string; isMoving: boolean; isAnalyzing: boolean }) => {
  const handleAnimationComplete = () => {
    // You can add any logic here that should run when the animation completes
  };

  return (
    <motion.div
      className="relative w-[300px] h-[300px] overflow-hidden"
      animate={isMoving ? { x: [0, 10, -10, 0] } : { x: 0 }}
      transition={{ 
        repeat: isMoving ? Infinity : 0, 
        duration: 4, 
        ease: "easeInOut" 
      }}
    >
      <Image
        src={src}
        alt={alt}
        layout="fill"
        objectFit="cover"
        className="absolute top-0 left-0 z-0"
      />
      <div className="absolute inset-0 z-10">
        <ModelRender isAnalyzing={isAnalyzing} onAnimationComplete={handleAnimationComplete} />
      </div>
    </motion.div>
  );
};

export function Analysis() {
  const [leftEyeImage, setLeftEyeImage] = useState<File | null>(null);
  const [rightEyeImage, setRightEyeImage] = useState<File | null>(null);
  const [leftEyePreview, setLeftEyePreview] = useState<string | null>(null);
  const [rightEyePreview, setRightEyePreview] = useState<string | null>(null);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showInputCard, setShowInputCard] = useState<boolean>(true);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalPatientId, setModalPatientId] = useState<string>('');
  const [showBenefits, setShowBenefits] = useState<boolean>(true);

  const handleImageUpload = (file: File | null, eye: 'left' | 'right') => {
    if (file) {
      if (eye === 'left') {
        setLeftEyeImage(file);
        setLeftEyePreview(URL.createObjectURL(file));
      } else {
        setRightEyeImage(file);
        setRightEyePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = () => {
    if (!leftEyeImage || !rightEyeImage) {
      setError('Please upload both eye images.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    if (!modalPatientId) {
      setError('Please enter a Patient ID.');
      return;
    }

    setIsModalOpen(false);
    setIsLoading(true);
    setError(null);
    setIsMoving(true);
    setIsAnalyzing(true);
    setShowBenefits(false);

    const formData = new FormData();
    formData.append('left_image', leftEyeImage!);
    formData.append('right_image', rightEyeImage!);

    try {
      const response = await fetch(`https://gnayana.azurewebsites.net/infer/?patient_id=${encodeURIComponent(modalPatientId)}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      if (data.message) {
        setError(data.message);
        return;
      }

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.left_eye && data.right_eye) {
        setApiData(data);
        setShowInputCard(false);
      } else {
        setError('Unexpected response format. Please try again.');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(`An error occurred while processing your request: ${error.message}`);
      } else {
        setError('An unknown error occurred');
      }
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setIsMoving(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Head>
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      </Head>
      <div className="relative min-h-screen w-full bg-[#0A192F]">
        <div className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[300px] h-[300px] opacity-20">
            <div className="w-full h-full border-2 border-white/20 rounded-full" />
            <div className="absolute inset-4 border-2 border-white/20 rounded-full" />
            <div className="absolute inset-8 border-2 border-white/20 rounded-full" />
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-[300px] opacity-20">
            <div className="w-full h-full border-2 border-white/20 rounded-full" />
            <div className="absolute inset-4 border-2 border-white/20 rounded-full" />
            <div className="absolute inset-8 border-2 border-white/20 rounded-full" />
          </div>
          <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-red-400/20 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight max-w-5xl text-center">
              <span className="inline-block relative">
                G-NAYANA
                <svg
                  viewBox="0 0 624 28"
                  fill="none"
                  className="absolute top-full left-0 w-full xl:-mt-2"
                >
                  <defs>
                    <linearGradient id="threeColorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M3 25C142.5 3.5 290.5 3.5 621 25"
                    stroke="url(#threeColorGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl font-light text-gray-300 tracking-wide leading-relaxed max-w-4xl text-center mt-6">
              Empowering healthcare with cutting-edge AI to detect diabetic retinopathy early and safeguard vision.
            </p>
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {showInputCard ? (
              <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-[#112240] text-white">
                <CardHeader className="bg-gradient-to-r from-indigo-600/90 to-purple-600/90">
                  <CardTitle className="text-xl font-semibold text-center">Diabetic Retinopathy Report Generation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-300">Left Eye Image</p>
                      <FileUpload onChange={(file) => handleImageUpload(file, 'left')} />
                      {leftEyePreview && (
                        <div className="mt-2 flex items-center justify-center relative overflow-hidden">
                          <MovingImage src={leftEyePreview} alt="Left Eye Preview" isMoving={isMoving} isAnalyzing={isAnalyzing} />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-300">Right Eye Image</p>
                      <FileUpload onChange={(file) => handleImageUpload(file, 'right')} />
                      {rightEyePreview && (
                        <div className="mt-2 flex items-center justify-center relative overflow-hidden">
                          <MovingImage src={rightEyePreview} alt="Right Eye Preview" isMoving={isMoving} isAnalyzing={isAnalyzing} />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-[#1A2C4E] p-4 flex flex-col items-center">
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center"
                  >
                    {isLoading ? 'Analyzing...' : 'Submit Analysis'}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardFooter>
              </Card>
            ) : null}
            {apiData && (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <EyeAnalysisCard eye="Left" data={apiData.left_eye!} />
                <EyeAnalysisCard eye="Right" data={apiData.right_eye!} />
              </motion.div>
            )}
            {showBenefits ? (
              <Benefits />
            ) : (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                >
                  Go Back
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#112240] text-white">
          <DialogHeader>
            <DialogTitle>Enter Patient ID</DialogTitle>
            <DialogDescription className="text-gray-400">
              Please enter the Patient ID to proceed with the analysis.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Patient ID"
            value={modalPatientId}
            onChange={(e) => setModalPatientId(e.target.value)}
            className="w-full border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 bg-[#1A2C4E] text-white"
          />
          <DialogFooter>
            <Button onClick={handleModalSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white">Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        errorMessage={error || ''}
      />
    </>
  );
}

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-[#0A192F]">
      <Analysis />
    </div>
  );
}

