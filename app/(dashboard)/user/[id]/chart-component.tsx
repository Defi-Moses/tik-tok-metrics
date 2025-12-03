'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

interface ChartData {
  date: string;
  followers: number;
  likes: number;
  videos: number;
}

export function ChartComponent({ data }: { data: ChartData[] }) {
  const [selectedMetric, setSelectedMetric] = useState<'followers' | 'likes' | 'videos'>(
    'followers'
  );

  const metricConfig = {
    followers: {
      label: 'Followers',
      color: '#3b82f6',
      dataKey: 'followers',
    },
    likes: {
      label: 'Likes',
      color: '#10b981',
      dataKey: 'likes',
    },
    videos: {
      label: 'Videos',
      color: '#8b5cf6',
      dataKey: 'videos',
    },
  };

  const config = metricConfig[selectedMetric];

  if (data.length === 0) {
    return (
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200/50 dark:border-gray-800/50">
        <div className="text-center py-8 sm:py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/30 mb-3">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">No trend data available yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Data will appear here once metrics are collected over time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200/50 dark:border-gray-800/50">
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        <button
          onClick={() => setSelectedMetric('followers')}
          className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation min-h-[44px] ${
            selectedMetric === 'followers'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Followers
        </button>
        <button
          onClick={() => setSelectedMetric('likes')}
          className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation min-h-[44px] ${
            selectedMetric === 'likes'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Likes
        </button>
        <button
          onClick={() => setSelectedMetric('videos')}
          className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation min-h-[44px] ${
            selectedMetric === 'videos'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Videos
        </button>
      </div>
      <ResponsiveContainer width="100%" height={300} className="sm:h-[400px]">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => formatNumber(value)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number) => formatNumber(value)}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={config.dataKey}
            stroke={config.color}
            strokeWidth={2}
            dot={{ fill: config.color, r: 4 }}
            name={config.label}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

