import './App.css'
import hero from './assets/hero.png'

import { auth } from './firebase'

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { useState, useEffect } from 'react';

function App() {

  const [user, setUser] = useState(null);

  const [complaints, setComplaints] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({

    name: "",

    pollutionType: "",

    location: "",

    description: "",

    image: null

  });

  const adminEmail =
    "manohartalabattula228@gmail.com";

  // FETCH COMPLAINTS

  const fetchComplaints = async () => {

    try {

      const response = await fetch(
        "https://greenreport.onrender.com/api/complaints"
      );

      const data = await response.json();

      setComplaints(data);

    } catch (error) {

      console.log(error);

    }

  };

  // RESOLVE

  const resolveComplaint = async (id) => {

    try {

      await fetch(

        `https://greenreport.onrender.com/api/complaints/${id}`,

        {
          method: "PUT"
        }

      );

      fetchComplaints();

    } catch (error) {

      console.log(error);

    }

  };

  // DELETE

  const deleteComplaint = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this complaint?"
      );

    if (!confirmDelete) {

      return;

    }

    try {

      await fetch(

        `https://greenreport.onrender.com/api/complaints/${id}`,

        {
          method: "DELETE"
        }

      );

      fetchComplaints();

    } catch (error) {

      console.log(error);

    }

  };

  // GOOGLE LOGIN

  const handleGoogleLogin = async () => {

    try {

      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account"
      });

      const result =
        await signInWithPopup(
          auth,
          provider
        );

      setUser(result.user);

    } catch (error) {

      console.log(error);

    }

  };

  // LOGOUT

  const handleLogout = async () => {

    await signOut(auth);

    setUser(null);

  };

  // AUTH

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(

        auth,

        (currentUser) => {

          setUser(currentUser);

        }

      );

    return () => unsubscribe();

  }, []);

  // FETCH

  useEffect(() => {

    fetchComplaints();

  }, []);

  // HANDLE CHANGE

  const handleChange = (e) => {

    if (e.target.name === "image") {

      setFormData({

        ...formData,

        image: e.target.files[0]

      });

    }

    else {

      setFormData({

        ...formData,

        [e.target.name]:
          e.target.value

      });

    }

  };

  // SUBMIT

  const handleSubmit = async (e) => {

  e.preventDefault();

  try {

    const complaintData =
      new FormData();

    complaintData.append(
      "name",
      formData.name
    );

    complaintData.append(
      "pollutionType",
      formData.pollutionType
    );

    complaintData.append(
      "location",
      formData.location
    );

    complaintData.append(
      "description",
      formData.description
    );

    // IMAGE

    if (formData.image) {

      complaintData.append(
        "image",
        formData.image
      );

    }

    const response =
      await fetch(

        "https://greenreport.onrender.com/api/complaints/report",

        {

          method: "POST",

          body: complaintData

        }

      );

    const data =
      await response.json();

    console.log(data);

    if (response.ok) {

      alert(
        "Complaint Submitted Successfully ✅"
      );

      fetchComplaints();

      setFormData({

        name: "",

        pollutionType: "",

        location: "",

        description: "",

        image: null

      });

    }

    else {

      alert(
        data.message
      );

    }

  }

  catch (error) {

    console.log(error);

    alert(
      "Submission Failed"
    );

  }

};
  // COUNTS

  const totalComplaints =
    complaints.length;

  const resolvedComplaints =
    complaints.filter(
      (item) =>
        item.status === "Resolved"
    ).length;

  const pendingComplaints =
    complaints.filter(
      (item) =>
        item.status === "Pending"
    ).length;

  // CHART DATA

  const pieData = [

    {
      name: "Pending",
      value: pendingComplaints
    },

    {
      name: "Resolved",
      value: resolvedComplaints
    }

  ];

  const pollutionData = [

    {
      type: "Air",
      count: complaints.filter(
        (item) =>
          item.pollutionType ===
          "Air Pollution"
      ).length
    },

    {
      type: "Water",
      count: complaints.filter(
        (item) =>
          item.pollutionType ===
          "Water Pollution"
      ).length
    },

    {
      type: "Garbage",
      count: complaints.filter(
        (item) =>
          item.pollutionType ===
          "Garbage Dumping"
      ).length
    },

    {
      type: "Waste",
      count: complaints.filter(
        (item) =>
          item.pollutionType ===
          "Waste Burning"
      ).length
    }

  ];

  const COLORS = [
    "#ff4444",
    "#00C851"
  ];

  // SEARCH FILTER

  const filteredComplaints =
    complaints.filter((item) =>

      item.name.toLowerCase().includes(
        searchTerm.toLowerCase()
      )

      ||

      item.location.toLowerCase().includes(
        searchTerm.toLowerCase()
      )

      ||

      item.pollutionType.toLowerCase().includes(
        searchTerm.toLowerCase()
      )

    );

  // SECTIONS

  const pendingList =
    filteredComplaints.filter(
      (item) =>
        item.status === "Pending"
    );

  const resolvedList =
    filteredComplaints.filter(
      (item) =>
        item.status === "Resolved"
    );

  return (

    <div className="container">

      {/* NAVBAR */}

      <nav className="navbar">

        <h2 className="logo">
          GreenReport 🌱
        </h2>

        <ul className="nav-links">

          <li>Home</li>

          <li>About</li>

          {

            user ? (

              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>

            ) : (

              <button
                className="login-btn"
                onClick={handleGoogleLogin}
              >
                Login with Google
              </button>

            )

          }

        </ul>

      </nav>

      {/* USER INFO */}

      {

        user && (

          <div className="user-info">

            <img
              src={user.photoURL}
              alt="profile"
            />

            <h2>
              Welcome,
              {" "}
              {user.displayName}
            </h2>

            <p>
              {user.email}
            </p>

          </div>

        )

      }

      {/* ADMIN */}

      {

        user &&
        user.email === adminEmail && (

          <section className="admin-dashboard">

            <h1>
              Admin Dashboard
            </h1>

            {/* CARDS */}

            <div className="dashboard-cards">

              <div className="dashboard-card">

                <h2>
                  {totalComplaints}
                </h2>

                <p>
                  Total Complaints
                </p>

              </div>

              <div className="dashboard-card">

                <h2>
                  {resolvedComplaints}
                </h2>

                <p>
                  Resolved Issues
                </p>

              </div>

              <div className="dashboard-card">

                <h2>
                  {pendingComplaints}
                </h2>

                <p>
                  Pending Complaints
                </p>

              </div>

            </div>

            {/* CHARTS */}

            <div className="charts-container">

              <div className="chart-box">

                <h2>
                  Complaint Status
                </h2>

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <PieChart>

                    <Pie
                      data={pieData}
                      dataKey="value"
                      outerRadius={100}
                      label
                    >

                      {

                        pieData.map(
                          (entry, index) => (

                            <Cell
                              key={index}
                              fill={COLORS[index]}
                            />

                          )
                        )

                      }

                    </Pie>

                    <Tooltip />

                  </PieChart>

                </ResponsiveContainer>

              </div>

              <div className="chart-box">

                <h2>
                  Pollution Analytics
                </h2>

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <BarChart
                    data={pollutionData}
                  >

                    <XAxis dataKey="type" />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="count"
                      fill="#007E33"
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>

            {/* SEARCH */}

            <input
              type="text"
              placeholder="Search complaints..."
              className="search-input"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
            />

            {/* PENDING */}

            <h2 className="section-title">
              Pending Complaints
            </h2>

            {

              pendingList.length === 0 ? (

                <p>
                  No Pending Complaints
                </p>

              ) : (

                pendingList.map((item) => (

                  <div
                    className="complaint-card"
                    key={item._id}
                  >

                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      <strong>
                        Pollution Type:
                      </strong>
                      {" "}
                      {item.pollutionType}
                    </p>

                    <p>
                      <strong>
                        Location:
                      </strong>
                      {" "}
                      {item.location}
                    </p>

                    <p>
                      <strong>
                        Description:
                      </strong>
                      {" "}
                      {item.description}
                    </p>

                    {

                      item.image && (

                        <img
                          src={item.image}
                          alt="complaint"
                          className="complaint-image"
                        />

                      )

                    }

                    <p>
                      <strong>
                        Reported On:
                      </strong>
                      {" "}
                      {
                        new Date(
                          item.createdAt
                        ).toLocaleString()
                      }
                    </p>

                    <p>

                      <strong>
                        Status:
                      </strong>

                      {" "}

                      <span className="pending-status">

                        {item.status}

                      </span>

                    </p>

                    <button
                      className="resolve-btn"
                      onClick={() =>
                        resolveComplaint(
                          item._id
                        )
                      }
                    >
                      Resolve
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteComplaint(
                          item._id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                ))

              )

            }

            {/* RESOLVED */}

            <h2 className="section-title">
              Resolved Complaints
            </h2>

            {

              resolvedList.length === 0 ? (

                <p>
                  No Resolved Complaints
                </p>

              ) : (

                resolvedList.map((item) => (

                  <div
                    className="complaint-card"
                    key={item._id}
                  >

                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      <strong>
                        Pollution Type:
                      </strong>
                      {" "}
                      {item.pollutionType}
                    </p>

                    <p>
                      <strong>
                        Location:
                      </strong>
                      {" "}
                      {item.location}
                    </p>

                    <p>
                      <strong>
                        Description:
                      </strong> 
                      {" "}
                      {item.description}
                    </p>

                    {

                      item.image && (

                        <img
                          src={item.image}
                          alt="complaint"
                          className="complaint-image"
                        />

                      )

                    }

                    <p>
                      <strong>
                        Reported On:
                      </strong>
                      {" "}
                      {
                        new Date(
                          item.createdAt
                        ).toLocaleString()
                      }
                    </p>

                    <p>

                      <strong>
                        Status:
                      </strong>

                      {" "}

                      <span className="resolved-status">

                        {item.status}

                      </span>

                    </p>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteComplaint(
                          item._id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                ))

              )

            }

          </section>

        )

      }

      {/* USER */}

      {

        user &&
        user.email !== adminEmail && (

          <section className="user-dashboard">

            <h1>
              Report Pollution Issue
            </h1>

            <form
              className="report-form"
              onSubmit={handleSubmit}
            >

              <input
                type="text"
                name="name"
                placeholder="Enter Your Name"
                value={formData.name}
                onChange={handleChange}
              />

              <select
                name="pollutionType"
                value={formData.pollutionType}
                onChange={handleChange}
              >

                <option value="">
                  Select Pollution Type
                </option>

                <option>
                  Garbage Dumping
                </option>

                <option>
                  Air Pollution
                </option>

                <option>
                  Water Pollution
                </option>

                <option>
                  Waste Burning
                </option>

              </select>

              <input
                type="text"
                name="location"
                placeholder="Enter Location"
                value={formData.location}
                onChange={handleChange}
              />

              <textarea
                rows="5"
                name="description"
                placeholder="Describe the issue..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>

              <input
                type="file"
                name="image"
                onChange={handleChange}
              />

              <button type="submit">
                Submit Report
              </button>

            </form>

          </section>

        )

      }

      {/* HERO */}

      {

        !user && (

          <section className="hero">

            <div className="hero-text">

              <h1>

                Pollution
                <br />

                & Waste
                <br />

                Reporting
                <br />

                Platform

              </h1>

              <p>

                Report environmental issues
                in your area and help create
                a cleaner society.

              </p>

            </div>

            <div className="hero-image">

              <img
                src={hero}
                alt="hero"
              />

            </div>

          </section>

        )

      }

    </div>

  );

}

export default App;