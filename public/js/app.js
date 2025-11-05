// UQ Connect - Shared JavaScript Functions

// API Base URL
const API_BASE_URL = "/api";

// Global State
let currentUser = null;
let authToken = null;

// Initialize Application
document.addEventListener("DOMContentLoaded", function () {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    // Check for saved token
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("currentUser");

    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        updateUserInterface();
    }

    // Setup navigation click events
    setupNavigation();

    // Setup form submit events
    setupFormHandlers();

    // Setup dropdown close events
    setupDropdownCloseHandler();

    // Setup accordions
    setupAccordions();
}

// Setup Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll(".nav a");
    navLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const href = this.getAttribute("href");
            if (href && href !== "#") {
                navigateToPage(href);
            }
        });
    });
}

// Page Navigation
function navigateToPage(page) {
    // Direct page navigation
    window.location.href = page;
}

// Load Page Content
function loadPageContent(page) {
    const contentContainer = document.getElementById("main-content");
    if (!contentContainer) return;

    contentContainer.innerHTML = '<div class="loading">Loading...</div>';

    switch (page) {
        case "login.html":
            loadLoginPage();
            break;
        case "dashboard.html":
            loadDashboardPage();
            break;
        case "events.html":
            loadEventsPage();
            break;
        case "calendar.html":
            loadCalendarPage();
            break;
        case "recommendations.html":
            loadRecommendationsPage();
            break;
        default:
            loadDashboardPage();
    }
}

// API Request Function
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    };

    // Add authentication token
    if (authToken) {
        config.headers["Authorization"] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(url, config);

        // Check if response is empty
        const text = await response.text();
        console.log("API response text:", text);

        if (!text) {
            throw new Error("Server returned empty response");
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            console.error("Response content:", text);
            throw new Error("Server returned invalid JSON response");
        }

        if (!response.ok) {
            throw new Error(
                data.error || `Request failed (${response.status})`
            );
        }

        return data;
    } catch (error) {
        console.error("API request error:", error);
        showAlert("error", error.message);
        throw error;
    }
}

// Show Alert Message
function showAlert(type, message) {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    const container = document.querySelector(".main-content") || document.body;
    container.insertBefore(alertDiv, container.firstChild);

    // Auto remove after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Update User Interface
function updateUserInterface() {
    // Update user avatar and welcome message
    const userAvatar = document.getElementById("userAvatar");
    const userWelcome = document.getElementById("userWelcome");

    if (userAvatar && currentUser) {
        userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    }

    if (userWelcome && currentUser) {
        userWelcome.textContent = `Welcome, ${currentUser.name}`;
    }

    // Update navigation display
    const nav = document.querySelector(".nav");
    if (nav) {
        if (currentUser) {
            nav.innerHTML = `
                <a href="dashboard.html">Dashboard</a>
                <a href="events.html">Events</a>
                <a href="calendar.html">Calendar</a>
                <a href="recommendations.html">Recommendations</a>
            `;
        } else {
            nav.innerHTML = `
                <a href="login.html">Login</a>
                <a href="register.html">Register</a>
            `;
        }
    }
}

// Toggle user dropdown menu
function toggleUserDropdown() {
    const dropdown = document.getElementById("userDropdown");
    if (dropdown) {
        dropdown.classList.toggle("show");
    }
}

// Close dropdown when clicking outside
function setupDropdownCloseHandler() {
    document.addEventListener("click", function (event) {
        const userInfo = document.querySelector(".user-info");
        const dropdown = document.getElementById("userDropdown");

        if (userInfo && dropdown && !userInfo.contains(event.target)) {
            dropdown.classList.remove("show");
        }
    });
}

// Profile function (placeholder)
function showProfile() {
    showAlert("info", "Profile feature coming soon!");
    const dropdown = document.getElementById("userDropdown");
    if (dropdown) {
        dropdown.classList.remove("show");
    }
}

// Settings function (placeholder)
function showSettings() {
    showAlert("info", "Settings feature coming soon!");
    const dropdown = document.getElementById("userDropdown");
    if (dropdown) {
        dropdown.classList.remove("show");
    }
}

// Login Function
async function login(email, password) {
    try {
        // Show loading state
        const submitBtn = document.querySelector(
            '#loginForm button[type="submit"]'
        );
        const btnText = submitBtn?.querySelector(".btn-text");
        const btnLoader = submitBtn?.querySelector(".btn-loader");

        if (btnText && btnLoader) {
            btnText.style.display = "none";
            btnLoader.style.display = "inline";
            submitBtn.disabled = true;
        }

        const response = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        authToken = response.token;
        currentUser = response.user;

        // Save to local storage
        localStorage.setItem("authToken", authToken);
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        showAlert("success", "Login successful!");
        updateUserInterface();

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);
    } catch (error) {
        showAlert("error", "Login failed: " + error.message);
    } finally {
        // Hide loading state
        const submitBtn = document.querySelector(
            '#loginForm button[type="submit"]'
        );
        const btnText = submitBtn?.querySelector(".btn-text");
        const btnLoader = submitBtn?.querySelector(".btn-loader");

        if (btnText && btnLoader) {
            btnText.style.display = "inline";
            btnLoader.style.display = "none";
            submitBtn.disabled = false;
        }
    }
}

// Register Function
async function register(email, password, name) {
    try {
        // Show loading state
        const submitBtn = document.querySelector(
            '#registerForm button[type="submit"]'
        );
        const btnText = submitBtn?.querySelector(".btn-text");
        const btnLoader = submitBtn?.querySelector(".btn-loader");

        if (btnText && btnLoader) {
            btnText.style.display = "none";
            btnLoader.style.display = "inline";
            submitBtn.disabled = true;
        }

        console.log("Starting user registration:", { email, name });

        const response = await apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, password, name }),
        });

        console.log("Registration response:", response);

        authToken = response.token;
        currentUser = response.user;

        // Save to local storage
        localStorage.setItem("authToken", authToken);
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        showAlert("success", "Registration successful! Welcome to UQ Connect!");
        updateUserInterface();

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);
    } catch (error) {
        console.error("Registration failed:", error);
        showAlert("error", "Registration failed: " + error.message);
    } finally {
        // Hide loading state
        const submitBtn = document.querySelector(
            '#registerForm button[type="submit"]'
        );
        const btnText = submitBtn?.querySelector(".btn-text");
        const btnLoader = submitBtn?.querySelector(".btn-loader");

        if (btnText && btnLoader) {
            btnText.style.display = "inline";
            btnLoader.style.display = "none";
            submitBtn.disabled = false;
        }
    }
}

// Logout Function
function logout() {
    authToken = null;
    currentUser = null;

    // Clear local storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");

    updateUserInterface();
    showAlert("info", "Logged out successfully");

    // Redirect to login page
    setTimeout(() => {
        window.location.href = "login.html";
    }, 1000);
}

// Get Events List
async function getEvents() {
    try {
        const response = await apiRequest("/events");
        return response;
    } catch (error) {
        console.error("Failed to get events:", error);
        return [];
    }
}

// Get User Calendar
async function getUserCalendar() {
    try {
        const response = await apiRequest("/calendar");
        return response.events || [];
    } catch (error) {
        console.error("Failed to get calendar:", error);
        return [];
    }
}
// Import External Calendar (fetch from pasted URL)
async function importExternalCalendar() {
    const url = document.getElementById("externalCalendarUrl").value.trim();
    const status = document.getElementById("importStatus");

    if (!url) {
        showAlert("error", "Please paste a calendar URL first.");
        return;
    }

    if (!currentUser) {
        showAlert("error", "Please log in first.");
        return;
    }

    status.textContent = "Importing calendar...";
    status.style.color = "#666";

    try {
        const response = await fetch(`${API_BASE_URL}/calendar/import`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ url }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to import calendar");
        }

        showAlert(
            "success",
            `Imported ${data.eventsCount} events successfully!`
        );
        status.textContent =
            "Import completed and your calendar has been updated.";
        status.style.color = "#28a745";

        // clear input
        document.getElementById("externalCalendarUrl").value = "";

        // reload calendar data after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } catch (err) {
        console.error("Import error:", err);
        showAlert("error", err.message);
        status.textContent =
            "Import failed. Please check your URL or try again.";
        status.style.color = "#dc3545";
    }
}

// Get Recommendations
async function getRecommendations() {
    try {
        const response = await apiRequest("/recommendations");
        return response.recommendations || [];
    } catch (error) {
        console.error("Failed to get recommendations:", error);
        return [];
    }
}

// Accept Recommendation
async function acceptRecommendation(eventId) {
    try {
        await apiRequest(`/recommendations/${eventId}/accept`, {
            method: "POST",
        });
        showAlert("success", "Event added to calendar!");
        // Refresh recommendations page
        loadRecommendationsPage();
    } catch (error) {
        showAlert("error", "Failed to add: " + error.message);
    }
}

// Upload Calendar File
async function uploadCalendar(file) {
    try {
        const formData = new FormData();
        formData.append("calendar", file);

        const response = await fetch(`${API_BASE_URL}/calendar/upload`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Upload failed");
        }

        showAlert(
            "success",
            `Calendar uploaded successfully! Parsed ${data.eventsCount} events`
        );
        return data;
    } catch (error) {
        showAlert("error", "Upload failed: " + error.message);
        throw error;
    }
}

// Setup Form Handlers
function setupFormHandlers() {
    // Login form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            login(email, password);
        });
    }

    // Register form
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = document.getElementById("regEmail").value;
            const password = document.getElementById("regPassword").value;
            const name = document.getElementById("name").value;
            register(email, password, name);
        });
    }

    // File upload
    const fileInput = document.getElementById("calendarFile");
    if (fileInput) {
        fileInput.addEventListener("change", function (e) {
            const file = e.target.files[0];
            if (file) {
                uploadCalendar(file);
            }
        });
    }
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// Format Time
function formatTime(timeString) {
    return timeString.substring(0, 5); // HH:MM
}

// Format Duration
function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours}h${mins > 0 ? mins + "m" : ""}`;
    }
    return `${mins}m`;
}

// Check if user is logged in
function requireAuth() {
    if (!currentUser) {
        showAlert("error", "Please login first");
        window.location.href = "login.html";
        return false;
    }
    return true;
}

// Page load functions (to be defined in respective page files)
function loadLoginPage() {
    // To be defined in login.html
}

function loadDashboardPage() {
    // To be defined in dashboard.html
}

// Custom file upload functions
function updateFileDisplay() {
    const fileInput = document.getElementById("calendarFile");
    const fileInfo = document.getElementById("selectedFileInfo");
    const fileName = fileInfo.querySelector(".file-name");

    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        fileName.textContent = file.name;
        fileInfo.style.display = "flex";
    } else {
        fileInfo.style.display = "none";
    }
}

function clearFileSelection() {
    const fileInput = document.getElementById("calendarFile");
    const fileInfo = document.getElementById("selectedFileInfo");

    fileInput.value = "";
    fileInfo.style.display = "none";
}

function loadEventsPage() {
    // To be defined in events.html
}

function loadCalendarPage() {
    // To be defined in calendar.html
}

function loadRecommendationsPage() {
    // To be defined in recommendations.html
}

// Accordion Helpers
function setupAccordions() {
    const accordions = document.querySelectorAll(".accordion");
    accordions.forEach((accordion) => {
        accordion.querySelectorAll(".accordion-panel").forEach((panel) => {
            const item = panel.closest(".accordion-item");
            const trigger = item ? item.querySelector(".accordion-trigger") : null;
            const arrow = trigger ? trigger.querySelector(".accordion-arrow") : null;
            const isOpen = panel.classList.contains("open") || item?.classList.contains("open");

            panel.style.maxHeight = isOpen ? panel.scrollHeight + "px" : "0px";

            if (isOpen) {
                panel.classList.add("open");
                item?.classList.add("open");
                trigger?.setAttribute("aria-expanded", "true");
                if (arrow) arrow.textContent = "▴";
            } else {
                panel.classList.remove("open");
                item?.classList.remove("open");
                trigger?.setAttribute("aria-expanded", "false");
                if (arrow) arrow.textContent = "▾";
            }
        });
    });
}

function toggleAccordion(trigger) {
    const item = trigger.closest(".accordion-item");
    if (!item) return;

    const panel = item.querySelector(".accordion-panel");
    if (!panel) return;

    const accordion = item.closest(".accordion");
    const allowMultiple = accordion?.dataset.accordion === "multiple";
    const arrow = trigger.querySelector(".accordion-arrow");
    const isOpen = panel.classList.contains("open");

    if (!allowMultiple && accordion) {
        accordion.querySelectorAll(".accordion-panel.open").forEach((otherPanel) => {
            if (otherPanel === panel) return;
            otherPanel.classList.remove("open");
            otherPanel.style.maxHeight = "0px";
            const otherItem = otherPanel.closest(".accordion-item");
            otherItem?.classList.remove("open");
            const otherTrigger = otherItem?.querySelector(".accordion-trigger");
            if (otherTrigger) {
                otherTrigger.setAttribute("aria-expanded", "false");
                const otherArrow = otherTrigger.querySelector(".accordion-arrow");
                if (otherArrow) otherArrow.textContent = "▾";
            }
        });
    }

    if (!isOpen) {
        panel.classList.add("open");
        item.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
        trigger.setAttribute("aria-expanded", "true");
        if (arrow) arrow.textContent = "▴";
    } else {
        panel.classList.remove("open");
        item.classList.remove("open");
        panel.style.maxHeight = "0px";
        trigger.setAttribute("aria-expanded", "false");
        if (arrow) arrow.textContent = "▾";
    }
}
