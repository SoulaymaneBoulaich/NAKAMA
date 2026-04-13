import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import type { RatingCategoryStats } from '../../../../shared/types/index.js';

interface ProfileFingerprintProps {
  data: RatingCategoryStats[];
}

const ProfileFingerprint: React.FC<ProfileFingerprintProps> = ({ data }) => {
  // Ensure data exists and is formatted for Recharts
  const chartData = data.map(item => ({
    subject: item.category,
    A: item.average,
    fullMark: 10,
  }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-gray-800 rounded-sm">
        <span className="text-gray-600 uppercase tracking-widest text-xs font-bold">No rating data yet</span>
      </div>
    );
  }

  return (
    <div className="w-full h-80 bg-[var(--bg-tertiary)] border border-gray-800 rounded-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-white uppercase tracking-tighter">Anime Fingerprint</h3>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Category Averages</span>
      </div>
      <div className="w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} 
            />
            <Radar
              name="User"
              dataKey="A"
              stroke="var(--accent-primary)"
              fill="var(--accent-primary)"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfileFingerprint;
