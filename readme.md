# 🌦️ Weather Forecast Web App

A clean, modern, and responsive Weather Forecast web application built with **Vanilla JavaScript (ES6+)**, **HTML5**, and **CSS3**. 

This app allows users to search for live real-time weather forecasts for any city globally or automatically detect their local weather using browser geolocation. Built with zero external dependencies and powered by the free **[Open-Meteo API](https://open-meteo.com/)**.

---

## 🚀 Features

- 🔍 **Global City Search:** Search for live weather data for any city worldwide using Open-Meteo's geocoding service.
- 📍 **Geolocation Support:** Auto-detect your current GPS coordinates with a single click on the location button (`📍`).
- 📅 **5-Day Weather Forecast:** View a multi-day forecast grid with daily high/low temperatures and condition icons.
- 🌡️ **Temperature Unit Toggle:** Instantly convert displayed temperatures between Celsius (**°C**) and Fahrenheit (**°F**).
- 🕒 **Recent Search History:** Saves your 5 most recent searches in browser `localStorage` as clickable quick-access chips.
- ⌨️ **Keyboard Shortcuts:** Press `Enter` inside the search field for fast querying.
- ⏳ **Loading State & UX Polish:** Animated CSS spinner and button state feedback during API requests.
- 📱 **Responsive & Lightweight:** Card-based UI built with CSS Flexbox that works seamlessly on desktop and mobile devices.

---

## 🛠️ Tech Stack & APIs

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Weather Data API:** [Open-Meteo Weather API](https://open-meteo.com/) *(100% Free, No API key required)*
- **Geocoding API:** [Open-Meteo Geocoding API](https://geocoding-api.open-meteo.com/)
- **Browser APIs:** HTML5 Geolocation API, Web Storage API (`localStorage`)

---

## 📂 Project Structure

```text
Weather forecast webapp/
├── index.html       # HTML structure & UI layout
├── style.css        # Custom CSS styling, Flexbox layout, & keyframe animations
└── script.js        # Dynamic DOM manipulation, API fetching, & state management
