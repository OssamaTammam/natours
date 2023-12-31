/*eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

exports.login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/login",
      withCredentials: true,
      data: {
        email,
        password,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "Logged in");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "/api/v1/users/logout",
    });

    if (res.data.status === "success") {
      // true is very important for a fresh page not from cache
      location.reload(true);
    }
  } catch (err) {
    showAlert("error", "Error logging out! Try again.");
  }
};

export const signup = async (data) => {
  try {
    const res = await axios({
      method: "POST",
      withCredentials: true,
      url: "/api/v1/users/signup",
      data,
    });

    if (res.data.status === "success") {
      showAlert(
        "success",
        "Signed up!\nPlease verify your email before logging in.",
      );
      window.setTimeout(() => {
        location.assign("/");
      }, 3000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
