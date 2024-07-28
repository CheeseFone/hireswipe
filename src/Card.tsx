import React, { useState, useEffect, useRef } from 'react';
import { User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface CardProps {
  description: string;
  onDelete: (direction: string, description: string) => void;
}

const Card: React.FC<CardProps> = ({ description, onDelete }) => {
  const initialPosition = { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 400 };
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setPosition({ x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 400 });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: event.clientX - cardRef.current!.offsetWidth / 2,
          y: event.clientY - cardRef.current!.offsetHeight / 2,
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (position.x <= 200) {
          onDelete('left', description);
        } else if (position.x >= window.innerWidth - 200 - cardRef.current!.offsetWidth) {
          onDelete('right', description);
        } else {
          setPosition(initialPosition);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position, description, onDelete, initialPosition]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  return (
    <div
      ref={cardRef}
      onMouseDown={handleMouseDown}
      style={{
        ...cardStyle,
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div style={photoPlaceholderStyle}>
        <User size={100} />
      </div>
      <div style={descriptionStyle}>
        <ReactMarkdown>{description}</ReactMarkdown>
      </div>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  width: '600px',
  height: '800px',
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
  cursor: 'move',
  position: 'absolute',
  overflow: 'hidden',
};

const photoPlaceholderStyle: React.CSSProperties = {
  width: '150px',
  height: '150px',
  backgroundColor: 'lightgray',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '20px',
  borderRadius: '50%',
};

const descriptionStyle: React.CSSProperties = {
  flex: 1,
  padding: '20px',
  backgroundColor: 'lightblue',
  margin: '0 20px 20px 20px',
  borderRadius: '8px',
  overflow: 'auto',
  fontSize: '18px',
  lineHeight: '1.6',
};

export default Card;