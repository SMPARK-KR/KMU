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

      {/* 실시간 남한 대기질 지도 패널 추가 */}
      <div className="glass-card" style={{ marginTop: '30px', marginBottom: '30px', padding: '24px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sun size={24} style={{ color: '#ffaa00' }} /> 실시간 전국 미세먼지 지도
        </h2>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          
          {/* 지도 렌더링 영역 */}
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            maxWidth: '500px', 
            minHeight: '600px', 
            backgroundImage: "url('/map.png')", 
            backgroundSize: 'contain', 
            backgroundPosition: 'center', 
            backgroundRepeat: 'no-repeat'
          }}>
            {data.map((item) => {
              const coords: { [key: string]: { top: string; left: string } } = {
                "서울": { top: '21%', left: '33%' },
                "대구": { top: '57%', left: '68%' },
                "부산": { top: '72%', left: '76%' },
                "인천": { top: '22%', left: '26%' },
                "광주": { top: '70%', left: '33%' },
                "대전": { top: '48%', left: '44%' },
                "울산": { top: '65%', left: '81%' },
                "경기": { top: '26%', left: '39%' },
                "강원": { top: '16%', left: '57%' },
                "충북": { top: '38%', left: '50%' },
                "충남": { top: '44%', left: '30%' },
                "전북": { top: '57%', left: '36%' },
                "전남": { top: '75%', left: '30%' },
                "경북": { top: '45%', left: '71%' },
                "경남": { top: '67%', left: '64%' },
                "제주": { top: '91%', left: '30%' },
                "세종": { top: '42%', left: '39%' }
              };

              const pos = coords[item.city];
              if (!pos) return null;

              // 대기질에 따른 광채 및 색상 지정
              let bgColor = "#10b981"; // 좋음 (Green)
              let shadowColor = "rgba(16, 185, 129, 0.5)";
              if (item.pm10 > 150) { bgColor = "#8b5cf6"; shadowColor = "rgba(139, 92, 246, 0.5)"; }
              else if (item.pm10 > 80) { bgColor = "#ef4444"; shadowColor = "rgba(239, 68, 68, 0.5)"; }
              else if (item.pm10 > 30) { bgColor = "#f59e0b"; shadowColor = "rgba(245, 158, 11, 0.5)"; }

              return (
                <div 
                  key={item.city} 
                  style={{ 
                    position: 'absolute', 
                    top: pos.top, 
                    left: pos.left, 
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: bgColor,
                    padding: '4px 8px',
                    borderRadius: '20px',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    boxShadow: `0 0 12px ${shadowColor}`,
                    border: '1px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    zIndex: 10
                  }}
                  title={`PM10: ${item.pm10}, PM2.5: ${item.pm25}`}
                >
                  <span style={{ fontSize: '0.7rem' }}>{item.city}</span>
                  <div style={{ fontSize: '0.8rem', textAlign: 'center' }}>{item.pm10}</div>
                </div>
              );
            })}
          </div>

          {/* 우측 정밀 인포 그래픽 목록 */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '16px', color: '#8b949e' }}>📍 지역별 정밀 측정값</h3>
            <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.map((item) => {
                  let statusColor = "#10b981";
                  if (item.pm10 > 150) statusColor = "#8b5cf6";
                  else if (item.pm10 > 80) statusColor = "#ef4444";
                  else if (item.pm10 > 30) statusColor = "#f59e0b";

                  return (
                    <div key={item.city} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '12px', 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      borderRadius: '8px', 
                      border: '1px solid rgba(255, 255, 255, 0.05)' 
                    }}>
                      <strong style={{ fontSize: '15px' }}>{item.city}</strong>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#8b949e' }}>PM10: <span style={{ color: '#fff' }}>{item.pm10}</span></span>
                        <span style={{ fontSize: '13px', color: '#8b949e' }}>PM2.5: <span style={{ color: '#fff' }}>{item.pm25}</span></span>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: '12px', 
                          backgroundColor: statusColor, 
                          color: '#fff', 
                          fontSize: '11px', 
                          fontWeight: 'bold' 
                        }}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
