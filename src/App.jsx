import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import WeeklyDetails from "./pages/WeeklyDetails";
import Withdraw from "./pages/Withdraw";
import Deposit from "./pages/Deposit";
import Login from "./pages/Login";

const Home = () => <div>Home</div>;

const About = () => <div>About</div>;

const Contact = () => <div>Contact</div>;

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          exact
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route path="/login" exact element={<Login />} />
        <Route
          path="/weekly"
          element={
            <MainLayout>
              <WeeklyDetails />
            </MainLayout>
          }
        />
        <Route
          path="/withdraw"
          element={
            <MainLayout>
              <Withdraw />
            </MainLayout>
          }
        />
        <Route
          path="/deposit"
          element={
            <MainLayout>
              <Deposit />
            </MainLayout>
          }
        />
        <Route
          path="/trade"
          element={
            <MainLayout>
              <p>Trade</p>
            </MainLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <MainLayout>
              <p>Profile</p>
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
