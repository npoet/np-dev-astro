import React, { useState } from "react";

const API_BASE = import.meta.env.FASTAPI_URL || "https://api.npoet.dev";

const TeamStatsIsland = () => {
  const [teamName, setTeamName] = useState("");
  const [teamInfo, setTeamInfo] = useState(null);
  const [seasonData, setSeasonData] = useState([]);
  const [recordData, setRecordData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeamData = async (team_id) => {
    setIsLoading(true);
    setError(null);
    try {
      const [teamResponse, seasonResponse, recordResponse] = await Promise.all([
        fetch(`${API_BASE}/team/${encodeURIComponent(team_id)}`).then((res) => res.json()),
        fetch(`${API_BASE}/season/${encodeURIComponent(team_id)}`).then((res) => res.json()),
        fetch(`${API_BASE}/record/${encodeURIComponent(team_id)}`).then((res) => res.json()),
      ]);

      setTeamInfo(teamResponse);
      setSeasonData(seasonResponse);
      setRecordData(recordResponse);
    } catch (err) {
      console.error("Error fetching team data:", err);
      setError("Failed to fetch team data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (teamName.trim()) fetchTeamData(teamName.trim());
  };

  return (
    <section className="scoreboard-section team-stats-island">
      <h3>Team Stats Lookup</h3>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Team Name ex. 'Michigan'..."
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          style={{ padding: "0.5rem", width: "200px" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem", marginLeft: "0.5rem" }}>
          Search
        </button>
      </form>

      {isLoading && <p>Loading {teamName} data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!isLoading && teamInfo && (
        <div className="team-stats-grid">

          {/* Left Column: Record + Ratings stacked */}
          <div className="left-column">
            {recordData && (
              <div className="scheduled-game">
                <h4>Team Record</h4>
                <p>Expected Wins: {recordData.exp_wins?.toFixed(2)}</p>
                <p>Conf: {recordData.conference_wl}</p>
                <p>Home: {recordData.home_wl}</p>
                <p>Away: {recordData.away_wl}</p>
              </div>
            )}

            {teamInfo && (
              <div className="scheduled-game" style={{ marginTop: "1rem" }}>
                <h4>Team Ratings</h4>
                <p>SP+ Rank: {teamInfo.sp_ovr_ranking}</p>
                <p>SP+ Overall: {teamInfo.sp_ovr_rating}</p>
                <p>SP+ Off: {teamInfo.sp_off_rating}</p>
                <p>SP+ Def: {teamInfo.sp_def_rating}</p>
                <p>ELO: {teamInfo.elo_ovr_rating}</p>
                <p>FPI Rank: {teamInfo.fpi_ovr_ranking}</p>
                <p>FPI: {teamInfo.fpi_ovr_rating}</p>
                <p>SoS: {teamInfo.fpi_sos}</p>
                <p>Game Control: {teamInfo.fpi_game_control}</p>
                <p>SRS: {teamInfo.srs_ovr_rating}</p>
              </div>
            )}
          </div>

          {/* Right Column: Schedule */}
          {seasonData.length > 0 && (
            <div className="right-column scheduled-game">
              <h4>Season Schedule</h4>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Home</th>
                      <th>Away</th>
                      <th>Home Pts</th>
                      <th>Away Pts</th>
                      <th>PG Win%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasonData.map((game, i) => (
                      <tr key={i}>
                        <td>{game.date}</td>
                        <td>{game.home}</td>
                        <td>{game.away}</td>
                        <td>{game.home_score ?? ""}</td>
                        <td>{game.away_score ?? ""}</td>
                        <td>{game.pg_win_prob ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </section>
  );
};

export default TeamStatsIsland;
