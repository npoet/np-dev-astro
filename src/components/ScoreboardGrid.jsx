import React, { useEffect, useState } from "react";
import Scheduled from "./Scheduled";
import Live from "./Live";
import Final from "./Final";

export default function ScoreboardGrid() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    async function fetchGames() {
      try {
        const [nflRes, cfbRes] = await Promise.all([
          fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard"),
          fetch("http://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard"),
        ]);
        const [nflData, cfbData] = await Promise.all([nflRes.json(), cfbRes.json()]);

        const allGames = [...(nflData.events || []), ...(cfbData.events || [])];

        const now = new Date();
        const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        // helper to get UTC date without time
        const toUTCDateOnly = (dateStr) => {
          const d = new Date(dateStr);
          return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        };

        // 1️⃣ Upcoming games today (future time)
        const upcomingToday = allGames
          .filter(g => {
            const gameDate = new Date(g.date);
            return toUTCDateOnly(g.date).getTime() === todayUTC.getTime() && gameDate >= now;
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        // 2️⃣ Live games
        const liveGames = allGames.filter(g => g.status?.type?.state === "in");

        // 3️⃣ Finished games today
        const finishedToday = allGames
          .filter(g => {
            const gameDate = new Date(g.date);
            return toUTCDateOnly(g.date).getTime() === todayUTC.getTime() && g.status?.type?.state === "post";
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        // 4️⃣ Future games (tomorrow or later)
        const futureGames = allGames
          .filter(g => new Date(g.date) > now)
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        const prioritizedGames = [...upcomingToday, ...liveGames, ...finishedToday, ...futureGames];

        // Deduplicate games by id
        const seenIds = new Set();
        const uniqueGames = prioritizedGames.filter(game => {
          if (seenIds.has(game.id)) return false;
          seenIds.add(game.id);
          return true;
        });

        // Limit to max 4
        setGames(uniqueGames.slice(0, 4));
      } catch (err) {
        console.error("Error fetching games:", err);
      }
    }

    fetchGames();
  }, []);

  function renderGame(game) {
    const state = game.status?.type?.state || "pre";
    const data = transformGameData(game);

    if (state === "in") return <Live key={game.id} data={data} />;
    if (state === "post") return <Final key={game.id} data={data} />;
    return <Scheduled key={game.id} data={data} />;
  }

  function transformGameData(game) {
    const comp = game.competitions?.[0];
    const home = comp?.competitors?.find(c => c.homeAway === "home");
    const away = comp?.competitors?.find(c => c.homeAway === "away");

    const pass_leader_name = comp?.leaders?.find((l) => l.name.includes("passing"))?.leaders?.[0]?.athlete?.shortName;
    const pass_leader_value = comp?.leaders?.find((l) => l.name.includes("passing"))?.leaders?.[0]?.displayValue;

    const rush_leader_name = comp?.leaders?.find((l) => l.name.includes("rushing"))?.leaders?.[0]?.athlete?.shortName;
    const rush_leader_value = comp?.leaders?.find((l) => l.name.includes("rushing"))?.leaders?.[0]?.displayValue;

    const rec_leader_name = comp?.leaders?.find((l) => l.name.includes("receiving"))?.leaders?.[0]?.athlete?.shortName;
    const rec_leader_value = comp?.leaders?.find((l) => l.name.includes("receiving"))?.leaders?.[0]?.displayValue;

    return {
      home: home?.team?.displayName,
      home_site: home?.team?.links?.[0]?.href,
      home_logo: home?.team?.logo,
      home_score: home?.score,
      home_record: home?.records?.[0]?.summary,

      away: away?.team?.displayName,
      away_site: away?.team?.links?.[0]?.href,
      away_logo: away?.team?.logo,
      away_score: away?.score,
      away_record: away?.records?.[0]?.summary,

      time: game.status?.type?.shortDetail,
      possession: comp?.situation?.possession === home?.id ? "home" : "away",
      ball_on: comp?.situation?.possessionText,
      short_down_distance: comp?.situation?.shortDownDistanceText,

      tv: comp?.broadcasts?.[0]?.names?.join(", ") || "—",

      headline: comp?.headlines?.[0]?.shortLinkText,
      pass_leader: pass_leader_name + " " + pass_leader_value,
      rush_leader: rush_leader_name + " " + rush_leader_value,
      rec_leader: rec_leader_name + " " + rec_leader_value,
    };
  }

  return (
    <div className="grid">
      {games.length === 0 ? <p>Loading games...</p> : games.map(renderGame)}
    </div>
  );
}
