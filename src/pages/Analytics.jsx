import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Radar, Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

function Analytics() {
  const [selectedSport, setSelectedSport] = useState("Cricket");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlayer1, setSelectedPlayer1] = useState("");
  const [selectedPlayer2, setSelectedPlayer2] = useState("");
  const [comparisonData, setComparisonData] = useState(null);

  const sports = [
    { id: "Cricket", name: "Cricket" },
    { id: "Football", name: "Football" },
    { id: "Badminton", name: "Badminton" },
  ];

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!selectedSport) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:2000/api/v2/admin/allplayers?sports=${selectedSport}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }
        const data = await response.json();
        setPlayers(data.data || []); // Assuming the API returns data in { data: [...players] } format
      } catch (error) {
        console.error("Error fetching players:", error);
        setError("Failed to load players. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [selectedSport]);

  const fetchComparison = async () => {
    if (!selectedPlayer1 || !selectedPlayer2) return;

    try {
      const response = await fetch(
        `http://localhost:2000/api/v2/main/compare?sport=Cricket&player1=67e91241e890aff20fdbde43&player2=67e91250e890aff20fdbde45`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch comparison data");
      }
      const data = await response.json();
      setComparisonData(data.data);
    } catch (error) {
      console.error("Error fetching comparison:", error);
      setError("Failed to load comparison data");
    }
  };

  useEffect(() => {
    if (selectedPlayer1 && selectedPlayer2) {
      fetchComparison();
    }
  }, [selectedPlayer1, selectedPlayer2]);

  const renderComparisonStats = () => {
    if (!comparisonData) return null;

    const radarData = {
      labels: comparisonData.visualData.labels,
      datasets: [
        {
          label: comparisonData.player1.basicInfo.name,
          data: comparisonData.visualData.player1Data,
          fill: true,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgb(54, 162, 235)",
          pointBackgroundColor: "rgb(54, 162, 235)",
          pointBorderColor: "#fff",
        },
        {
          label: comparisonData.player2.basicInfo.name,
          data: comparisonData.visualData.player2Data,
          fill: true,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgb(255, 99, 132)",
          pointBackgroundColor: "rgb(255, 99, 132)",
          pointBorderColor: "#fff",
        },
      ],
    };

    return (
      <div className="mt-8">
        {/* Player Basic Info Cards */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {[comparisonData.player1, comparisonData.player2].map(
            (player, idx) => (
              <div key={idx} className="bg-energy rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={player.basicInfo.photo}
                    alt={player.basicInfo.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {player.basicInfo.name}
                    </h3>
                    <p className="text-gray-400">Age: {player.basicInfo.age}</p>
                    <p className="text-gray-400">
                      Team: {player.basicInfo.team.name}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">
                      {player.careerStats.matchesPlayed}
                    </p>
                    <p className="text-sm text-gray-400">Matches</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">
                      {player.careerStats.wins}
                    </p>
                    <p className="text-sm text-gray-400">Wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">
                      {player.careerStats.winPercentage}%
                    </p>
                    <p className="text-sm text-gray-400">Win Rate</p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Radar Chart */}
        <div className="bg-miniaccent p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            Overall Comparison
          </h3>
          <div className="h-[400px]">
            <Radar
              data={radarData}
              options={{
                scales: {
                  r: {
                    min: 0,
                    max: 100,
                    ticks: { color: "white" },
                    grid: { color: "rgba(255, 255, 255, 0.1)" },
                    pointLabels: { color: "white" },
                  },
                },
                plugins: {
                  legend: {
                    labels: { color: "white" },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Batting Stats with Detailed Information */}
        <div className="bg-midnight rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            Batting Statistics
          </h3>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-3">
                Overall Performance
              </h4>
              {Object.entries(comparisonData.comparison.batting.overall).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center border-b border-gray-700 pb-2"
                  >
                    <span className="text-gray-400 capitalize">{key}</span>
                    <div className="flex space-x-8">
                      <span className="text-blue-400 w-20 text-right">
                        {value.player1}
                      </span>
                      <span className="text-pink-400 w-20 text-right">
                        {value.player2}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Boundaries Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white mb-3">
                Boundaries
              </h4>
              {Object.entries(comparisonData.comparison.batting.boundaries).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center border-b border-gray-700 pb-2"
                  >
                    <span className="text-gray-400 capitalize">
                      {key === "boundaryPercentage" ? "Boundary %" : key}
                    </span>
                    <div className="flex space-x-8">
                      <span className="text-blue-400 w-20 text-right">
                        {value.player1}
                      </span>
                      <span className="text-pink-400 w-20 text-right">
                        {value.player2}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Dismissals Section */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-white mb-3">
              Dismissal Types
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Object.entries(comparisonData.comparison.batting.dismissals).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center border-b border-gray-700 pb-2"
                  >
                    <span className="text-gray-400 capitalize">{key}</span>
                    <div className="flex space-x-8">
                      <span className="text-blue-400 w-16 text-right">
                        {value.player1}
                      </span>
                      <span className="text-pink-400 w-16 text-right">
                        {value.player2}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Bar Chart for Boundaries Comparison */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-white mb-3">
              Boundaries Comparison
            </h4>
            <div className="h-[300px]">
              <Bar
                data={{
                  labels: ["Fours", "Sixes"],
                  datasets: [
                    {
                      label: comparisonData.player1.basicInfo.name,
                      data: [
                        comparisonData.comparison.batting.boundaries.fours
                          .player1,
                        comparisonData.comparison.batting.boundaries.sixes
                          .player1,
                      ],
                      backgroundColor: "rgba(54, 162, 235, 0.8)",
                    },
                    {
                      label: comparisonData.player2.basicInfo.name,
                      data: [
                        comparisonData.comparison.batting.boundaries.fours
                          .player2,
                        comparisonData.comparison.batting.boundaries.sixes
                          .player2,
                      ],
                      backgroundColor: "rgba(255, 99, 132, 0.8)",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                      ticks: {
                        color: "white",
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: "white",
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: "white",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Bowling Stats */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Bowling Comparison
          </h3>
          <div className="grid grid-cols-2 gap-8">
            {Object.entries(comparisonData.comparison.bowling.overall).map(
              ([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-gray-400 capitalize">{key}</span>
                  <div className="flex space-x-8">
                    <span className="text-blue-400">{value.player1}</span>
                    <span className="text-pink-400">{value.player2}</span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-darkbc">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Compare Players
            </h1>

            {/* Sports Selection */}
            <div className="flex justify-center gap-4 mt-8">
              {sports.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => {
                    setSelectedSport(sport.id);
                    setSelectedPlayer1("");
                    setSelectedPlayer2("");
                  }}
                  className={`px-6 py-3 rounded-lg transition-all ${
                    selectedSport === sport.id
                      ? "bg-miniaccent text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {sport.name}
                </button>
              ))}
            </div>

            {/* Player Selection Dropdowns */}
            {!loading && !error && players.length > 0 && (
              <div className="flex justify-center gap-8 mt-8">
                {/* First Player Dropdown */}
                <div className="w-64">
                  <select
                    value={selectedPlayer1}
                    onChange={(e) => setSelectedPlayer1(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-miniaccent"
                  >
                    <option value="">Select Player 1</option>
                    {players.map((player) => (
                      <option key={player._id} value={player._id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Second Player Dropdown */}
                <div className="w-64">
                  <select
                    value={selectedPlayer2}
                    onChange={(e) => setSelectedPlayer2(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-miniaccent"
                  >
                    <option value="">Select Player 2</option>
                    {players.map((player) => (
                      <option key={player._id} value={player._id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Comparison Stats */}
            {selectedPlayer1 && selectedPlayer2 && renderComparisonStats()}

            {/* Error Message */}
            {error && <div className="text-red-500 mt-4">{error}</div>}

            {/* Loading State */}
            {loading && (
              <div className="text-white mt-8">Loading players...</div>
            )}

            {/* Players List */}
            {!loading && !error && players.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {players.map((player) => (
                  <div
                    key={player._id}
                    className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <h3 className="text-white text-xl mb-2">{player.name}</h3>
                    <div className="text-gray-300">
                      <p>Team: {player.team}</p>
                      <p>Position: {player.position}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Players Message */}
            {!loading && !error && players.length === 0 && selectedSport && (
              <div className="text-gray-400 mt-8">
                No players found for {selectedSport}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Analytics;
