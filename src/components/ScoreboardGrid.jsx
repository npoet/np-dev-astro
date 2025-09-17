import React, { useEffect, useState } from "react";
import Scheduled from "./Scheduled";
import Live from "./Live";
import Final from "./Final";

export default function ScoreboardGrid() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await fetch("https://api.npoet.dev/scores");
        if (!res.ok) throw new Error("Network response was not ok");
        const allGames = await res.json();

        const now = new Date();
        const allowedTypes = ["NFL", "FBS", "FCS"];
        const filtered = allGames.filter((g) =>
          allowedTypes.includes(g.type)
        );

        // infer status from date
        const withStatus = filtered.map((g) => {
          const kickoff = new Date(g.date);
          const diffHours = (now - kickoff) / (1000 * 60 * 60);

          let inferred = "final";
          if (kickoff > now) {
            inferred = "upcoming";
          } else if (diffHours >= 0 && diffHours <= 24) {
            inferred = "live"; // live window
          }
          return { ...g, inferredStatus: inferred };
        });

        // split by inferred status
        const upcoming = withStatus
          .filter((g) => g.inferredStatus === "upcoming")
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        const live = withStatus
          .filter((g) => g.inferredStatus === "live")
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        const finals = withStatus
          .filter((g) => g.inferredStatus === "final")
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        // priority: upcoming + live first
        let prioritized = [...upcoming, ...live];
        if (prioritized.length === 0) {
          prioritized = finals;
        }

        // limit to 6 games
        setGames(prioritized.slice(0, 6));
      } catch (err) {
        console.error("Error fetching games:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, []);

  function renderGame(game) {
    if (game.inferredStatus === "live") {
      return <Live key={game.id} data={game} />;
    } else if (game.inferredStatus === "final") {
      return <Final key={game.id} data={game} />;
    } else {
      return <Scheduled key={game.id} data={game} />;
    }
  }

  return (
    <div className="scoreboard-section">
  <div className="scoreboard-grid">
    {games.length === 0 ? <p>Loading games...</p> : games.map(renderGame)}
  </div>
</div>

  );
}
