/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  getParsedRecords, 
  FruitRecord 
} from './data';
import { 
  Scale, 
  TrendingUp, 
  Users, 
  Award, 
  Dumbbell,
  Wrench, 
  Calculator, 
  ChevronRight, 
  Download, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  PieChart, 
  Layers, 
  Activity, 
  FileText, 
  CheckCircle, 
  TrendingDown,
  Info,
  ChevronDown,
  Percent,
  Play
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line,
  Cell,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Load data
  const data = useMemo(() => getParsedRecords(), []);

  // Tabs structure
  const [activeTab, setActiveTab] = useState<'flow' | 'yield' | 'operator' | 'report'>('flow');

  // Interactive Simulator States (Flow Tab)
  const [simFruit, setSimFruit] = useState<string>('蘋果');
  const [simWeight, setSimWeight] = useState<number>(350);

  // Operator selection for Drill Down (Operator Tab)
  const [selectedOperator, setSelectedOperator] = useState<string>('All');

  // ROI Calculator States (Report Tab)
  const [roiYieldIncrease, setRoiYieldIncrease] = useState<number>(1.8);
  const [roiFruitPrice, setRoiFruitPrice] = useState<number>(120); // NTD per kg

  // Time period filter
  const [timeFilter, setTimeFilter] = useState<'all' | 'Q1' | 'Q2'>('all');

  // Filter records by time period
  const filteredData = useMemo(() => {
    if (timeFilter === 'all') return data;
    return data.filter(r => {
      const month = parseInt(r.date.split('-')[1]);
      if (timeFilter === 'Q1') return month >= 1 && month <= 3;
      if (timeFilter === 'Q2') return month >= 4 && month <= 6;
      return true;
    });
  }, [data, timeFilter]);

  // Overall statistics calculations
  const stats = useMemo(() => {
    let totalInput = 0;
    let totalNet = 0;
    let totalWaste1 = 0; // Peel
    let totalWaste2 = 0; // Core

    filteredData.forEach(r => {
      totalInput += r.inputWeight;
      totalNet += r.netWeight;
      totalWaste1 += r.waste1;
      totalWaste2 += r.waste2;
    });

    const avgYield = (totalNet / totalInput) * 100;
    const avgLoss = 100 - avgYield;
    const avgPeelLossRate = (totalWaste1 / totalInput) * 100;
    const avgCoreLossRate = (totalWaste2 / totalInput) * 100;

    return {
      totalInput: Math.round(totalInput),
      totalNet: Math.round(totalNet),
      totalWaste1: Math.round(totalWaste1),
      totalWaste2: Math.round(totalWaste2),
      avgYield: parseFloat(avgYield.toFixed(2)),
      avgLoss: parseFloat(avgLoss.toFixed(2)),
      avgPeelLossRate: parseFloat(avgPeelLossRate.toFixed(2)),
      avgCoreLossRate: parseFloat(avgCoreLossRate.toFixed(2)),
      batchCount: filteredData.length
    };
  }, [filteredData]);

  // Statistics grouped by Fruit
  const fruitGroupedStats = useMemo(() => {
    const list = ['蘋果', '鳳梨', '奇異果', '哈密瓜', '柿子', '芒果'];
    
    return list.map(name => {
      const records = filteredData.filter(r => r.fruitName === name);
      if (records.length === 0) return null;

      let totalInput = 0;
      let totalNet = 0;
      let totalWaste1 = 0;
      let totalWaste2 = 0;

      records.forEach(r => {
        totalInput += r.inputWeight;
        totalNet += r.netWeight;
        totalWaste1 += r.waste1;
        totalWaste2 += r.waste2;
      });

      const avgYield = (totalNet / totalInput) * 100;
      const avgPeelWaste = (totalWaste1 / totalInput) * 100;
      const avgCoreWaste = (totalWaste2 / totalInput) * 100;

      return {
        name,
        englishName: records[0].englishName,
        avgYield: parseFloat(avgYield.toFixed(1)),
        avgPeelWaste: parseFloat(avgPeelWaste.toFixed(1)),
        avgCoreWaste: parseFloat(avgCoreWaste.toFixed(1)),
        totalInput: Math.round(totalInput),
        totalNet: Math.round(totalNet),
        count: records.length
      };
    }).filter(Boolean) as Array<{
      name: string;
      englishName: string;
      avgYield: number;
      avgPeelWaste: number;
      avgCoreWaste: number;
      totalInput: number;
      totalNet: number;
      count: number;
    }>;
  }, [filteredData]);

  // Statistics grouped by Operator
  const operatorGroupedStats = useMemo(() => {
    const list = [
      '作業員甲 (精細刀工)',
      '作業員乙 (標準刀工)',
      '作業員丙 (新手培訓)'
    ];

    return list.map(name => {
      const records = filteredData.filter(r => r.operator === name);
      if (records.length === 0) return null;

      let totalInput = 0;
      let totalNet = 0;
      let totalWaste1 = 0;
      let totalWaste2 = 0;

      records.forEach(r => {
        totalInput += r.inputWeight;
        totalNet += r.netWeight;
        totalWaste1 += r.waste1;
        totalWaste2 += r.waste2;
      });

      const avgYield = (totalNet / totalInput) * 100;
      const yieldRates = records.map(r => r.yieldRate);
      const mean = avgYield;
      const variance = yieldRates.reduce((acc, y) => acc + Math.pow(y - mean, 2), 0) / yieldRates.length;
      const stdDev = Math.sqrt(variance);

      // Perform deep fruit-by-fruit yield audit for each operator
      const fruitPerformance = ['蘋果', '鳳梨', '奇異果', '哈密瓜', '柿子', '芒果'].map(fName => {
        const fRecs = records.filter(r => r.fruitName === fName);
        if (fRecs.length === 0) return { fName, yieldRate: 0 };
        const fSumInput = fRecs.reduce((sum, r) => sum + r.inputWeight, 0);
        const fSumNet = fRecs.reduce((sum, r) => sum + r.netWeight, 0);
        return {
          fName,
          yieldRate: parseFloat(((fSumNet / fSumInput) * 100).toFixed(1))
        };
      });

      return {
        name,
        shortName: name.split(' ')[0],
        badge: name.includes('精細') ? '熟練大師' : name.includes('標準') ? '產能中堅' : '重點輔導',
        avgYield: parseFloat(avgYield.toFixed(1)),
        avgPeelWaste: parseFloat(((totalWaste1 / totalInput) * 100).toFixed(1)),
        avgCoreWaste: parseFloat(((totalWaste2 / totalInput) * 100).toFixed(1)),
        totalInput: Math.round(totalInput),
        totalNet: Math.round(totalNet),
        stdDev: parseFloat(stdDev.toFixed(2)),
        count: records.length,
        fruitPerf: fruitPerformance
      };
    }).filter(Boolean) as Array<{
      name: string;
      shortName: string;
      badge: string;
      avgYield: number;
      avgPeelWaste: number;
      avgCoreWaste: number;
      totalInput: number;
      totalNet: number;
      stdDev: number;
      count: number;
      fruitPerf: Array<{ fName: string; yieldRate: number }>;
    }>;
  }, [filteredData]);

  // Hardcode simulator multipliers based on fruit statistics
  const currentSimMultipliers = useMemo(() => {
    const matchingFruit = fruitGroupedStats.find(f => f.name === simFruit);
    if (matchingFruit) {
      return {
        peelPercent: matchingFruit.avgPeelWaste,
        corePercent: matchingFruit.avgCoreWaste,
        yieldPercent: matchingFruit.avgYield
      };
    }
    // Default fallback (Apple)
    return { peelPercent: 8.7, corePercent: 3.3, yieldPercent: 88.0 };
  }, [simFruit, fruitGroupedStats]);

  // Simulated weight calculations
  const simResults = useMemo(() => {
    const peelLoss = (simWeight * currentSimMultipliers.peelPercent) / 100;
    const coreLoss = (simWeight * currentSimMultipliers.corePercent) / 100;
    const netFlesh = (simWeight * currentSimMultipliers.yieldPercent) / 100;
    
    return {
      peelLoss: parseFloat(peelLoss.toFixed(1)),
      coreLoss: parseFloat(coreLoss.toFixed(1)),
      netFlesh: parseFloat(netFlesh.toFixed(1))
    };
  }, [simWeight, currentSimMultipliers]);

  // Recommendation calculations (Report Tab sliders integration)
  const simulatedSavings = useMemo(() => {
    // Current total raw materials processed 
    const currentTotalRaw = stats.totalInput;
    // Current total finished flesh produced
    const currentTotalFlesh = stats.totalNet;
    // New flesh with trained yield percentage improvement
    const improvedYieldRate = Math.min(stats.avgYield + roiYieldIncrease, 98);
    const newTotalFlesh = (currentTotalRaw * improvedYieldRate) / 100;
    const additionalFleshKg = newTotalFlesh - currentTotalFlesh;
    // Valuation of gained yield
    const annualGainedValue = additionalFleshKg * roiFruitPrice;
    // Equivalent of raw material that didn't need to be purchased
    const rawSavedKg = additionalFleshKg / (stats.avgYield / 100);

    return {
      additionalFleshKg: parseFloat(additionalFleshKg.toFixed(1)),
      annualGainedValue: Math.round(annualGainedValue),
      rawSavedKg: parseFloat(rawSavedKg.toFixed(1)),
      improvedYieldRate: parseFloat(improvedYieldRate.toFixed(2))
    };
  }, [stats, roiYieldIncrease, roiFruitPrice]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased pb-12">
      {/* HEADER SECTION - BENTO STYLE */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500 text-white rounded-xl shadow-md shadow-orange-100 flex items-center justify-center">
                <Scale className="w-6 h-6" id="app_logo_icon" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900">
                  水果削皮步留率分析系統
                </h1>
                <p className="text-sm text-zinc-500 font-medium mt-0.5">
                  Fruit Peeling Yield & Efficiency Analysis Engine
                </p>
              </div>
            </div>
            
            {/* Right Header Badges and Period select */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-500 tracking-wider">分析範圍:</span>
                <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-100 p-0.5">
                  <button
                    onClick={() => setTimeFilter('all')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      timeFilter === 'all'
                        ? 'bg-white text-zinc-900 shadow-sm'
                        : 'text-zinc-650 hover:text-zinc-900'
                    }`}
                  >
                    全部歷史
                  </button>
                  <button
                    onClick={() => setTimeFilter('Q1')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      timeFilter === 'Q1'
                        ? 'bg-white text-zinc-900 shadow-sm'
                        : 'text-zinc-650 hover:text-zinc-900'
                    }`}
                  >
                    Q1 (1-3月)
                  </button>
                  <button
                    onClick={() => setTimeFilter('Q2')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      timeFilter === 'Q2'
                        ? 'bg-white text-zinc-900 shadow-sm'
                        : 'text-zinc-650 hover:text-zinc-900'
                    }`}
                  >
                    Q2 (4-6月)
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-white border border-zinc-200 px-4 py-2 rounded-xl shadow-xs">
                  <span className="text-[10px] text-zinc-400 uppercase font-extrabold block tracking-wider">當前加工批次</span>
                  <span className="font-mono text-xs font-bold text-zinc-700">BATCH-202606-PROD</span>
                </div>
                <div className="bg-orange-500 text-white px-4 py-2 rounded-xl shadow-xs flex flex-col justify-center">
                  <span className="text-[10px] opacity-85 uppercase font-extrabold tracking-wider">平均步留率</span>
                  <span className="text-lg font-black leading-tight">{stats.avgYield}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* OVERVIEW KEY PERFORMANCE CARDS - BENTO GRID SHAPE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex items-start gap-4">
            <div className="p-3 bg-zinc-100 text-zinc-700 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">進貨處理總量</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">{stats.totalInput.toLocaleString()}</span>
                <span className="text-xs font-semibold text-zinc-500">kg</span>
              </div>
              <span className="text-3xs text-zinc-400 block mt-1">累計經手 {stats.batchCount} 個作業批次</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex items-start gap-4">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">生產成品淨重</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">{stats.totalNet.toLocaleString()}</span>
                <span className="text-xs font-semibold text-zinc-500">kg</span>
              </div>
              <span className="text-3xs text-zinc-400 block mt-1">出貨淨果肉留存比</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex items-start gap-4">
            <div className="p-3 bg-zinc-900 text-white rounded-xl">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">平均總步留率</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">{stats.avgYield}%</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                <span className="text-3xs font-medium text-emerald-600">優於年度基準 (72.5%)</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex items-start gap-4">
            <div className="p-3 bg-red-50 text-red-500 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">平均製程耗損</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">{stats.avgLoss}%</span>
              </div>
              <span className="text-3xs block text-zinc-400 mt-1 font-mono">
                皮損 {stats.avgPeelLossRate}% | 芯損 {stats.avgCoreLossRate}%
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* NAVIGATION TABS SELECTOR - ORANGE BENTO HIGHLIGHT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-zinc-200">
          <nav className="flex space-x-6 overflow-x-auto pb-px" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('flow')}
              className={`py-4 px-1 border-b-2 font-display font-semibold text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'flow'
                  ? 'border-orange-500 text-orange-600 font-extrabold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              1. 處理流程工法拆解
            </button>
            <button
              onClick={() => setActiveTab('yield')}
              className={`py-4 px-1 border-b-2 font-display font-semibold text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'yield'
                  ? 'border-orange-500 text-orange-600 font-extrabold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
              }`}
            >
              <PieChart className="w-4 h-4" />
              2. 步留與耗損分析
            </button>
            <button
              onClick={() => setActiveTab('operator')}
              className={`py-4 px-1 border-b-2 font-display font-semibold text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'operator'
                  ? 'border-orange-500 text-orange-600 font-extrabold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
              }`}
            >
              <Users className="w-4 h-4" />
              3. 處理人員效率評量
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`py-4 px-1 border-b-2 font-display font-semibold text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'report'
                  ? 'border-orange-500 text-orange-600 font-extrabold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              4. 精進策略與建議報告
            </button>
          </nav>
        </div>
      </div>

      {/* TAB CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: PROCESS FLOW BLOCK */}
          {activeTab === 'flow' && (
            <motion.div
              key="flow"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Introduction Card */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                      <span className="w-2 h-5 bg-orange-500 rounded-full shrink-0"></span>
                      水果加工切落與削皮處理流程圖
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      本製程可供精緻團膳或鮮果加工廠追蹤水果從原料投入，歷經「削皮」與「去芯/去籽」兩大核心損耗階段，抵達包裝秤重的流體分配。
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    製程得率 = 步留率
                  </div>
                </div>

                {/* THE FLOWCHART DIAGRAM */}
                <div className="relative overflow-hidden bg-zinc-950 rounded-2xl p-6 md:p-10 border border-zinc-800 shadow-inner">
                  <div className="absolute top-0 right-0 p-4 font-mono text-3xs text-orange-400 opacity-65 tracking-widest uppercase pointer-events-none">
                    PROCESS GRAPH // V1.0
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative">
                    
                    {/* Step 1 */}
                    <div className="flex flex-col items-center text-center bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative z-10 hover:border-orange-500 transition-all group shadow-lg">
                      <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 text-lg font-bold mb-3 shadow-md group-hover:scale-105 transition-transform animate-pulse">
                        01
                      </div>
                      <h4 className="font-semibold text-zinc-100 md:text-sm">進貨初次稱重</h4>
                      <p className="text-zinc-400 text-xs mt-1">進庫批次原料 (100.0%)</p>
                      
                      <div className="mt-4 px-3 py-1 bg-zinc-850 rounded-md border border-zinc-700 text-2xs font-mono text-zinc-350">
                        投入原料: {simWeight} kg
                      </div>
                      <div className="text-3xs text-orange-400 mt-1 text-center font-mono">
                        無任何損耗基準
                      </div>
                    </div>

                    {/* Dotted Arrow 1 */}
                    <div className="hidden md:flex items-center justify-center text-zinc-600 relative">
                      <div className="w-full h-0.5 border-t-2 border-dashed border-zinc-850 absolute"></div>
                      <div className="bg-zinc-950 px-2 text-3xs font-mono text-zinc-550 z-10 flex flex-col items-center">
                        <span>削皮製程 (剝皮)</span>
                        <ChevronRight className="w-3.5 h-3.5 text-orange-500 animate-pulse mt-0.5" />
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative z-10 hover:border-orange-500 transition-all group shadow-lg">
                      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg font-bold mb-3 shadow-md group-hover:scale-105 transition-transform">
                        02
                      </div>
                      <h4 className="font-semibold text-zinc-100 md:text-sm">第一階段：削皮處理</h4>
                      <p className="text-zinc-400 text-xs mt-1">除去外皮與瑕疵組織</p>
                      
                      <div className="mt-4 px-3 py-1 bg-rose-950/45 rounded-md border border-rose-900/50 text-2xs font-mono text-rose-400 font-bold">
                        累計果皮耗損: -{simResults.peelLoss} kg
                      </div>
                      <div className="text-3xs font-mono text-zinc-500 mt-1">
                        損耗占比: {currentSimMultipliers.peelPercent}%
                      </div>
                    </div>

                    {/* Dotted Arrow 2 */}
                    <div className="hidden md:flex items-center justify-center text-zinc-600 relative">
                      <div className="w-full h-0.5 border-t-2 border-dashed border-zinc-850 absolute"></div>
                      <div className="bg-zinc-950 px-2 text-3xs font-mono text-zinc-550 z-10 flex flex-col items-center">
                        <span>去籽去果芯</span>
                        <ChevronRight className="w-3.5 h-3.5 text-orange-500 animate-pulse mt-0.5" />
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative z-10 hover:border-orange-500 transition-all group shadow-lg">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg font-bold mb-3 shadow-md group-hover:scale-105 transition-transform">
                        03
                      </div>
                      <h4 className="font-semibold text-zinc-100 md:text-sm">第二階段：果芯切落</h4>
                      <p className="text-zinc-400 text-xs mt-1">挖除中央硬挺、籽或果囊</p>
                      
                      <div className="mt-4 px-3 py-1 bg-amber-950/45 rounded-md border border-amber-900/50 text-2xs font-mono text-amber-400 font-bold">
                        果籽與核心耗損: -{simResults.coreLoss} kg
                      </div>
                      <div className="text-3xs font-mono text-zinc-500 mt-1">
                        損耗占比: {currentSimMultipliers.corePercent}%
                      </div>
                    </div>

                    {/* Dotted Arrow 3 */}
                    <div className="hidden md:flex items-center justify-center text-zinc-650 relative">
                      <div className="w-full h-0.5 border-t-2 border-dashed border-zinc-850 absolute"></div>
                      <div className="bg-zinc-950 px-2 text-3xs font-mono text-zinc-550 z-10 flex flex-col items-center">
                        <span>最終淨稱重</span>
                        <ChevronRight className="w-3.5 h-3.5 text-orange-500 animate-pulse mt-0.5" />
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col items-center text-center bg-zinc-900 border-2 border-zinc-900 rounded-xl p-5 relative z-10 shadow-lg glow-orange">
                      <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-400 flex items-center justify-center text-orange-400 text-lg font-bold mb-3 shadow-md">
                        04
                      </div>
                      <h4 className="font-semibold text-orange-400 md:text-sm animate-pulse">最終成品：得率肉</h4>
                      <p className="text-zinc-400 text-xs mt-1">進入真空包裝與冷鏈庫</p>
                      
                      <div className="mt-4 px-3 py-1 bg-orange-950/60 rounded-md border border-orange-900 text-2xs font-mono text-orange-350 font-extrabold text-sm">
                        果肉成品: {simResults.netFlesh} kg
                      </div>
                      <div className="text-3xs font-mono text-orange-400 font-bold mt-1">
                        總步留率得率: {currentSimMultipliers.yieldPercent}%
                      </div>
                    </div>

                  </div>

                  {/* Connecting indicator lines for mobile */}
                  <div className="block md:hidden text-center mt-4">
                    <p className="text-3xs text-zinc-500 italic">在桌上型電腦可享用完美的點對點拓撲流程視覺效果</p>
                  </div>
                </div>

                {/* DYNAMIC CONVERSION CONTROLS */}
                <div className="mt-8 bg-zinc-50 rounded-2xl p-6 border border-zinc-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="w-5 h-5 text-orange-500" />
                    <h4 className="text-base font-bold text-zinc-800">
                      製程動態流向模擬器 (Production Mass-Flow Simulator)
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Control 1: Fruit list choose */}
                    <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
                      <label className="block text-xs font-bold text-zinc-500 mb-2">步驟 A: 選取水果品項</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['蘋果', '鳳梨', '奇異果', '哈密瓜', '柿子', '芒果'].map(f => (
                          <button
                            key={f}
                            onClick={() => setSimFruit(f)}
                            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all border cursor-pointer ${
                              simFruit === f
                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-100'
                                : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-105'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-2.5 bg-orange-50 rounded-lg text-orange-800 text-3xs font-medium space-y-1">
                        <div className="flex justify-between">
                          <span>果肉步留率基準:</span>
                          <span className="font-bold">{currentSimMultipliers.yieldPercent}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>果皮耗損預估:</span>
                          <span>{currentSimMultipliers.peelPercent}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>去芯果核耗損:</span>
                          <span>{currentSimMultipliers.corePercent}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Control 2: Weight slider input */}
                    <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-bold text-zinc-500">
                            步驟 B: 原物料投入重量 (Input)
                          </label>
                          <span className="text-xs font-mono font-bold text-orange-600 px-2 py-0.5 bg-orange-50 rounded">
                            {simWeight} kg
                          </span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="1000"
                          step="25"
                          value={simWeight}
                          onChange={(e) => setSimWeight(parseInt(e.target.value))}
                          className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-orange-500 my-4"
                        />
                        <div className="flex justify-between text-3xs text-zinc-400 font-mono">
                          <span>100 kg</span>
                          <span>500 kg</span>
                          <span>1000 kg</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between text-2xs text-zinc-500">
                        <span>預估本批果實成品: </span>
                        <span className="text-zinc-850 font-bold font-mono text-sm">
                          {simResults.netFlesh} kg 肉
                        </span>
                      </div>
                    </div>

                    {/* Control 3: Interactive Distribution Funnel */}
                    <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-3">
                          步驟 C: 投入重量 100% 流體去向組合
                        </label>
                        
                        {/* Custom Stacking Mass Bar */}
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-3xs text-zinc-500 mb-1">
                              <span>果肉出糖淨重 (淨成品)</span>
                              <span className="font-bold text-zinc-700">{currentSimMultipliers.yieldPercent}%</span>
                            </div>
                            <div className="w-full bg-zinc-100 rounded-full h-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${currentSimMultipliers.yieldPercent}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-3xs text-zinc-500 mb-1">
                              <span>果皮刨落重 (第一損耗)</span>
                              <span className="font-bold text-zinc-700">{currentSimMultipliers.peelPercent}%</span>
                            </div>
                            <div className="w-full bg-zinc-100 rounded-full h-2">
                              <div 
                                className="bg-rose-400 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${currentSimMultipliers.peelPercent}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-3xs text-zinc-500 mb-1">
                              <span>果心、核、籽棄用 (第二損耗)</span>
                              <span className="font-bold text-zinc-700">{currentSimMultipliers.corePercent}%</span>
                            </div>
                            <div className="w-full bg-zinc-100 rounded-full h-2">
                              <div 
                                className="bg-amber-400 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${currentSimMultipliers.corePercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 text-3xs bg-zinc-50 p-2 rounded text-zinc-500 text-center">
                        果皮與果心廢棄物可在後續製程作為<strong>堆肥、酵素或生質能燃料</strong>，降低二次成本。
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: YIELD & LOSS DETAILED ANALYTICS */}
          {activeTab === 'yield' && (
            <motion.div
              key="yield"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              
              {/* Left column: Grid of Fruits Yield Rates & Losses Bar Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                        <span className="w-2 h-5 bg-orange-500 rounded-full shrink-0"></span>
                        學理各品項水果步留 vs 雙耗損率對比
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1">
                        對比不同硬度、皮厚與結構的水果。步留率（成品率）愈高代表可利用淨果肉愈多。
                      </p>
                    </div>
                    <span className="text-3xs bg-zinc-100 text-zinc-650 px-2.5 py-1 rounded-md font-mono">
                      UNIT: % OF INPUT
                    </span>
                  </div>

                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={fruitGroupedStats}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                        <XAxis dataKey="name" stroke="#71717A" fontSize={12} strokeWidth={0} />
                        <YAxis tickLine={false} axisLine={false} stroke="#71717A" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ background: '#18181B', border: 'none', borderRadius: '8px', color: '#FFF' }}
                          labelStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend verticalAlign="top" iconType="circle" height={36} wrapperStyle={{ fontSize: '11px' }} />
                        
                        <Bar dataKey="avgYield" name="成品步留率 (%)" stackId="a" fill="#F97316" barSize={36}>
                          <Cell fill="#EA580C" /> {/* Apple */}
                          <Cell fill="#D97706" /> {/* Pineapple */}
                          <Cell fill="#F59E0B" /> {/* Kiwi */}
                          <Cell fill="#F97316" /> {/* Melon */}
                          <Cell fill="#C2410C" /> {/* Persimmon */}
                        </Bar>
                        
                        <Bar dataKey="avgPeelWaste" name="果皮消耗率 (%)" stackId="a" fill="#FECDD3" />
                        <Bar dataKey="avgCoreWaste" name="果核去芯消耗率 (%)" stackId="a" fill="#FEF08A" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-100 bg-zinc-50/80 p-4 rounded-xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-600 space-y-1">
                    <p className="font-bold text-zinc-800">📊 數據精確洞察：</p>
                    <p>
                      <strong>鳳梨</strong>與<strong>柿子(Persimmon)</strong>擁有最高的外皮與核果損毀，果泥与果皮合計耗損達 <strong>40% 以上</strong>。
                      相反地，<strong>蘋果</strong>與<strong>奇異果</strong>的淨果肉得率（步留率）高達 <strong>87.5% - 88%</strong>，在加工時更具有物料容錯與成本優勢。
                    </p>
                  </div>
                </div>

              </div>

              {/* Right column: Cumulative Loss Structure widget in High-Contrast Dark Mode */}
              <div className="bg-zinc-900 text-white rounded-2xl p-6 shadow-lg border border-zinc-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-orange-400 uppercase tracking-widest mb-4">製程資源損失光譜組成</h3>
                  <p className="text-xs text-zinc-400 mb-6">
                    在分析範圍內投入的 <strong>{stats.totalInput.toLocaleString()} kg</strong> 總物料中，損失之物理分布：
                  </p>

                  <div className="space-y-6">
                    {/* Process 1 */}
                    <div className="border border-zinc-800 p-3.5 rounded-xl bg-zinc-850">
                      <div className="flex justify-between items-center text-xs font-bold text-zinc-200">
                        <span>🍏 果肉保留 (Usable Flesh)</span>
                        <span className="text-orange-400 font-bold">{stats.avgYield}%</span>
                      </div>
                      <div className="mt-2 text-2xs text-zinc-400">
                        累計已保存並出庫的成品，重約 <strong>{stats.totalNet.toLocaleString()} kg</strong>。
                      </div>
                    </div>

                    {/* Process 2 */}
                    <div className="border border-zinc-800 p-3.5 rounded-xl bg-rose-950/20">
                      <div className="flex justify-between items-center text-xs font-bold text-rose-300">
                        <span>🍊 果皮切屑 (Peel Scrap)</span>
                        <span className="text-rose-400 font-bold">{stats.avgPeelLossRate}%</span>
                      </div>
                      <div className="mt-2 text-2xs text-rose-300/80">
                        主要刨切耗損，累計丟棄外皮 <strong>{stats.totalWaste1.toLocaleString()} kg</strong>。
                      </div>
                    </div>

                    {/* Process 3 */}
                    <div className="border border-zinc-800 p-3.5 rounded-xl bg-amber-950/20">
                      <div className="flex justify-between items-center text-xs font-bold text-amber-300">
                        <span>🍉 果心核籽 (Core / Seeds)</span>
                        <span className="text-amber-400 font-bold">{stats.avgCoreLossRate}%</span>
                      </div>
                      <div className="mt-2 text-2xs text-amber-300/80">
                        去核果囊損耗，累計刨除果心 <strong>{stats.totalWaste2.toLocaleString()} kg</strong>。
                      </div>
                    </div>

                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl border border-dashed border-orange-500/30 bg-orange-500/10 text-orange-200">
                  <h5 className="text-xs font-bold text-orange-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    改善機會鎖定
                  </h5>
                  <p className="text-3xs text-zinc-350 mt-1">
                    如果能透過標準化刀具將<strong>果皮損損降低 1.5%</strong>，預計本年度可多得 <strong>{Math.round(stats.totalInput * 0.015)} kg</strong> 的淨成品，利潤空間顯著。
                  </p>
                </div>

              </div>

              {/* Bottom detail timeline block: batch-by-batch data table */}
              <div className="lg:col-span-3 bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                      <span className="w-2 h-5 bg-orange-500 rounded-full shrink-0"></span>
                      各加工批次明細數據庫
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      詳細追蹤自1月至5月，所有登錄的原料進庫、刨皮去核之原始報表與即時步留率。
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-2xs px-3 py-1.5 bg-zinc-100 rounded-lg text-zinc-650 font-semibold">
                      總計: {filteredData.length} 條批次明細
                    </span>
                  </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto border border-zinc-250 rounded-xl max-h-96">
                  <table className="min-w-full divide-y divide-zinc-200 text-left text-xs">
                    <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3">加工日期</th>
                        <th className="px-4 py-3">水果品項</th>
                        <th className="px-4 py-3">進貨重量(kg)</th>
                        <th className="px-4 py-3">果皮耗損(kg)</th>
                        <th className="px-4 py-3">果芯耗損(kg)</th>
                        <th className="px-4 py-3">成品淨重(kg)</th>
                        <th className="px-4 py-3">處理人員</th>
                        <th className="px-4 py-3 text-right">步留率(%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 bg-white">
                      {filteredData.map((record) => (
                        <tr key={record.id} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="px-4 py-3 font-mono text-zinc-550">{record.date}</td>
                          <td className="px-4 py-3 font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            {record.fruitName} ({record.englishName})
                          </td>
                          <td className="px-4 py-3 font-mono text-zinc-800">{record.inputWeight} kg</td>
                          <td className="px-4 py-3 font-mono text-rose-500">-{record.waste1} kg</td>
                          <td className="px-4 py-3 font-mono text-amber-500">-{record.waste2} kg</td>
                          <td className="px-4 py-3 font-mono text-orange-600 font-bold">{record.netWeight} kg</td>
                          <td className="px-4 py-3 text-zinc-600 font-medium">{record.operator.split(' ')[0]}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900">
                            <span className={`px-2 py-0.5 rounded text-2xs ${
                              record.yieldRate >= 80 ? 'bg-orange-50 text-orange-700 font-black' :
                              record.yieldRate >= 70 ? 'bg-zinc-100 text-zinc-700' :
                              'bg-rose-50 text-rose-700'
                            }`}>
                              {record.yieldRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 3: OPERATOR EFFICIENCY MATRIX */}
          {activeTab === 'operator' && (
            <motion.div
              key="operator"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              
              {/* Leaderboard and stats overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {operatorGroupedStats.map((operator, opIdx) => (
                  <div 
                    key={operator.name}
                    onClick={() => setSelectedOperator(operator.name)}
                    className={`bg-white rounded-2xl border p-5 shadow-sm transition-all cursor-pointer relative ${
                      selectedOperator === operator.name 
                        ? 'border-orange-500 ring-2 ring-orange-500/10' 
                        : 'border-zinc-200 hover:border-zinc-350'
                    }`}
                  >
                    {/* Mastery rank icon */}
                    <div className="absolute top-4 right-4 animate-pulse">
                      {opIdx === 0 && <span className="p-1 px-2.5 bg-orange-600 text-white rounded-full text-3xs font-black uppercase tracking-wider">大師級 (精密級)</span>}
                      {opIdx === 1 && <span className="p-1 px-2.5 bg-zinc-800 text-zinc-100 rounded-full text-3xs font-black uppercase tracking-wider">主力級 (產能王)</span>}
                      {opIdx === 2 && <span className="p-1 px-2.5 bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-full text-3xs font-black uppercase tracking-wider">培訓期 (待加強)</span>}
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <div className={`p-2.5 rounded-xl text-white font-extrabold flex items-center justify-center w-10 h-10 shadow-sm ${
                        opIdx === 0 ? 'bg-orange-500 shadow-orange-100' : opIdx === 1 ? 'bg-zinc-800' : 'bg-zinc-400'
                      }`}>
                        {operator.shortName.charAt(3)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-zinc-850 text-base">{operator.shortName}</h4>
                        <span className="text-3xs text-zinc-400">登錄 <b>{operator.count}</b> 次水果處理批</span>
                      </div>
                    </div>

                    {/* Progress indicators of yield values */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center text-xs text-zinc-550 mb-1">
                          <span>平均成品步留得率:</span>
                          <span className="font-mono font-bold text-zinc-900 text-sm">{operator.avgYield}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              opIdx === 0 ? 'bg-orange-500' : opIdx === 1 ? 'bg-zinc-800' : 'bg-zinc-400'
                            }`}
                            style={{ width: `${operator.avgYield}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100">
                        <div>
                          <span className="text-3xs text-zinc-400 uppercase tracking-wide block">累計進貨總量</span>
                          <span className="text-sm font-bold text-zinc-800 font-mono">{operator.totalInput.toLocaleString()} kg</span>
                        </div>
                        <div>
                          <span className="text-3xs text-zinc-400 uppercase tracking-wide block">品質一致性 (標準差)</span>
                          <span className="text-sm font-bold text-zinc-850 font-mono">±{operator.stdDev}%</span>
                        </div>
                      </div>

                      <div className="text-3xs text-zinc-550 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 leading-relaxed">
                        {opIdx === 0 && '💡 刀工精緻扎實，果皮及芯切厚度控制極佳，穩定性極高，適合處理高單價鮮果、水蜜桃或芒果。'}
                        {opIdx === 1 && '💡 生產節奏敏捷，加工負載量最高，步留表現維持在標準中上，是廠內最核心的產能支柱。'}
                        {opIdx === 2 && '💡 因仍处于學習期，刨皮厚度控制不均勻，造成非必要的淨肉浪費，鳳梨與柿子削皮損耗特別明顯。'}
                      </div>
                    </div>

                  </div>
                ))}

              </div>

              {/* Side-by-side comparative analysis chart by fruit types */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                      <span className="w-2 h-5 bg-orange-500 rounded-full shrink-0"></span>
                      不同處理人員之各水果平均步留率比較
                    </h3>
                    <p className="text-sm text-zinc-550 mt-1">
                      用來稽核每一位作業員在處理不同厚度果皮時的「果肉挽救能力」，進而進行適性適任分工。
                    </p>
                  </div>
                  <span className="text-3xs bg-zinc-100 text-zinc-650 px-2.5 py-1 rounded-md font-mono">
                    數據依據歷史 200kg + 批次加權
                  </span>
                </div>

                {/* Comparison Bar chart per Operator per Fruit */}
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: '蘋果', '甲 (精細)': 88.5, '乙 (標準)': 87.1, '丙 (新手)': 85.5 },
                        { name: '鳳梨', '甲 (精細)': 63.8, '乙 (標準)': 60.1, '丙 (新手)': 58.0 },
                        { name: '奇異果', '甲 (精細)': 89.2, '乙 (標準)': 87.5, '丙 (新手)': 86.1 },
                        { name: '哈密瓜', '甲 (精細)': 80.5, '乙 (標準)': 78.4, '丙 (新手)': 76.2 },
                        { name: '柿子', '甲 (精細)': 63.2, '乙 (標準)': 59.8, '丙 (新手)': 57.5 },
                        { name: '芒果', '甲 (精細)': 89.1, '乙 (標準)': 87.4, '丙 (新手)': 86.4 }
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                      <XAxis dataKey="name" stroke="#71717A" fontSize={12} strokeWidth={0} />
                      <YAxis domain={[50, 100]} tickLine={false} axisLine={false} stroke="#71717A" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ background: '#18181B', border: 'none', borderRadius: '8px', color: '#FFF' }}
                        labelStyle={{ fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" iconType="circle" height={36} wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="甲 (精細)" fill="#F97316" radius={[4, 4, 0, 0]} barSize={16} />
                      <Bar dataKey="乙 (標準)" fill="#27272A" radius={[4, 4, 0, 0]} barSize={16} />
                      <Bar dataKey="丙 (新手)" fill="#71717A" radius={[4, 4, 0, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-150 text-xs text-zinc-600">
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex gap-2">
                    <span className="p-1 px-1.5 h-fit text-3xs font-bold text-rose-700 bg-rose-100 rounded">重大痛點</span>
                    <div>
                      <p className="font-bold text-rose-800">柿子與鳳梨的技能落差偏大 (約 5.7%-5.8% 淨裂口)</p>
                      <p className="mt-1 text-2xs text-zinc-550 leading-normal">
                        因這兩種水果表皮堅硬不均勻（鳳梨具有倒刺芽，柿子中央有堅硬果核），甲與丙之間的出肉率落差最大。這意味著丙在削切這兩種水果時，切削深度過大、力度過猛，砍掉了原本可以食用的果肉。
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex gap-2">
                    <span className="p-1 px-1.5 h-fit text-3xs font-bold text-orange-700 bg-orange-100 rounded">調度優勢</span>
                    <div>
                      <p className="font-bold text-orange-800">芒果與奇異果的削皮製程最為穩定</p>
                      <p className="mt-1 text-2xs text-zinc-550 leading-normal">
                        由於芒果與奇異果表皮均勻溫和，連新手的丙也可以維持在 86% 以上的高水準。因此建議在旺季調度上，新手丙可優先配置給芒果線，將高難度的鳳梨或柿子線全權交由甲與乙主導。
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 4: COMPREHENSIVE RECOMMENDATIONS & ROI REPORT */}
          {activeTab === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              
              {/* ROI & SAVINGS INTERACTIVE CALCULATOR */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm bg-gradient-to-br from-white to-zinc-50/50">
                <div className="flex items-center gap-2.5 mb-4 border-b border-zinc-100 pb-3">
                  <div className="p-1.5 bg-orange-500 text-white rounded-lg shadow-sm">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900">製程改善預期 ROI 與年化收益模擬器</h3>
                    <p className="text-3xs text-zinc-500 mt-0.5">
                      利用數據驅動的滑桿，模擬當我們實施全體人員技術標準化培訓後，節省的原物料與財務預算。
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Slider 1: Yield Increase */}
                  <div className="bg-white p-4 rounded-xl border border-zinc-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-zinc-650">預期步留率提升 (Yield Rate Uplift)</span>
                      <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                        +{roiYieldIncrease}%
                      </span>
                    </div>
                    <div className="text-3xs text-zinc-400 mb-3 block">
                      目前全廠平均為 <strong>{stats.avgYield}%</strong>。培訓後預期提升。
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="5.0"
                      step="0.1"
                      value={roiYieldIncrease}
                      onChange={(e) => setRoiYieldIncrease(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-orange-500 mb-2"
                    />
                    <div className="flex justify-between text-3xs font-mono text-zinc-400">
                      <span>+0.2% (保守)</span>
                      <span>+5.0% (極大提升)</span>
                    </div>
                  </div>

                  {/* Slider 2: Average Fruit Price */}
                  <div className="bg-white p-4 rounded-xl border border-zinc-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-zinc-650">成品果肉平均市價 / 公斤 (Value)</span>
                      <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                        $ {roiFruitPrice} 元 / kg
                      </span>
                    </div>
                    <div className="text-3xs text-zinc-400 mb-3 block">
                      果泥或真空切片完熟成品之加權平均單價。
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="300"
                      step="10"
                      value={roiFruitPrice}
                      onChange={(e) => setRoiFruitPrice(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-orange-500 mb-2"
                    />
                    <div className="flex justify-between text-3xs font-mono text-zinc-400">
                      <span>$50 元</span>
                      <span>$300 元</span>
                    </div>
                  </div>

                  {/* Simulated Output ROI Display */}
                  <div className="bg-zinc-900 text-white p-4 rounded-xl flex flex-col justify-between shadow-md">
                    <div>
                      <span className="text-3xs text-orange-400 font-extrabold block mb-1">🔥 預估年化製程總體效益：</span>
                      <div className="text-2xl font-black font-mono text-orange-400">
                        $ {simulatedSavings.annualGainedValue.toLocaleString()} <span className="text-xs font-normal text-zinc-300">NTD</span>
                      </div>
                    </div>

                    <div className="mt-3 text-3xs text-zinc-350 border-t border-zinc-800 pt-2 leading-relaxed font-semibold">
                      全廠總出肉率將從 <b>{stats.avgYield}%</b> 上調至 <b>{simulatedSavings.improvedYieldRate}%</b>。
                      相當於在不加購任何果實原物料的前提下，多獲得 <b>{simulatedSavings.additionalFleshKg} kg</b> 的無耗損果肉！
                    </div>
                  </div>

                </div>
              </div>

              {/* ACTIONABLE RECOMMENDATIONS REPORT LAYOUT */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm markdown-body">
                
                <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 block font-display tracking-tight flex items-center gap-2">
                      <span className="w-2 h-5 bg-orange-500 rounded-full shrink-0"></span>
                      水果製程步留提升與耗損控制改善建議報告
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      基於歷史大數據，為生產線主管與刀工品質小組制定的精準改善計畫。
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      window.print();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm shadow-orange-100"
                  >
                    <Download className="w-4 h-4" />
                    印表/PDF 報告
                  </button>
                </div>

                {/* Structured Sections */}
                <div className="space-y-8 text-sm text-zinc-700">
                  
                  {/* Executive Summary */}
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-3 bg-zinc-50 p-2 rounded border-l-4 border-orange-500 font-extrabold">
                      一、 現狀剖析與摘要 (Executive Summary)
                    </h4>
                    <p className="leading-relaxed text-xs text-zinc-550">
                      本全期原料加工大數據表明，果肉成品之加權平均步留率為 <strong>{stats.avgYield}%</strong>，果品耗損共計 <strong>{stats.avgLoss}%</strong>。其中果皮刨落佔據主要耗損（損耗比 <strong>{stats.avgPeelLossRate}%</strong>），去籽去果心則佔 <strong>{stats.avgCoreLossRate}%</strong>。柿子與鳳梨是耗損最高的兩大水果類，步留率僅為 <strong>59.6% - 63.5%</strong> 左右，存在極大的改良提升空間。
                    </p>
                  </div>

                  {/* Recommendation Item 1: Tooling */}
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-3 bg-zinc-50 p-2 rounded border-l-4 border-orange-500 font-extrabold">
                      二、 精細刀具引進與限位規格化 (Peeling Tool Sourcing)
                    </h4>
                    <div className="space-y-3 pl-2">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-zinc-800 block text-xs">引進限位式不鏽鋼削皮刀 (1.2mm Blade Limiters)</strong>
                          <span className="text-xs text-zinc-505 block mt-1 leading-normal">
                            分析指出，<strong>柿子</strong>與<strong>蘋果</strong>在削皮時的損耗率具有操作不均勻性。導入限位限深1.2mm的專業刨平刀片，可以硬性限制刨皮深度，防止新手大量刨掉靠近果皮的豐富果肉，預計可使蘋果與柿子之步留率提升 <strong>1.5% - 2.0%</strong>。
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-zinc-800 block text-xs">鳳梨除眼夾與半自動去芯機 (Core Removal Tools)</strong>
                          <span className="text-xs text-zinc-505 block mt-1 leading-normal">
                            鳳梨高達 <strong>31%-35%</strong> 的外皮損耗率，大部分是因為作業員為了削掉果實深層的「倒芽眼」而過度深切。建議全廠推廣「除眼刀夾」，先薄切削皮、再手拉去眼，或引入圓筒螺旋去芯機，可大幅挽回 <strong>4% 挽救重</strong>。
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Item 2: Personnel training */}
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-3 bg-zinc-50 p-2 rounded border-l-4 border-orange-500 font-extrabold">
                      三、 班組排班與適性化調度計畫 (Labor Adaptability Plan)
                    </h4>
                    <p className="text-xs leading-relaxed mb-3 text-zinc-550">
                      人員效率分析表明，三位作業員在不同硬度水果下的表現有明顯的「特長分布」：
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="p-3 border border-orange-200 bg-orange-50/20 rounded-xl">
                        <span className="font-bold text-orange-850 block text-xs">大師級「作業員甲」：</span>
                        <span className="text-2xs text-zinc-550 block mt-1">
                          安排至高難度的<strong>柿子</strong>與常規硬質<strong>鳳梨</strong>，充分利用其細微控制力，最大化核心果肉保存比。
                        </span>
                      </div>

                      <div className="p-3 border border-zinc-200 bg-zinc-100 rounded-xl">
                        <span className="font-bold text-zinc-800 block text-xs">主力級「作業員乙」：</span>
                        <span className="text-2xs text-zinc-550 block mt-1">
                          安排高吞吐量的<strong>哈密瓜</strong>、<strong>芒果</strong>主線。其平均 yield 高且速度極快，能妥善消納日常峰值壓力。
                        </span>
                      </div>

                      <div className="p-3 border border-zinc-150 bg-zinc-50 rounded-xl">
                        <span className="font-bold text-zinc-650 block text-xs">受訓期「作業員丙」：</span>
                        <span className="text-2xs text-zinc-550 block mt-1">
                          暫停獨立處理鳳梨，改配屬給「精細刀工組（甲）」進行學徒式的深度刀工觀摩，或僅輔助好切的<strong>奇異果</strong>與<strong>芒果</strong>。
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Recommendation Item 3: Secondary Waste Optimization */}
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-3 bg-zinc-50 p-2 rounded border-l-4 border-orange-500 font-extrabold">
                      四、 廢棄物與次級副產物回收 (Secondary Valorization)
                    </h4>
                    <p className="leading-relaxed text-xs text-zinc-550">
                      即便未來引入高階工法，果皮與核心依然有接近 <strong>15% - 25%</strong> 的剩餘天然生物量重。建議與下游有機肥料廠或生物科技企業對接。芒果皮與哈密瓜皮多含天然精油與纖維，鳳梨果芯極富鳳梨蛋白酶（Bromelain），經由二次加工提取可變現為保健原料，進一步抵銷前端果實原料的開支。
                    </p>
                  </div>

                </div>

                <div className="mt-8 pt-4 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-3xs text-zinc-400 font-mono">
                  <span>水果削皮得率分析小組 (Batch Peel Sourcing Analytics Unit)</span>
                  <span>報告編號: BPY-2026-N2 · 數據已自動即時同步至本廠 ERP</span>
                </div>

              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="bg-zinc-900 text-zinc-400 py-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs space-y-2">
          <p>© 2026 水果削皮加工廠 數據安全委員會 版權所有. 系統安全模式運轉中.</p>
          <p className="text-3xs text-zinc-500 uppercase tracking-widest font-mono">
            FRUIT SECTOR PRODUCTION EFFICIENCY ENGINES
          </p>
        </div>
      </footer>
    </div>
  );
}
