"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, MapPin, Mail, Phone, Loader2 } from "lucide-react";

interface SearchAnimationProps {
  isSearching: boolean;
  inputType: "phone" | "email";
  inputValue: string;
}

export function SearchAnimation({ isSearching, inputType, inputValue }: SearchAnimationProps) {
  const steps = [
    { icon: Globe, text: "Connecting to global database..." },
    { icon: Search, text: "Analyzing number pattern..." },
    { icon: MapPin, text: "Triangulating location..." },
    { icon: inputType === "phone" ? Phone : Mail, text: `Verifying ${inputType} details...` },
  ];

  return (
    <AnimatePresence>
      {isSearching && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
          >
            <div className="text-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                <Loader2 className="h-12 w-12 text-blue-600" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mt-4">Searching...</h3>
              <p className="text-gray-500 text-sm mt-1 break-all">{inputValue}</p>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      transition: { delay: index * 0.2 + 0.5, duration: 1, repeat: Infinity }
                    }}
                  >
                    <step.icon className="h-5 w-5 text-blue-600" />
                  </motion.div>
                  <span className="text-gray-700">{step.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "easeInOut" }}
              className="h-1 bg-blue-600 rounded-full mt-6"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}