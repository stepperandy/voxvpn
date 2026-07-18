import React, { useState } from 'react';
import QRCode from 'qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ChevronRight, Smartphone, Apple, Download, Settings, Wifi, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ESIMInstallationGuide({ open, onOpenChange, esim }) {
  const [qrImageUrl, setQrImageUrl] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [copiedApn, setCopiedApn] = useState(false);

  const copyApn = (val) => {
    navigator.clipboard.writeText(val);
    setCopiedApn(true);
    setTimeout(() => setCopiedApn(false), 2000);
  };

  React.useEffect(() => {
    if (esim?.qr_code && open) {
      QRCode.toDataURL(esim.qr_code, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      }).then(setQrImageUrl);
    }
  }, [esim?.qr_code, open]);

  const iOSSteps = [
    {
      num: 1,
      title: 'Open Settings',
      description: 'Go to Settings > Cellular > Add Cellular Plan',
      action: 'Tap "Add eSIM Plan"'
    },
    {
      num: 2,
      title: 'Scan QR Code',
      description: 'Point your camera at the QR code below and tap the notification that appears',
      hasQR: true
    },
    {
      num: 3,
      title: 'Confirm Plan',
      description: 'Review the plan details and tap "Add Cellular Plan"',
      action: 'Accept the terms and conditions'
    },
    {
      num: 4,
      title: 'Set Primary Line',
      description: 'Choose which number will be your primary line (you can change this later)',
      action: 'Go to Settings > Cellular > Cellular Plans'
    },
    {
      num: 5,
      title: 'Enable Data Roaming',
      description: 'For international use, enable Data Roaming on your eSIM line',
      action: 'Settings > Cellular > your eSIM > Data Roaming'
    }
  ];

  const androidSteps = [
    {
      num: 1,
      title: 'Open Settings',
      description: 'Go to Settings > Network & Internet > Mobile Networks',
      action: 'Look for "Add a SIM" or "Add Mobile Plan" option'
    },
    {
      num: 2,
      title: 'Download eSIM Profile',
      description: 'Select "Add eSIM" or "Download a SIM"',
      action: 'Choose to scan QR code'
    },
    {
      num: 3,
      title: 'Scan QR Code',
      description: 'Use your device camera to scan the QR code displayed below',
      hasQR: true
    },
    {
      num: 4,
      title: 'Confirm Download',
      description: 'Review the carrier information and confirm the download',
      action: 'Tap "Download" or "Confirm"'
    },
    {
      num: 5,
      title: 'Activate eSIM',
      description: 'Go to Settings > Network & Internet > Mobile Networks',
      action: 'Select your new eSIM and toggle "Use SIM for mobile data"'
    }
  ];

  // APN lookup based on product name / country
  const getApnSettings = () => {
    const name = (esim?.product_name || '').toLowerCase();
    const country = (esim?.country_code || '').toUpperCase();

    if (name.includes('airalo') || country === 'US') return { apn: 'airalo', auth: 'none' };
    if (country === 'GB' || name.includes('uk') || name.includes('united kingdom')) return { apn: 'airalo', auth: 'none' };
    if (country === 'AU' || name.includes('australia')) return { apn: 'airalo', auth: 'none' };
    if (country === 'CA' || name.includes('canada')) return { apn: 'airalo', auth: 'none' };
    if (country === 'DE' || name.includes('germany')) return { apn: 'airalo', auth: 'none' };
    if (country === 'JP' || name.includes('japan')) return { apn: 'airalo', auth: 'none' };
    if (name.includes('global') || name.includes('world') || name.includes('europe')) return { apn: 'airalo', auth: 'none' };
    // Default Airalo APN
    return { apn: 'airalo', auth: 'none' };
  };

  const apnInfo = getApnSettings();

  const apnSettings = [
    {
      name: 'APN',
      value: apnInfo.apn,
      note: 'Enter exactly as shown — case sensitive'
    },
    {
      name: 'Username',
      value: 'Not required',
      note: 'Leave blank'
    },
    {
      name: 'Password',
      value: 'Not required',
      note: 'Leave blank'
    },
    {
      name: 'Authentication Type',
      value: apnInfo.auth === 'none' ? 'None' : apnInfo.auth,
      note: 'Set to None unless specified'
    }
  ];

  const StepCard = ({ step }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: step.num * 0.05 }}
      className="p-4 rounded-lg border border-gray-700 bg-gray-900/50 hover:bg-gray-900 transition-colors cursor-pointer"
      onClick={() => setActiveStep(step.num)}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
          activeStep === step.num ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-400'
        }`}>
          {step.num}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white mb-1">{step.title}</h4>
          <p className="text-sm text-gray-400 mb-2">{step.description}</p>
          {step.action && (
            <div className="flex items-center gap-2 text-xs text-cyan-400">
              <ChevronRight className="w-3 h-3" />
              {step.action}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-950 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl">eSIM Installation Guide</DialogTitle>
          <p className="text-sm text-gray-400 mt-2">
            Plan: <span className="text-cyan-400 font-semibold">{esim?.product_name}</span>
          </p>
        </DialogHeader>

        <Tabs defaultValue="ios" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900">
            <TabsTrigger value="ios" className="flex items-center gap-2">
              <Apple className="w-4 h-4" />
              <span className="hidden sm:inline">iOS</span>
            </TabsTrigger>
            <TabsTrigger value="android" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Android</span>
            </TabsTrigger>
            <TabsTrigger value="apn" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">APN</span>
            </TabsTrigger>
          </TabsList>

          {/* iOS Instructions */}
          <TabsContent value="ios" className="space-y-6">
            <div className="space-y-3">
              {iOSSteps.map((step) => (
                <div key={step.num}>
                  <StepCard step={step} />
                  {step.hasQR && activeStep === step.num && qrImageUrl && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 p-6 bg-white rounded-lg flex justify-center"
                    >
                      <img src={qrImageUrl} alt="eSIM QR Code" className="w-48 h-48" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            <Card className="bg-blue-900/20 border-blue-800 p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-300 mb-1">Need WiFi?</p>
                  <p className="text-blue-200">You'll need a WiFi connection to download the eSIM profile. Make sure you're connected before starting.</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Android Instructions */}
          <TabsContent value="android" className="space-y-6">
            <div className="space-y-3">
              {androidSteps.map((step) => (
                <div key={step.num}>
                  <StepCard step={step} />
                  {step.hasQR && activeStep === step.num && qrImageUrl && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 p-6 bg-white rounded-lg flex justify-center"
                    >
                      <img src={qrImageUrl} alt="eSIM QR Code" className="w-48 h-48" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            <Card className="bg-green-900/20 border-green-800 p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-green-300 mb-1">Device Requirements</p>
                  <p className="text-green-200">Ensure your device supports eSIM. Most modern Android phones (9+) with Pixel, Samsung, OnePlus, Motorola, etc. are compatible.</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* APN Settings */}
          <TabsContent value="apn" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Wifi className="w-5 h-5 text-cyan-400" />
                APN Settings for Your eSIM
              </h3>
              {esim?.product_name && (
                <p className="text-xs text-cyan-400 mb-3">Detected plan: <span className="font-semibold">{esim.product_name}</span></p>
              )}
              <p className="text-sm text-gray-400 mb-4">
                Use these settings if your eSIM connects but has no internet access.
              </p>

              {/* Main APN highlight */}
              <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-500/10 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-cyan-400 uppercase tracking-wider mb-1">APN (most important)</p>
                  <p className="font-mono text-white text-xl font-bold">{apnInfo.apn}</p>
                </div>
                <button
                  onClick={() => copyApn(apnInfo.apn)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-gray-950 font-semibold text-sm hover:bg-cyan-400 transition-colors"
                >
                  {copiedApn ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedApn ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="space-y-2">
                {apnSettings.map((setting, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 rounded-lg border border-gray-700 bg-gray-900/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">{setting.name}</p>
                        <p className="font-mono text-cyan-400 text-sm mt-0.5">{setting.value}</p>
                      </div>
                      <p className="text-xs text-gray-500 text-right max-w-[140px]">{setting.note}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <Card className="bg-amber-900/20 border-amber-800 p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-300 mb-1">How to set APN manually</p>
                  <p className="text-amber-200 text-xs"><strong>iOS:</strong> Settings → Cellular → your eSIM → Cellular Data Network → enter APN</p>
                  <p className="text-amber-200 text-xs mt-1"><strong>Android:</strong> Settings → Network → Mobile Networks → Access Point Names → Add new APN</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Done
          </Button>
          <Button
            className="flex-1 bg-cyan-600 hover:bg-cyan-700"
            onClick={() => {
              if (qrImageUrl) {
                const link = document.createElement('a');
                link.href = qrImageUrl;
                link.download = `esim-qr-${esim?.iccid}.png`;
                link.click();
              }
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}