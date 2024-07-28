import React, { useState, useEffect, useCallback } from 'react';
import Card from './Card';
import leftImage from './imgs/left.png';
import rightImage from './imgs/right.png';
import backgroundImage from './imgs/background.png';
import pdfToText from 'react-pdftotext'


interface Decision {
  direction: string;
  description: string;
}

const Navbar: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
  return (
    <nav style={navStyle}>
      <div style={logoStyle}>Hireswipe</div>
      <ul style={tabListStyle}>
        <li style={tabItemStyle(activeTab === 'Swipe')} onClick={() => setActiveTab('Swipe')}>Swipe</li>
        <li style={tabItemStyle(activeTab === 'Decisions')} onClick={() => setActiveTab('Decisions')}>Decisions</li>
        <li style={tabItemStyle(activeTab === 'Files')} onClick={() => setActiveTab('Files')}>Files</li>
      </ul>
    </nav>
  );
};

const DecisionCard: React.FC<{ decision: Decision }> = ({ decision }) => {
  return (
    <div style={decisionCardStyle}>
      <p>{decision.description}</p>
    </div>
  );
};

const SwipeView: React.FC<{ cards: any[], handleDelete: (direction: string, description: string) => void }> = ({ cards, handleDelete }) => {
  const [overlayColor, setOverlayColor] = useState<string | null>(null);
  const [leftImageSize, setLeftImageSize] = useState<number>(75);
  const [rightImageSize, setRightImageSize] = useState<number>(75);

  const handleSwipeDelete = (direction: string, description: string) => {
    handleDelete(direction, description);
    if (direction === 'left') {
      setOverlayColor('rgba(255, 0, 0, 0.15)');
      setLeftImageSize(100);
      setTimeout(() => setLeftImageSize(75), 500);
    } else if (direction === 'right') {
      setOverlayColor('rgba(0, 255, 0, 0.15)');
      setRightImageSize(100);
      setTimeout(() => setRightImageSize(75), 500);
    }
    setTimeout(() => {
      setOverlayColor(null);
    }, 500);
  };

  return (
    <div style={cardAreaStyle}>
      <img src={backgroundImage} alt="Background" style={backgroundImageStyle} />
      {overlayColor && <div style={{ ...overlayStyle, backgroundColor: overlayColor }} />}
      <img src={leftImage} alt="Left" style={{ ...sideImageStyle, left: '75px', width: `${leftImageSize}px` }} />
      <img src={rightImage} alt="Right" style={{ ...sideImageStyle, right: '75px', width: `${rightImageSize}px` }} />
      {cards.map(card => (
        <Card
          key={card.id}
          description={card.description}
          onDelete={handleSwipeDelete}
        />
      ))}
    </div>
  );
};

const DecisionsView: React.FC<{ decisions: Decision[] }> = ({ decisions }) => {
  return (
    <div style={decisionsViewStyle}>
      <div style={columnStyle}>
        <h2 style={columnHeaderStyle}>Rejects</h2>
        {decisions.filter(d => d.direction === 'left').map((decision, index) => (
          <DecisionCard key={index} decision={decision} />
        ))}
      </div>
      <div style={columnStyle}>
        <h2 style={columnHeaderStyle}>Accepted</h2>
        {decisions.filter(d => d.direction === 'right').map((decision, index) => (
          <DecisionCard key={index} decision={decision} />
        ))}
      </div>
    </div>
  );
};

const FilesView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file.');
      event.target.value = '';
    }
  };

  const handleUpload = useCallback(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
      // Here you would typically send the text to a server for further processing
      pdfToText(selectedFile)
        .then(text => console.log(text))
        .catch(error => console.error("Failed to extract text from pdf"));
      };
      reader.readAsText(selectedFile);
    }
  }, [selectedFile]);

  return (
    <div style={filesViewStyle}>
      <div style={fileUploadBoxStyle}>
        <h2 style={fileUploadTitleStyle}>Upload PDF</h2>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={fileInputStyle}
          id="file-input"
        />
        <label htmlFor="file-input" style={fileInputLabelStyle}>
          Choose File
        </label>
        <button 
          onClick={handleUpload} 
          style={uploadButtonStyle}
          disabled={!selectedFile}
        >
          Upload and Process
        </button>
        {selectedFile && <p style={selectedFileTextStyle}>Selected file: {selectedFile.name}</p>}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Swipe');
  const [cards, setCards] = useState([
    { id: 1, description: "Card 1 Description" },
    { id: 2, description: "Card 2 Description" },
    { id: 3, description: "Card 3 Description" }
  ]);
  const [decisions, setDecisions] = useState<Decision[]>([]);

  useEffect(() => {
    const storedDecisions = JSON.parse(localStorage.getItem('cardLogs') || '[]');
    setDecisions(storedDecisions);
  }, []);

  const handleDelete = (direction: string, description: string) => {
    const cardData = { direction, description };
    const updatedDecisions = [...decisions, cardData];
    localStorage.setItem('cardLogs', JSON.stringify(updatedDecisions));
    setDecisions(updatedDecisions);
    setCards(cards.filter(card => card.description !== description));
  };

  return (
    <div style={appContainerStyle}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={contentStyle}>
        {activeTab === 'Swipe' && <SwipeView cards={cards} handleDelete={handleDelete} />}
        {activeTab === 'Decisions' && <DecisionsView decisions={decisions} />}
        {activeTab === 'Files' && <FilesView />}
      </div>
    </div>
  );
};

const appContainerStyle: React.CSSProperties = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f5f5f5',
  userSelect: 'none',
  overflow: 'hidden',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 2rem',
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const logoStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#007bff',
};

const tabListStyle: React.CSSProperties = {
  display: 'flex',
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

const tabItemStyle = (isActive: boolean): React.CSSProperties => ({
  margin: '0 1rem',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  borderRadius: '4px',
  backgroundColor: isActive ? '#e6f2ff' : 'transparent',
  color: isActive ? '#007bff' : '#333',
  transition: 'all 0.3s',
});

const contentStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  overflow: 'hidden',
};

const cardAreaStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
};

const backgroundImageStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '1000px',
  height: '700px',
  zIndex: 0,
};

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 10,
  pointerEvents: 'none',
  transition: 'background-color 0.5s ease',
};

const sideImageStyle: React.CSSProperties = {
  position: 'absolute',
  transition: 'width 0.5s ease',
};

const decisionsViewStyle: React.CSSProperties = {
  display: 'flex',
  width: '100%',
  height: '100%',
  backgroundColor: '#f5f5f5',
};

const columnStyle: React.CSSProperties = {
  flex: 1,
  padding: '1rem',
  overflowY: 'auto',
};

const columnHeaderStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '1rem',
  color: '#007bff',
};

const decisionCardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '1rem',
  marginBottom: '1rem',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const filesViewStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  width: '100%',
  height: '100%',
  backgroundColor: '#f5f5f5',
};

const fileUploadBoxStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '2rem',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: '400px',
};

const fileUploadTitleStyle: React.CSSProperties = {
  color: '#007bff',
  marginBottom: '1.5rem',
};

const fileInputStyle: React.CSSProperties = {
  display: 'none',
};

const fileInputLabelStyle: React.CSSProperties = {
  backgroundColor: '#e6f2ff',
  color: '#007bff',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  cursor: 'pointer',
  marginBottom: '1rem',
  transition: 'background-color 0.3s',
};

const uploadButtonStyle: React.CSSProperties = {
  backgroundColor: '#007bff',
  color: 'white',
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'background-color 0.3s',
};

const selectedFileTextStyle: React.CSSProperties = {
  marginTop: '1rem',
  color: '#666',
};

export default App;