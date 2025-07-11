import React from 'react';
import { FaFutbol, FaBasketballBall, FaVolleyballBall, FaTableTennis, FaFeather, FaChess } from 'react-icons/fa';
import './SportSelector.css';

const SportSelector = ({ selectedSport, onSelectSport }) => {
  const sports = [
    { name: 'Football', icon: <FaFutbol />, color: '#FF6F61' },
    { name: 'Basketball', icon: <FaBasketballBall />, color: '#FFA07A' },
    { name: 'Volleyball', icon: <FaVolleyballBall />, color: '#87CEEB' },
    { name: 'Ping-Pong', icon: <FaTableTennis />, color: '#98FB98' },
    { name: 'Badminton', icon: <FaFeather />, color: '#DDA0DD' },
    { name: 'Chess', icon: <FaChess />, color: '#FFD700' },
  ];

  return (
    <div className="sport-selector">
      {sports.map((sport) => (
        <button
          key={sport.name}
          className={`sport-button ${selectedSport === sport.name ? 'selected' : ''}`}
          style={{ '--sport-color': sport.color }}
          onClick={() => onSelectSport(sport.name)}
          aria-label={`Select ${sport.name}`}
          aria-pressed={selectedSport === sport.name}
        >
          <span className="sport-icon">{sport.icon}</span>
          <span className="sport-name">{sport.name}</span>
        </button>
      ))}
    </div>
  );
};

export default SportSelector;