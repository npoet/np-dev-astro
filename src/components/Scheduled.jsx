import React from "react";

const Scheduled = ({ data }) => {
  const {
    home,
    home_site,
    home_logo,
    home_record,
    away,
    away_site,
    away_logo,
    away_record,
    time,
    tv,
  } = data;

  return (
    <div className="scheduled-game">
      <div className="team">
        <img src={away_logo} alt={`${away} Logo`} />
        <div className="info">
          <h2>
            {away}
          </h2>
          <p>{away_record}</p>
        </div>
      </div>
      <div className="versus">VS</div>
      <div className="team">
        <img src={home_logo} alt={`${home} Logo`} />
        <div className="info">
          <h2>
            {home}
          </h2>
          <p>{home_record}</p>
        </div>
      </div>
      <div className="game-time">
        <p>{time}</p>
        <p>{tv}</p>
      </div>
    </div>
  );
};

export default Scheduled;
