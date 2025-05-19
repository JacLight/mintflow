import React from 'react';
import { IconRenderer } from '../ui/icon-renderer';
import { LoadingIndicator } from '../ui/loading-indicator';
import { classNames } from '@/lib-client/helpers';
import { buttonClass, buttonHoverClass } from '@/lib-client/constants';

export default function CircularIntegration() {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const timer = React.useRef<any>();

  React.useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const handleButtonClick = () => {
    if (!loading) {
      setSuccess(false);
      setLoading(true);
      timer.current = setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 2000);
    }
  };

  return (
    <div>
      <div>
        <button aria-label="save" color="primary" onClick={handleButtonClick}>
          {success ? <IconRenderer icon="Check" /> : <IconRenderer icon="Save" />}
        </button>
        {loading && <LoadingIndicator size={68} />}
      </div>
      <div>
        <button className={classNames(buttonHoverClass, buttonClass)} disabled={loading} onClick={handleButtonClick}>
          Accept terms
        </button>
        {loading && <LoadingIndicator size={24} />}
      </div>
    </div>
  );
}
