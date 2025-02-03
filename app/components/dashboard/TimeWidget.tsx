'use client';

import { useEffect, useState } from 'react';

export function TimeWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-black rounded-sm p-4">
      <div className="text-4xl font-bold text-zinc-200">
        {time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })}
      </div>
      <div className="text-zinc-500">
        {time.toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })}
      </div>
    </div>
  );
} 