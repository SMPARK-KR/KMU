"use client";

import React from 'react';
import {
  LineChart, Line, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area
} from 'recharts';
import { Wind, Sun, CloudRain, Activity } from 'lucide-react';

interface CityData {
  city: string;
  pm10: number;
  pm25: number;
  o3?: number;
  no2?: number;
  co?: number;
  so2?: number;
  status: string;
}

export default function Dashboard({ data }: { data: CityData[] }) {
  return (
    <div className="dashboard-container">
      <header style={{ marginBottom: '40px' }}>
        <h1>국가 대기질 현황</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          에어코리아(Air Korea) 제공 실시간 대구/전국 대기오염 정보
        </p>
      </header>

      <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="glass-card stat-card">
          <div className="stat-icon"><Wind size={24} /></div>
          <div className="stat-info">
            <h3>평균 미세먼지 (PM10)</h3>
            <p>{data.length > 0 ? (data.reduce((acc, curr) => acc + curr.pm10, 0) / data.length).toFixed(1) : "N/A"}</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><Activity size={24} /></div>
          <div className="stat-info">
            <h3>평균 초미세먼지 (PM2.5)</h3>
            <p>{data.length > 0 ? (data.reduce((acc, curr) => acc + curr.pm25, 0) / data.length).toFixed(1) : "N/A"}</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><Sun size={24} /></div>
          <div className="stat-info">
            <h3>평균 오존 (O3)</h3>
            <p>{data.length > 0 ? (data.reduce((acc, curr) => acc + (curr.o3 || 0), 0) / data.length).toFixed(3) : "N/A"}</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><CloudRain size={24} /></div>
          <div className="stat-info">
            <h3>측정 지역 수</h3>
            <p>{data.length}</p>
          </div>
        </div>
      </div>

      <div className="grid-layout">
        <div className="glass-card" style={{ gridColumn: 'span 2', minHeight: '400px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>미세먼지 농도 비교 (PM10 vs PM2.5)</h2>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis dataKey="city" stroke="#8b949e" />
                <YAxis stroke="#8b949e" />
                <Tooltip 
                  contentStyle={{ background: '#0d1117', border: '1px solid #30363d' }}
                  itemStyle={{ color: '#f0f6fc' }}
                />
                <Legend />
                <Bar dataKey="pm10" fill="#58a6ff" name="미세먼지(PM10)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pm25" fill="#3fb950" name="초미세먼지(PM2.5)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              데이터를 불러오는 중이거나 사용할 수 없습니다.
            </div>
          )}
        </div>

        <div className="glass-card" style={{ gridColumn: 'span 1', minHeight: '400px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>지역별 오존(O3) 농도</h2>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorO3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff7b72" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff7b72" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="city" stroke="#8b949e" />
                <YAxis stroke="#8b949e" />
                <Tooltip 
                   contentStyle={{ background: '#0d1117', border: '1px solid #30363d' }}
                   itemStyle={{ color: '#f0f6fc' }}
                />
                <Area type="monotone" dataKey="o3" stroke="#ff7b72" fillOpacity={1} fill="url(#colorO3)" name="오존(O3)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              데이터가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
