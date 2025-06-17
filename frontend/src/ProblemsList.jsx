import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement } from "chart.js/auto";
import "./ProblemsList.css";
import { useNavigate } from "react-router-dom";
import User_img from "./assets/user.png";
import ShowSingleP from "./ShowSingleP";
import axiosInstance from "./utils/axiosConfig";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
Chart.register(ArcElement);

const ProblemsList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [basicP, setBasicP] = useState(0);
  const [easyP, setEasyP] = useState(0);
  const [mediumP, setMediumP] = useState(0);
  const [hardP, setHardP] = useState(0);
  const navigate = useNavigate();
  const [solved_easy, setSolved_easy] = useState(0);
  const [solved_basic, setSolved_basic] = useState(0);
  const [solved_medium, setSolved_medium] = useState(0);
  const [solved_hard, setSolved_hard] = useState(0);
  const [userid, setUserid] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedTag, setSelectedTag] = useState(""); // State to hold selected tag

  const calculateWidth = (solved, total) => {
    return total === 0 ? "0%" : `${(solved / total) * 100}%`;
  };

  useEffect(() => {
    const get_by_tag = async () => {
      if (!selectedTag) {
        return;
      }
      try {
        const response = await axios.get(
          `${API_BASE_URL}/query/problem/${selectedTag}`,
          {
            withCredentials: true,
          }
        );
        setProblems(response.data);
      } catch (error) {
        setError(error.message);
      }
    };

    get_by_tag();
  }, [selectedTag]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/problems`);
        setProblems(response.data);
        setLoading(false);

        let countBasic = 0;
        let countEasy = 0;
        let countMedium = 0;
        let countHard = 0;

        response.data.forEach((problem) => {
          switch (problem.difficulty) {
            case "basic":
              countBasic++;
              break;
            case "easy":
              countEasy++;
              break;
            case "medium":
              countMedium++;
              break;
            case "hard":
              countHard++;
              break;
            default:
              break;
          }
        });

        setBasicP(countBasic);
        setEasyP(countEasy);
        setMediumP(countMedium);
        setHardP(countHard);

        if (response.data.user_id) {
          setUserid(response.data.user_id);
        }
        
        setDataLoaded(true);
      } catch (error) {
        console.error("Error fetching problems:", error);
        setError("Failed to fetch problems. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  const data = {
    labels: ["Basic", "Easy", "Medium", "Hard"],
    datasets: [
      {
        data: [basicP, easyP, mediumP, hardP],
        backgroundColor: ["#CCE8CC", "#AEE1AE", "#FF8360", "#E94233"],
        hoverBackgroundColor: ["#FFD54F", "#81C784", "#FF8A65", "#FF5252"],
      },
    ],
  };

  function moveHome() {
    navigate("/");
  }

  function openAccount() {
    navigate("/myaccount");
  }

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
  };

  const handleProblemClick = (problemId) => {
    navigate(`/problems/${problemId}`);
  };

  return (
    <div>
      <div className="main_block">
        <div className="ProblemList">
          <div className="prob-container">
            <div className="tpart">
              <div className="heading_p">
                <button className="home-button" onClick={moveHome}>
                  <i className="fas fa-home"></i> Home
                </button>
                Top Coding Questions
              </div>
              <div className="heading_image">
                <img src="https://img.freepik.com/free-vector/man-shows-gesture-great-idea_10045-637.jpg?t=st=1718393335~exp=1718396935~hmac=f5906f097b297b7c87fc81b6d8d9cc08127f1ff4d9a12fd9cbf97d4f652afdef&w=1060" alt="" />
              </div>
            </div>

            <div className="all_prob_list">
              <ul>
                {Array.isArray(problems) && problems.length > 0 ? (
                  problems.map((problem) => (
                    <ShowSingleP
                      key={problem._id}
                      prob_id={problem._id}
                      user_id={userid}
                      name={problem.name}
                      description={problem.description}
                      difficulty={problem.difficulty}
                      tags={problem.tags}
                      submissions={"No"}
                    />
                  ))
                ) : (
                  <p>No problems found</p>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="side_block">
          <div className="pie-chart-container">
          <h4>Total Problems:</h4>
            <Pie data={data} />
          </div>

          {/*TAGS OPTION  */}
          <div className="tags_sec">
            <div className="tags_head">Filter by Tags</div>
            <div className="tags_input">
              <label>
                <input
                  type="checkbox"
                  checked={selectedTag === "arrays"}
                  onChange={() => handleTagClick("arrays")}
                />
                ARRAYS
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedTag === "Maths"}
                  onChange={() => handleTagClick("Maths")}
                />
                MATHS
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedTag === "Hash-Map"}
                  onChange={() => handleTagClick("Hash-Map")}
                />
                HASH-MAP
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedTag === "Binary-Search"}
                  onChange={() => handleTagClick("Binary-Search")}
                />
                BINARY-SEARCH
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedTag === "tree"}
                  onChange={() => handleTagClick("tree")}
                />
                TREE
              </label>
            </div>
          </div>

          <h3 className="bar_g">Progress Tracker</h3>
          <div className="solved-problems">
            <ul>
              <li className="bar basic-bar">
                <div
                  className="bar-inner basic-bar"
                  style={{ width: calculateWidth(solved_basic, basicP) }}
                ></div>
                <span className="count">
                  {solved_basic}/{basicP}
                </span>
              </li>
              <li className="bar easy-bar">
                <div
                  className="bar-inner easy-bar"
                  style={{ width: calculateWidth(solved_easy, easyP) }}
                ></div>
                <span className="count">
                  {solved_easy}/{easyP}
                </span>
              </li>
              <li className="bar medium-bar">
                <div
                  className="bar-inner medium-bar"
                  style={{ width: calculateWidth(solved_medium, mediumP) }}
                ></div>
                <span className="count">
                  {solved_medium}/{mediumP}
                </span>
              </li>
              <li className="bar hard-bar">
                <div
                  className="bar-inner hard-bar"
                  style={{ width: calculateWidth(solved_hard, hardP) }}
                ></div>
                <span className="count">
                  {solved_hard}/{hardP}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemsList;
