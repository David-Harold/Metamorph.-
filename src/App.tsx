/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Layout, 
  Newspaper, 
  Smartphone, 
  Monitor, 
  ArrowRight, 
  Loader2,
  Trash2,
  Maximize2,
  Box,
  EyeOff
} from 'lucide-react';

// Models per skill documentation
const TEXT_MODEL = "gemini-3-flash-preview";
const IMAGE_MODEL = "gemini-2.5-flash-image";

interface GeneratedImage {
  id: string;
  medium: string;
  url: string;
  prompt: string;
}

const MEDIUMS = [
  { id: 'billboard', name: 'Billboard', icon: Layout, description: 'Massive outdoor display' },
  { id: 'newspaper', name: 'Newspaper', icon: Newspaper, description: 'Vintage print aesthetic' },
  { id: 'social', name: 'Social Post', icon: Smartphone, description: 'Clean digital lifestyle' },
  { id: 'magazine', name: 'Magazine', icon: Box, description: 'High-end editorial shot' }
];

export default function App() {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [masterSpec, setMasterSpec] = useState<string | null>(null);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const generateMetamorph = async () => {
    if (!description.trim()) return;

    setIsGenerating(true);
    setError(null);
    setResults([]);

    try {
      const specResponse = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: `Create a highly detailed visual specification for this product: "${description}". 
        Focus strictly on the product's physical attributes.
        CRITICAL: NO PEOPLE, NO HUMANS.
        One dense paragraph.`,
      });

      const spec = specResponse.text || description;
      setMasterSpec(spec);

      const generationPromises = MEDIUMS.map(async (medium) => {
        let mediumPrompt = "";
        switch(medium.id) {
          case 'billboard':
            mediumPrompt = `A massive black and white street billboard. The main focus is ${spec}. Architectural context, sharp focus, professional photography. ABSOLUTELY NO PEOPLE.`;
            break;
          case 'newspaper':
            mediumPrompt = `A minimalist high-contrast black and white print advertisement in a newspaper. The product is ${spec}. Elegant typography, clean white space. ABSOLUTELY NO PEOPLE.`;
            break;
          case 'social':
            mediumPrompt = `A minimalist editorial lifestyle shot of ${spec}. White marble background, stark lighting, sharp shadows. High-end product photography. ABSOLUTELY NO PEOPLE.`;
            break;
          case 'magazine':
            mediumPrompt = `A minimalist double-page magazine spread featuring ${spec}. Clean layouts, heavy white space, sharp detail. ABSOLUTELY NO PEOPLE.`;
            break;
        }

        const imageResponse = await ai.models.generateContent({
          model: IMAGE_MODEL,
          contents: {
            parts: [{ text: mediumPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1",
            },
          }
        });

        for (const part of imageResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64Data = part.inlineData.data;
            return {
              id: Math.random().toString(36).substr(2, 9),
              medium: medium.name,
              url: `data:image/png;base64,${base64Data}`,
              prompt: mediumPrompt
            };
          }
        }
        return null;
      });

      const generated = await Promise.all(generationPromises);
      setResults(generated.filter((img): img is GeneratedImage => img !== null));

    } catch (err) {
      console.error(err);
      setError('Transformation failed. Review description or key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const clear = () => {
    setDescription('');
    setResults([]);
    setMasterSpec(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Editorial Rule Lines */}
      <div className="fixed inset-0 pointer-events-none border-[12px] border-black/5 z-50 overflow-hidden shadow-inner" />

      <header className="relative z-10 border-b-4 border-black pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-between border-b border-black/10 pb-4 text-[10px] uppercase tracking-[0.3em] font-bold">
            <span>Issue No. 001</span>
            <span>Est. 2026</span>
            <span>Digital Edition</span>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-serif italic tracking-tighter uppercase leading-none">
            Metamorph
          </h1>
          
          <div className="border-t border-black/10 pt-4 flex items-center justify-between text-[10px] uppercase font-bold">
            <span>Automated Product Visualization</span>
            <div className="flex items-center gap-4">
              <span>Model: Nanobanana</span>
              <div className="w-2 h-2 bg-black rounded-full" />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-16">
        {/* Input Column */}
        <div className="space-y-12">
          <section className="space-y-6">
            <h2 className="font-serif text-3xl italic">The Manifest</h2>
            <div className="relative group">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Declare your product vision here..."
                className="w-full h-64 bg-transparent border-2 border-black rounded-sm p-8 text-xl focus:outline-none focus:ring-4 focus:ring-black/5 transition-all resize-none placeholder:text-black/20 font-serif italic"
              />
              <div className="absolute top-4 right-4 animate-pulse">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {['NO_HUMANS', 'HIFI_OUTPUT', 'EDITORIAL_SYNC'].map(tag => (
                <span key={tag} className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-black text-white rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="pt-8 border-t-2 border-black space-y-4">
            <button
              onClick={generateMetamorph}
              disabled={isGenerating || !description.trim()}
              className="w-full bg-black hover:bg-black/80 disabled:bg-black/10 disabled:text-black/30 text-white font-bold py-6 rounded-none flex items-center justify-center gap-4 transition-all active:translate-y-0.5 group text-lg uppercase tracking-widest"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Initialize Transform</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
            <button
              onClick={clear}
              className="w-full border border-black/10 hover:border-black py-4 transition-all text-xs uppercase tracking-widest font-bold"
            >
              Discard Session
            </button>
          </section>

          {masterSpec && !isGenerating && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 border border-black/5 bg-gray-50 italic text-sm leading-relaxed"
            >
              <h3 className="text-[10px] uppercase font-bold mb-4 opacity-40">— Synthesized Specification —</h3>
              {masterSpec}
            </motion.div>
          )}

          {error && (
            <div className="p-6 bg-red-50 border-l-4 border-red-600 text-red-600 text-sm font-bold uppercase tracking-tight">
              Error reported: {error}
            </div>
          )}
        </div>

        {/* Display Column */}
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <AnimatePresence mode="popLayout">
              {isGenerating ? (
                MEDIUMS.map((medium, i) => (
                  <div key={medium.id} className="group h-[500px] border-t border-black/10 pt-4">
                    <div className="flex justify-between items-center mb-4 uppercase text-[10px] font-bold">
                      <span>Playout_{i+1}</span>
                      <span>Scanning...</span>
                    </div>
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                      <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    </div>
                  </div>
                ))
              ) : results.length > 0 ? (
                results.map((result, idx) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <div className="flex justify-between items-center mb-4 uppercase text-[10px] font-bold border-b border-black pb-2">
                      <span className="bg-black text-white px-2 py-0.5">{result.medium}</span>
                      <span className="opacity-40">Visualized in Studio B</span>
                    </div>
                    <div className="relative aspect-square border border-black p-1 bg-white group-hover:shadow-2xl transition-all duration-500">
                      <img 
                        src={result.url} 
                        alt={result.medium} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                      />
                      <div className="absolute inset-0 border border-black/5 pointer-events-none" />
                    </div>
                    <div className="mt-4 flex justify-between items-start">
                      <h3 className="font-serif text-2xl group-hover:italic transition-all">Plate_{idx + 1}</h3>
                      <button className="text-[10px] uppercase font-bold underline hover:no-underline">Export View</button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full h-full min-h-[600px] border-2 border-dashed border-black/10 flex flex-col items-center justify-center p-12 text-center">
                   <div className="mb-8 p-6 border-2 border-black">
                     <Layout className="w-16 h-16 opacity-10" strokeWidth={1} />
                   </div>
                   <h3 className="font-serif text-5xl italic opacity-20 mb-4">Awaiting Signal</h3>
                   <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">
                     Feed the engine to begin simulation
                   </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t-8 border-black mt-24 py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between border-b border-black/10 pb-8 gap-8">
           <h4 className="font-serif text-4xl italic tracking-tighter">Metamorph</h4>
           <div className="text-[10px] uppercase font-bold tracking-widest text-right">
             <span>Protocol: Industrial Consistency v1.0</span><br/>
             <span className="opacity-40">All rights reserved by the synthetic era.</span>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between text-[8px] uppercase tracking-[0.5em] font-bold opacity-30">
          <span>Washington</span>
          <span>New York</span>
          <span>London</span>
          <span>Tokyo</span>
        </div>
      </footer>
    </div>
  );
}
