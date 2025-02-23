import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { logIn } from "../api/request";
import useAuthStore from "../store/authStore";

const Title = styled.h2`
  margin-bottom: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #121212;
  color: #fff;
`;

const AuthWrapper = styled.div`
  background: #1e1e1e;
  padding: 2rem;
  border-radius: 10px;
  width: 350px;
`;

const Input = styled.input`
  padding: 10px;
  margin: 8px 0;
  border-radius: 5px;
  border: none;
  background: #333;
  color: white;
  font-size: 1rem;
  outline: none;
  &::placeholder {
    color: #aaa;
  }
`;

const Button = styled.button`
  background: #ff9800;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 10px;
  &:hover {
    background: #e68900;
  }
`;

const ToggleText = styled.p`
  margin-top: 15px;
  cursor: pointer;
  color: #ff9800;
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.8rem;
  margin-top: -5px;
  margin-bottom: 5px;
`;

const Login = () => {
  const navigate = useNavigate();
  const { saveUser } = useAuthStore();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when typing
    setErrors({ ...errors, [name]: "" });
    setServerError(""); // Clear server error too
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required!";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format!";
    }
    if (!formData.password) {
      newErrors.password = "Password is required!";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");

    try {
      const response = await logIn(formData);
      saveUser(response); // ✅ Pass the actual user data
      navigate("/dashboard"); // Redirect after login
      localStorage.setItem("token", response.token);
    } catch (error) {
      console.log(error);
      setServerError(error.message || "Login failed! Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <AuthWrapper>
        <Title>Login</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}

          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}

          {serverError && <ErrorMessage>{serverError}</ErrorMessage>}

          <Button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Form>

        {/* <ToggleText onClick={() => navigate("/register")}>
          Don't have an account? Register
        </ToggleText> */}
      </AuthWrapper>
    </Container>
  );
};

export default Login;
