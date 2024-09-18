"use client";
import React, { useState, ChangeEvent } from 'react';
import Head from 'next/head';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/ui/file-upload";
import Image from 'next/image';
import { ArrowRight, Eye, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface EyeResult {
  predicted_class: number;
  stage: string;
  confidence: string;
  explanation: string;
  Note: string | null;
  Risk: string;
}

interface ApiResponse {
  left_image_result: EyeResult;
  right_image_result: EyeResult;
}

interface ChartDataItem {
  name: string;
  value: number;
  displayValue: string;
  markers?: { position: number; label: string }[];
  isConfidence?: boolean;
  isPredictionClass?: boolean;
}

const getColorForValue = (value: number, isConfidence: boolean, isPredictionClass: boolean): string => {
  if (isConfidence) {
    if (value <= 25) return 'hsl(var(--chart-2))'; // Red
    if (value <= 50) return 'hsl(var(--chart-5))'; // Orange
    if (value <= 75) return 'hsl(var(--chart-4))'; // Yellow
    return 'hsl(var(--chart-1))'; // Green
  } else if (isPredictionClass) {
    if (value <= 1) return 'hsl(var(--chart-1))'; // Green
    if (value <= 2) return 'hsl(var(--chart-4))'; // Yellow
    if (value <= 3) return 'hsl(var(--chart-5))'; // Orange
    return 'hsl(var(--chart-2))'; // Red
  } else {
    if (value <= 25) return 'hsl(var(--chart-1))'; // Green
    if (value <= 50) return 'hsl(var(--chart-4))'; // Yellow
    if (value <= 75) return 'hsl(var(--chart-5))'; // Orange
    return 'hsl(var(--chart-2))';
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
            <span className="text-sm font-medium text-gray-700">{item.name}</span>
            <span className="text-sm font-bold text-gray-900">{item.displayValue}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-5 dark:bg-gray-700">
            <motion.div
              className="h-5 rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${item.isPredictionClass ? ((item.value + 1) / 3) * 100 : item.value}%`,
                backgroundColor: getColorForValue(item.value, item.isConfidence || false, item.isPredictionClass || false),
              }}
              initial={{ width: 0 }}
              animate={{ width: `${item.isPredictionClass ? ((item.value + 1) / 3) * 100 : item.value}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
          {item.markers && (
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              {item.markers.map((marker, idx) => (
                <div key={idx} className="text-center" style={{ width: '33.33%' }}>
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
  const { stage, confidence, explanation, Risk, predicted_class } = data;
  const chartData: ChartDataItem[] = [
    {
      name: 'Risk',
      value: parseFloat(Risk.replace('%', '')),
      displayValue: Risk,
      markers: [
        { position: 33, label: 'Low' },
        { position: 66, label: 'Medium' },
        { position: 100, label: 'High' },
      ]
    },
    {
      name: 'Confidence',
      value: parseFloat(confidence.replace('%', '')),
      displayValue: confidence,
      markers: [
        { position: 33, label: 'Low' },
        { position: 66, label: 'Medium' },
        { position: 100, label: 'High' },
      ],
      isConfidence: true
    },
    {
      name: 'Prediction Class',
      value: predicted_class,
      displayValue: stage,
      markers: [
        { position: 33, label: 'No DR' },
        { position: 66, label: 'Moderate' },
        { position: 100, label: 'Severe' },
      ],
      isPredictionClass: true
    },
  ];

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold mb-2 flex items-center">
          <Eye className="mr-2" /> {eye} Eye Analysis
        </CardTitle>
        <Separator className="my-3 bg-white/20" />
        <CardDescription className="text-lg mt-3 font-medium text-white/90">{stage}: {explanation}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <CustomBarChart data={chartData} />
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t p-4 bg-gray-50">
        <div className="text-sm font-medium mb-1 text-gray-700">Note:</div>
        <div className="text-sm text-muted-foreground">{data.Note}</div>
      </CardFooter>
    </Card>
  );
};

const Sparkles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="w-px h-full absolute left-1/2 -translate-x-1/2 bg-gradient-to-b from-transparent via-cyan-500 to-transparent animate-move">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-500 rounded-full animate-sparkle"
            style={{
              top: `${i * 25}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export function Analysis() {
  const [patientId, setPatientId] = useState<string>('');
  const [leftEyeImage, setLeftEyeImage] = useState<File | null>(null);
  const [rightEyeImage, setRightEyeImage] = useState<File | null>(null);
  const [leftEyePreview, setLeftEyePreview] = useState<string | null>(null);
  const [rightEyePreview, setRightEyePreview] = useState<string | null>(null);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showInputCard, setShowInputCard] = useState<boolean>(true);

  const handlePatientIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPatientId(e.target.value);
  };

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

  const handleSubmit = async () => {
    if (!patientId || !leftEyeImage || !rightEyeImage) {
      setError('Please fill in all fields and upload both eye images.');
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    const formData = new FormData();
    formData.append('left_image', leftEyeImage);
    formData.append('right_image', rightEyeImage);
  
    try {
      const response = await fetch(`https://gnayan-huf2h0hjfxb3efg7.southindia-01.azurewebsites.net/predict/?patient_id=${encodeURIComponent(patientId)}`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
  
      const data: ApiResponse = await response.json();
      setApiData(data);
      setShowInputCard(false);  // Hide the input card after receiving data
    } catch (error) {
      if (error instanceof Error) {
        setError(`An error occurred while processing your request: ${error.message}`);
      } else {
        setError('An unknown error occurred');
      }
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      </Head>
      <div className="min-h-screen w-full dark:bg-black bg-white dark:bg-grid-small-white/[0.2] bg-grid-small-black/[0.2] relative flex items-center justify-center">
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {showInputCard ? (
              <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient">
                  <CardTitle className="text-xl font-semibold">Diabetic Retinopathy Report Generator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <Input
                    type="text"
                    placeholder="Patient ID"
                    value={patientId}
                    onChange={handlePatientIdChange}
                    className="w-full border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-700">Left Eye Image</p>
                      <FileUpload onChange={(file) => handleImageUpload(file, 'left')} />
                      {leftEyePreview && (
                        <motion.div 
                          className="mt-2 flex items-center justify-center relative overflow-hidden"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Image
                            src={leftEyePreview}
                            alt="Left Eye Preview"
                            width={150}
                            height={150}
                            className="object-cover"
                          />
                          {isLoading && <Sparkles />}
                        </motion.div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-700">Right Eye Image</p>
                      <FileUpload onChange={(file) => handleImageUpload(file, 'right')} />
                      {rightEyePreview && (
                        <motion.div 
                          className="mt-2 flex items-center justify-center relative overflow-hidden"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Image
                            src={rightEyePreview}
                            alt="Right Eye Preview"
                            width={150}
                            height={150}
                            className="object-cover"
                          />
                          {isLoading && <Sparkles />}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 p-4 flex flex-col items-center">
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isLoading}
                    className="hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center"
                  >
                    {isLoading ? 'Analyzing...' : 'Submit Analysis'}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                  {error && (
                    <motion.div 
                      className="text-red-500 mt-2 flex items-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AlertTriangle className="mr-2" /> {error}
                    </motion.div>
                  )}
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
                <EyeAnalysisCard eye="Left" data={apiData.left_image_result} />
                <EyeAnalysisCard eye="Right" data={apiData.right_image_result} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}