import React from 'react';

const CustomFlow = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="custom-flow-container" style={{ width: '100%', height: '100%' }}>
      {children}
    </div>
  );
};

export default CustomFlow;
