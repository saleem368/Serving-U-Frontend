import React from 'react';

export const SkeletonBox: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style = {} }) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    style={{ minHeight: 20, ...style }}
  />
);

export const SkeletonText: React.FC<{ width?: string | number; className?: string }> = ({ width = '100%', className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded h-4 mb-2 ${className}`} style={{ width }} />
);

export const SkeletonCircle: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = '' }) => (
  <div
    className={`animate-pulse bg-gray-200 rounded-full ${className}`}
    style={{ width: size, height: size }}
  />
);
