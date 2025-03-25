import React from 'react';

const BackgroundSVG = () => {
    return (
        <div className='absolute inset-0 flex items-center justify-start'>
            <svg
                width="2560"
                height="1920"
                viewBox="0 0 2560 1920"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    opacity: 0.5,
                }}
            >
                <g>
                    <path
                        d="M3020.93 134.455C3124.79 173.824 3164.97 266.778 3110.66 342.074C2627.55 1011.9 1866.31 2517.63 1361.75 2752.01C-681.389 3429.21 -4156.79 2571.47 -2138.3 1425.38C-119.809 279.282 -1553.39 -218.348 -406.211 -990.94C930.008 -1890.85 2560.5 -40.0647 3020.93 134.455Z"
                        fill="url(#paint0_radial_37_453-1)"
                    ></path>
                    {/* Add the rest of your paths and elements here */}
                </g>
                <defs>
                    <radialGradient
                        id="paint0_radial_37_453-1"
                        cx="0"
                        cy="0"
                        r="1"
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="translate(-804.109 -2036.8) rotate(64.9401) scale(6436.87 6304.81)"
                    >
                        <stop stopColor="var(--color-background-image-base)"></stop>
                        <stop offset="0.0833333" stopColor="var(--color-background-image-accent-1)"></stop>
                        <stop offset="0.364583" stopColor="var(--color-background-image-accent-2)"></stop>
                        <stop offset="0.658041" stopColor="var(--color-background-image-base)"></stop>
                        <stop offset="0.798521" stopColor="var(--color-background-image-accent-3)"></stop>
                        <stop offset="0.942708" stopColor="var(--color-background-image-base)"></stop>
                        <stop offset="1" stopColor="var(--color-background-image-base)"></stop>
                    </radialGradient>
                    {/* Add the rest of your gradients and definitions here */}
                </defs>
            </svg>
        </div>
    );
};

export default BackgroundSVG;
