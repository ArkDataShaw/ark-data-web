import { useEffect } from 'react';

const CALENDLY_URL = 'https://calendly.com/jordan-arkdata/ark-data-info-session';

export default function BookADemo() {
  useEffect(() => {
    window.location.replace(CALENDLY_URL);
  }, []);

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#DFFFEF',
        fontSize: '15px',
      }}
    >
      Redirecting to Calendly…
    </div>
  );
}
