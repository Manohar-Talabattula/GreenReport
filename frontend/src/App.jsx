import "./App.css";
import hero from "./assets/hero.png";

import { auth } from "./firebase";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
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
  ResponsiveContainer,
} from "recharts";

import { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState(null);

  const [complaints, setComplaints] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    pollutionType: "",
    location: "",
    description: "",
    image: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const adminEmail = "manohartalabattula228@gmail.com";

  const API_URL = "https://greenreport.onrender.com/api/complaints";

  // ============================================================
  // FETCH COMPLAINTS
  // ============================================================

  const fetchComplaints = async () => {
    try {
      const response = await fetch(API_URL);

      console.log("Complaints API status:", response.status);

      if (!response.ok) {
        throw new Error(
          `Backend returned status ${response.status}`
        );
      }

      const data = await response.json();

      console.log("Complaints API response:", data);

      if (Array.isArray(data)) {
        setComplaints(data);
      } else if (Array.isArray(data.complaints)) {
        setComplaints(data.complaints);
      } else {
        console.warn(
          "Unexpected complaints response:",
          data
        );

        setComplaints([]);
      }
    } catch (error) {
      console.error(
        "Failed to fetch complaints:",
        error
      );

      setComplaints([]);
    }
  };

  // ============================================================
  // RESOLVE COMPLAINT
  // ============================================================

  const resolveComplaint = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to resolve complaint: ${response.status}`
        );
      }

      alert("Complaint resolved successfully.");

      await fetchComplaints();
    } catch (error) {
      console.error(
        "Resolve complaint error:",
        error
      );

      alert(
        "Unable to resolve the complaint. Please try again."
      );
    }
  };

  // ============================================================
  // DELETE COMPLAINT
  // ============================================================

  const deleteComplaint = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this complaint?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete complaint: ${response.status}`
        );
      }

      alert("Complaint deleted successfully.");

      await fetchComplaints();
    } catch (error) {
      console.error(
        "Delete complaint error:",
        error
      );

      alert(
        "Unable to delete the complaint. Please try again."
      );
    }
  };

  // ============================================================
  // GOOGLE LOGIN
  // ============================================================

  const handleGoogleLogin = async () => {
    try {
      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result =
        await signInWithPopup(
          auth,
          provider
        );

      setUser(result.user);
    } catch (error) {
      console.error(
        "Google login error:",
        error
      );

      alert(
        "Google login failed. Please try again."
      );
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    try {
      await signOut(auth);

      setUser(null);
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  };

  // ============================================================
  // AUTH STATE
  // ============================================================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          console.log(
            "Auth state:",
            currentUser
          );

          setUser(currentUser);
        }
      );

    return () => unsubscribe();
  }, []);

  // ============================================================
  // INITIAL COMPLAINT FETCH
  // ============================================================

  useEffect(() => {
    fetchComplaints();
  }, []);

  // ============================================================
  // HANDLE FORM CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value, files } =
      e.target;

    if (name === "image") {
      setFormData((previousData) => ({
        ...previousData,
        image:
          files && files.length > 0
            ? files[0]
            : null,
      }));
    } else {
      setFormData((previousData) => ({
        ...previousData,
        [name]: value,
      }));
    }
  };

  // ============================================================
  // SUBMIT COMPLAINT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.pollutionType ||
      !formData.location.trim() ||
      !formData.description.trim()
    ) {
      alert(
        "Please fill in all the required fields."
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const complaintData =
        new FormData();

      complaintData.append(
        "name",
        formData.name.trim()
      );

      complaintData.append(
        "pollutionType",
        formData.pollutionType
      );

      complaintData.append(
        "location",
        formData.location.trim()
      );

      complaintData.append(
        "description",
        formData.description.trim()
      );

      // Only send image when selected
      if (formData.image) {
        complaintData.append(
          "image",
          formData.image
        );
      }

      console.log(
        "Submitting complaint..."
      );

      const response =
        await fetch(
          `${API_URL}/report`,
          {
            method: "POST",
            body: complaintData,
          }
        );

      console.log(
        "Submit response status:",
        response.status
      );

      const responseText =
        await response.text();

      console.log(
        "Submit response:",
        responseText
      );

      if (!response.ok) {
        console.error(
          "Backend error:",
          responseText
        );

        alert(
          `Failed to submit report.\nServer returned: ${response.status}`
        );

        return;
      }

      let data = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch (parseError) {
        console.warn(
          "Response was not valid JSON:",
          parseError
        );
      }

      alert(
        data.message ||
          "Report submitted successfully!"
      );

      await fetchComplaints();

      setFormData({
        name: "",
        pollutionType: "",
        location: "",
        description: "",
        image: null,
      });

      e.target.reset();
    } catch (error) {
      console.error(
        "Submit complaint error:",
        error
      );

      alert(
        "Unable to submit the report. Please check whether the backend server is running."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // COUNTS
  // ============================================================

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

  // ============================================================
  // PIE CHART DATA
  // ============================================================

  const pieData = [
    {
      name: "Pending",
      value: pendingComplaints,
    },
    {
      name: "Resolved",
      value: resolvedComplaints,
    },
  ];

  // ============================================================
  // POLLUTION CHART DATA
  // ============================================================

  const pollutionData = [
    {
      type: "Air",
      count: complaints.filter(
        (item) =>
          item.pollutionType ===
          "Air Pollution"
      ).length,
    },

    {
      type: "Water",
      count: complaints.filter(
        (item) =>
          item.pollutionType ===
          "Water Pollution"
      ).length,
    },

    {
      type: "Garbage",
      count: complaints.filter(
        (item) =>
          item.pollutionType ===
          "Garbage Dumping"
      ).length,
    },

    {
      type: "Waste",
      count: complaints.filter(
        (item) =>
          item.pollutionType ===
          "Waste Burning"
      ).length,
    },
  ];

  const COLORS = [
    "#ff4444",
    "#00C851",
  ];

  // ============================================================
  // SEARCH FILTER
  // ============================================================

  const filteredComplaints =
    complaints.filter((item) => {
      const name =
        item.name || "";

      const location =
        item.location || "";

      const pollutionType =
        item.pollutionType || "";

      const search =
        searchTerm.toLowerCase();

      return (
        name
          .toLowerCase()
          .includes(search) ||
        location
          .toLowerCase()
          .includes(search) ||
        pollutionType
          .toLowerCase()
          .includes(search)
      );
    });

  // ============================================================
  // PENDING LIST
  // ============================================================

  const pendingList =
    filteredComplaints.filter(
      (item) =>
        item.status === "Pending"
    );

  // ============================================================
  // RESOLVED LIST
  // ============================================================

  const resolvedList =
    filteredComplaints.filter(
      (item) =>
        item.status === "Resolved"
    );

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="container">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="navbar">

        <h2 className="logo">
          GreenReport 🌱
        </h2>

        <ul className="nav-links">

          <li>
            <a href="#">Home</a>
          </li>

          <li>
            <a href="#about">About</a>
          </li>

          {user ? (
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
          )}

        </ul>

      </nav>

      {/* =====================================================
          USER INFORMATION
      ====================================================== */}

      {user && (
        <div className="user-info">

          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="profile"
            />
          )}

          <h2>
            Welcome,{" "}
            {user.displayName}
          </h2>

          <p>
            {user.email}
          </p>

        </div>
      )}

      {/* =====================================================
          ADMIN DASHBOARD
      ====================================================== */}

      {user &&
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

                    {pieData.map(
                      (
                        entry,
                        index
                      ) => (

                        <Cell
                          key={index}
                          fill={
                            COLORS[index]
                          }
                        />

                      )
                    )}

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
                  data={
                    pollutionData
                  }
                >

                  <XAxis
                    dataKey="type"
                  />

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

          {/* =================================================
              PENDING COMPLAINTS
          ================================================== */}

          <h2 className="section-title">
            Pending Complaints
          </h2>

          {pendingList.length === 0 ? (

            <p>
              No Pending Complaints
            </p>

          ) : (

            pendingList.map(
              (item) => (

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
                    </strong>{" "}
                    {item.pollutionType}
                  </p>

                  <p>
                    <strong>
                      Location:
                    </strong>{" "}
                    {item.location}
                  </p>

                  <p>
                    <strong>
                      Description:
                    </strong>{" "}
                    {item.description}
                  </p>

                  {item.image && (
                    <img
                      src={item.image}
                      alt="complaint"
                      className="complaint-image"
                    />
                  )}

                  <p>
                    <strong>
                      Reported On:
                    </strong>{" "}
                    {item.createdAt
                      ? new Date(
                          item.createdAt
                        ).toLocaleString()
                      : "N/A"}
                  </p>

                  <p>
                    <strong>
                      Status:
                    </strong>{" "}

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

              )
            )

          )}

          {/* =================================================
              RESOLVED COMPLAINTS
          ================================================== */}

          <h2 className="section-title">
            Resolved Complaints
          </h2>

          {resolvedList.length === 0 ? (

            <p>
              No Resolved Complaints
            </p>

          ) : (

            resolvedList.map(
              (item) => (

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
                    </strong>{" "}
                    {item.pollutionType}
                  </p>

                  <p>
                    <strong>
                      Location:
                    </strong>{" "}
                    {item.location}
                  </p>

                  <p>
                    <strong>
                      Description:
                    </strong>{" "}
                    {item.description}
                  </p>

                  {item.image && (
                    <img
                      src={item.image}
                      alt="complaint"
                      className="complaint-image"
                    />
                  )}

                  <p>
                    <strong>
                      Reported On:
                    </strong>{" "}
                    {item.createdAt
                      ? new Date(
                          item.createdAt
                        ).toLocaleString()
                      : "N/A"}
                  </p>

                  <p>
                    <strong>
                      Status:
                    </strong>{" "}

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

              )
            )

          )}

        </section>

      )}

      {/* =====================================================
          USER DASHBOARD
      ====================================================== */}

      {user &&
        user.email !== adminEmail && (

        <section className="user-dashboard">

          <h1>
            Report Pollution Issue
          </h1>

          <form
            className="report-form"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <input
              type="text"
              name="name"
              placeholder="Enter Your Name"
              value={formData.name}
              onChange={handleChange}
            />

            {/* POLLUTION TYPE */}

            <select
              name="pollutionType"
              value={
                formData.pollutionType
              }
              onChange={handleChange}
            >

              <option value="">
                Select Pollution Type
              </option>

              <option value="Garbage Dumping">
                Garbage Dumping
              </option>

              <option value="Air Pollution">
                Air Pollution
              </option>

              <option value="Water Pollution">
                Water Pollution
              </option>

              <option value="Waste Burning">
                Waste Burning
              </option>

            </select>

            {/* LOCATION */}

            <input
              type="text"
              name="location"
              placeholder="Enter Location"
              value={
                formData.location
              }
              onChange={handleChange}
            />

            {/* DESCRIPTION */}

            <textarea
              rows="5"
              name="description"
              placeholder="Describe the issue..."
              value={
                formData.description
              }
              onChange={handleChange}
            />

            {/* IMAGE */}

            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Submitting..."
                : "Submit Report"}
            </button>

          </form>

        </section>

      )}

      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      {!user && (
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
      )}

      {/* =====================================================
          ABOUT SECTION
      ====================================================== */}

      {!user && (
        <section
          id="about"
          className="about-section"
        >

          <div className="about-container">

            <h2>
              About GreenReport
            </h2>

            <p className="about-intro">
              GreenReport is a pollution and
              waste reporting platform designed
              to help people report environmental
              issues in their local areas and
              contribute to cleaner communities.
            </p>

            <div className="about-cards">

              <div className="about-card">

                <div className="about-icon">
                  🌱
                </div>

                <h3>
                  Report Pollution
                </h3>

                <p>
                  Report environmental problems
                  such as garbage dumping, air
                  pollution, water pollution and
                  waste burning in your area.
                </p>

              </div>

              <div className="about-card">

                <div className="about-icon">
                  📷
                </div>

                <h3>
                  Upload Evidence
                </h3>

                <p>
                  Upload an image along with
                  your complaint to provide
                  visual evidence of the
                  environmental issue.
                </p>

              </div>

              <div className="about-card">

                <div className="about-icon">
                  📊
                </div>

                <h3>
                  Track Complaints
                </h3>

                <p>
                  Complaints can be reviewed
                  and their status can be
                  tracked as they are processed.
                </p>

              </div>

              <div className="about-card">

                <div className="about-icon">
                  🌍
                </div>

                <h3>
                  Cleaner Communities
                </h3>

                <p>
                  GreenReport helps bring
                  environmental issues to
                  attention and encourages
                  cleaner and healthier
                  surroundings.
                </p>

              </div>

            </div>

          </div>

        </section>
      )}

    </div>
  );
}

export default App;