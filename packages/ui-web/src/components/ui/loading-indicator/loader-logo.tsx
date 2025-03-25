import React from 'react';

export const LoaderLogo = () => {
  return (
    <div className="w-full h-full items-center justify-center">
      <div className="loader-logo">
        <div className="square"></div>
        <div className="square"></div>
        <div className="square last"></div>
        <div className="square clear"></div>
        <div className="square"></div>
        <div className="square last"></div>
        <div className="square clear"></div>
        <div className="square "></div>
        <div className="square last"></div>
      </div>
    </div>
  );
};
