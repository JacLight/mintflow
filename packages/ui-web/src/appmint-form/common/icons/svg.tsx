import React from 'react';
import { classNames } from '../../utils';

const tag = (
	width = 30,
	height = 30,
) => `<svg width="${width}" height="${height}" viewBox="0 0 76 76" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="full" enable-background="new 0 0 76.00 76.00" xml:space="preserve">
	<path fill="#000000" fill-opacity="1" stroke-width="0.2" stroke-linejoin="round" d="M 24.5416,19L 33.25,19L 55.4167,41.1667C 56.6533,42.4033 56.6533,44.4083 55.4167,45.645L 45.645,55.4167C 44.4084,56.6533 42.4033,56.6533 41.1667,55.4167L 19,33.25L 19,24.5417C 19,22.6945 19,20.8472 19.9236,19.9236C 20.8472,19 22.6944,19 24.5416,19 Z M 26.9167,23.75C 25.1678,23.75 23.75,25.1678 23.75,26.9167C 23.75,28.6656 25.1678,30.0833 26.9167,30.0833C 28.6656,30.0833 30.0833,28.6656 30.0833,26.9167C 30.0833,25.1678 28.6656,23.75 26.9167,23.75 Z "/>
</svg>`;

const BusyIcon = (props: { size?; color?; isLoading?; loadingMessage?; notLoadingMessage?; className?; overlay?}) => {
	if (!props.isLoading) {
		return props.notLoadingMessage || null;
	}

	const busyIcon = (
		<svg className="animate-spin -me-1  h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
		</svg>
	);

	const overlayClass = props.overlay ? 'absolute inset-0 bg-white bg-opacity-50 h-full w-full' : '';
	if (props.loadingMessage || props.overlay) {
		return (
			<div className={classNames('flex items-center justify-center gap-2', props.className, overlayClass)}>
				{busyIcon}
				{props.loadingMessage}
			</div>
		);
	}
	return busyIcon;
};

export { tag, BusyIcon };
export default BusyIcon