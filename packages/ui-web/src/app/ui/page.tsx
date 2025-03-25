import BackgroundImage from './layout/background-image';
import SideNav from './layout/sidebar';
import LandingPage from './layout/welcome-demo';
import React from 'react';


export default function WebAppLayout(props) {
  return (
    <div className='w-full h-full'>
      <SideNav />
      <LandingPage />
      <BackgroundImage />
    </div>
  );
}
