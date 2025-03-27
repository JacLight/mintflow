'use client';

export interface DocumentSkeletonProps {
  lines?: number;
  artifactKind?: string;
}

export function DocumentSkeleton({ lines = 10, artifactKind }: DocumentSkeletonProps) {
  return (
    <div className="document-skeleton">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-line"
          style={{
            height: '1rem',
            backgroundColor: '#f0f0f0',
            marginBottom: '0.5rem',
            borderRadius: '4px',
            width: `${Math.random() * 40 + 60}%`,
            opacity: 0.7,
            animation: 'pulse 1.5s infinite ease-in-out'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
