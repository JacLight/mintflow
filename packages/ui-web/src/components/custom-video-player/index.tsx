import React, { memo, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';

const playModes = ['popup', 'inline', 'modal', 'fullscreen'];
const playTrigger = ['onClick', 'onHover', 'onLoad'];

export const CustomVideoPlayer = (props: { url; coverImage?; width?; height?; className?; style?; playMode?; noPreview? }) => {
  const [playVideo, setPlayVideo] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(props?.url || 'https://www.youtube.com/watch?v=ysz5S6PUM-U');
  }, [props.url]);

  const onClick = () => {
    // setPlayVideo(!playVideo)
  };

  const onMouseEnter = e => {
    if (props.noPreview) return;
    // setPlayVideo(true)
  };

  const onMouseLeave = e => {
    if (props.noPreview) return;
    // setPlayVideo(false)
  };

  return (
    <div onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className={props.className} style={props.style}>
      {!playVideo && props.coverImage && <img src={props.coverImage} alt="cover" className="w-full" style={{ height: props.height }} />}
      {playVideo || (!props.coverImage && <ReactPlayer url={url} width={'100%'} {...props} />)}
    </div>
  );
};
