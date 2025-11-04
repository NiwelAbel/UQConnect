const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "uploads/";
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage: storage });

// Data storage paths
const DATA_DIR = "data";
const USERS_FILE = path.join(DATA_DIR, "users.json");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");
const CALENDARS_FILE = path.join(DATA_DIR, "calendars.json");

// Initialize data directory and files
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize JSON files if they don't exist
const initializeFile = (filePath, defaultData) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
};

initializeFile(USERS_FILE, []);
initializeFile(EVENTS_FILE, [
    {
        id: "1",
        title: "UQ Engineering Career Fair",
        description:
            "Meet with top engineering companies and explore career opportunities",
        date: "2025-11-15",
        time: "10:00",
        duration: 180,
        location: "UQ Centre",
        category: "Career",
        type: "In-person",
        capacity: 200,
        registered: 45,
    },
    {
        id: "2",
        title: "Python Programming Workshop",
        description: "Learn advanced Python concepts and best practices",
        date: "2025-11-18",
        time: "14:00",
        duration: 120,
        location: "Computer Science Building",
        category: "Workshop",
        type: "In-person",
        capacity: 30,
        registered: 12,
    },
    {
        id: "3",
        title: "UQ Student Society Networking",
        description: "Connect with fellow students and join various societies",
        date: "2025-11-20",
        time: "18:00",
        duration: 150,
        location: "Student Union Building",
        category: "Social",
        type: "In-person",
        capacity: 100,
        registered: 67,
    },
    {
        id: "4",
        title: "Research Methods Seminar",
        description: "Learn about research methodologies and academic writing",
        date: "2025-11-22",
        time: "16:00",
        duration: 90,
        location: "Library Seminar Room",
        category: "Academic",
        type: "Hybrid",
        capacity: 50,
        registered: 23,
    },
    {
        id: "5",
        title: "Mental Health Awareness Week",
        description: "Workshops and activities focused on student wellbeing",
        date: "2025-11-25",
        time: "09:00",
        duration: 480,
        location: "Various Locations",
        category: "Wellness",
        type: "In-person",
        capacity: 500,
        registered: 156,
    },
]);
initializeFile(CALENDARS_FILE, []);

// JWT Secret (in production, use environment variable)
const JWT_SECRET = "uq-connect-secret-key";

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" });
        }
        req.user = user;
        next();
    });
};

// Routes

// User registration
app.post("/api/auth/register", async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));

        // Check if user already exists
        if (users.find((user) => user.email === email)) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            id: uuidv4(),
            email,
            password: hashedPassword,
            name,
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(201).json({
            message: "User created successfully",
            token,
            user: { id: newUser.id, email: newUser.email, name: newUser.name },
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// User login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email and password are required" });
        }

        const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
        const user = users.find((u) => u.email === email);

        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            message: "Login successful",
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Get all events
app.get("/api/events", (req, res) => {
    try {
        const events = JSON.parse(fs.readFileSync(EVENTS_FILE, "utf8"));
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Upload calendar file
app.post(
    "/api/calendar/upload",
    authenticateToken,
    upload.single("calendar"),
    (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }

            const filePath = req.file.path;
            console.log("Uploaded file path:", filePath);
            console.log("File size:", req.file.size);

            const fileContent = fs.readFileSync(filePath, "utf8");
            console.log("File content length:", fileContent.length);

            // Enhanced ICS parser
            const events = parseICS(fileContent);
            console.log("Parsed events:", events);

            // Save calendar data
            const calendars = JSON.parse(
                fs.readFileSync(CALENDARS_FILE, "utf8")
            );
            const userCalendar = calendars.find(
                (cal) => cal.userId === req.user.userId
            );

            if (userCalendar) {
                userCalendar.events = events;
                userCalendar.lastUpdated = new Date().toISOString();
            } else {
                calendars.push({
                    userId: req.user.userId,
                    events: events,
                    lastUpdated: new Date().toISOString(),
                });
            }

            fs.writeFileSync(
                CALENDARS_FILE,
                JSON.stringify(calendars, null, 2)
            );
            console.log("Calendar data saved to file");

            // Keep file for debugging (comment out for production)
            // fs.unlinkSync(filePath);

            res.json({
                message: "Calendar uploaded successfully",
                events: events,
                eventsCount: events.length,
            });
        } catch (error) {
            console.error("Upload error:", error);
            res.status(500).json({
                error: "Failed to process calendar file: " + error.message,
            });
        }
    }
);

// Import external calendar from URL (server-side fetch like Google/Apple)
app.post("/api/calendar/import", authenticateToken, async (req, res) => {
    try {
        const { url } = req.body;

        if (!url || !/^https?:\/\//i.test(url)) {
            return res.status(400).json({ error: "Please provide a valid calendar URL" });
        }

        console.log(`Importing external calendar for user ${req.user.userId}: ${url}`);

        const response = await fetch(url, {
            headers: {
                "User-Agent": "UQConnect/1.0 (+https://uqconnect.local)",
                Accept: "text/calendar, text/plain, */*",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch calendar (HTTP ${response.status})`);
        }

        const icsText = await response.text();

        if (!icsText.includes("BEGIN:VCALENDAR")) {
            return res.status(400).json({
                error: "The URL did not return a valid .ics calendar file",
            });
        }

        const eventsFromICS = parseICS(icsText);

        if (!eventsFromICS.length) {
            return res.status(400).json({
                error: "No events found in the calendar file",
            });
        }

        const calendars = JSON.parse(fs.readFileSync(CALENDARS_FILE, "utf8"));
        let userCalendar = calendars.find((c) => c.userId === req.user.userId);

        if (!userCalendar) {
            userCalendar = {
                userId: req.user.userId,
                events: [],
                lastUpdated: new Date().toISOString(),
            };
            calendars.push(userCalendar);
        }

        let addedCount = 0;
        eventsFromICS.forEach((newEvent) => {
            const isDuplicate = userCalendar.events.some(
                (existing) =>
                    existing.title === newEvent.title &&
                    existing.start === newEvent.start
            );

            if (!isDuplicate) {
                userCalendar.events.push(newEvent);
                addedCount++;
            }
        });

        userCalendar.lastUpdated = new Date().toISOString();

        fs.writeFileSync(
            CALENDARS_FILE,
            JSON.stringify(calendars, null, 2)
        );

        res.json({
            success: true,
            eventsCount: addedCount,
            totalEvents: eventsFromICS.length,
            message:
                addedCount === eventsFromICS.length
                    ? "Calendar imported successfully"
                    : `Imported ${addedCount} new events (${eventsFromICS.length - addedCount} duplicates skipped)`,
        });
    } catch (error) {
        console.error("Import calendar error:", error);
        res.status(500).json({
            error: "Failed to import calendar: " + error.message,
        });
    }
});

// Get user calendar
app.get("/api/calendar", authenticateToken, (req, res) => {
    try {
        const calendars = JSON.parse(fs.readFileSync(CALENDARS_FILE, "utf8"));
        const userCalendar = calendars.find(
            (cal) => cal.userId === req.user.userId
        );

        if (!userCalendar) {
            return res.json({ events: [] });
        }

        res.json(userCalendar);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Get recommendations
app.get("/api/recommendations", authenticateToken, (req, res) => {
    try {
        console.log("=== RECOMMENDATIONS API CALLED ===");
        const calendars = JSON.parse(fs.readFileSync(CALENDARS_FILE, "utf8"));
        const events = JSON.parse(fs.readFileSync(EVENTS_FILE, "utf8"));
        const userCalendar = calendars.find(
            (cal) => cal.userId === req.user.userId
        );

        console.log("User ID:", req.user.userId);
        console.log("Found user calendar:", !!userCalendar);
        console.log(
            "User calendar events count:",
            userCalendar ? userCalendar.events.length : 0
        );
        console.log("Available events count:", events.length);

        if (!userCalendar || !userCalendar.events.length) {
            console.log(
                "No user calendar or events found, returning empty recommendations"
            );
            return res.json({ recommendations: [] });
        }

        const recommendations = generateRecommendations(
            userCalendar.events,
            events
        );
        console.log("Final recommendations count:", recommendations.length);
        res.json({ recommendations });
    } catch (error) {
        console.error("Error in recommendations API:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Accept recommendation
app.post(
    "/api/recommendations/:eventId/accept",
    authenticateToken,
    (req, res) => {
        try {
            const { eventId } = req.params;
            const events = JSON.parse(fs.readFileSync(EVENTS_FILE, "utf8"));
            const event = events.find((e) => e.id === eventId);

            if (!event) {
                return res.status(404).json({ error: "Event not found" });
            }

            // Add event to user's calendar
            const calendars = JSON.parse(
                fs.readFileSync(CALENDARS_FILE, "utf8")
            );
            const userCalendar = calendars.find(
                (cal) => cal.userId === req.user.userId
            );

            if (!userCalendar) {
                return res
                    .status(404)
                    .json({ error: "User calendar not found" });
            }

            // Check if event already exists in calendar
            const existingEvent = userCalendar.events.find(
                (e) => e.id === eventId
            );
            if (existingEvent) {
                return res
                    .status(400)
                    .json({ error: "Event already in calendar" });
            }

            // Add event to calendar
            const calendarEvent = {
                id: eventId,
                title: event.title,
                description: event.description,
                start: `${event.date}T${event.time}:00`,
                end: moment(`${event.date}T${event.time}:00`)
                    .add(event.duration, "minutes")
                    .format(),
                location: event.location,
                category: event.category,
                type: event.type,
                source: "recommendation",
            };

            userCalendar.events.push(calendarEvent);
            fs.writeFileSync(
                CALENDARS_FILE,
                JSON.stringify(calendars, null, 2)
            );

            res.json({ message: "Event added to calendar successfully" });
        } catch (error) {
            res.status(500).json({ error: "Server error" });
        }
    }
);

// Enhanced ICS parser function
function parseICS(content) {
    console.log("Parsing ICS content:", content.substring(0, 500) + "...");

    const events = [];
    const lines = content.split("\n");
    let currentEvent = {};
    let inEvent = false;
    let currentField = "";

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        // Handle line folding (ICS standard)
        while (i + 1 < lines.length && lines[i + 1].startsWith(" ")) {
            line += lines[i + 1].substring(1);
            i++;
        }

        if (line === "BEGIN:VEVENT") {
            inEvent = true;
            currentEvent = {};
            console.log("Found VEVENT start");
        } else if (line === "END:VEVENT") {
            if (inEvent) {
                console.log("Processing event:", currentEvent);
                if (currentEvent.start && currentEvent.title) {
                    // Ensure required fields
                    if (!currentEvent.end) {
                        // If no end time, assume 1 hour duration
                        const start = new Date(currentEvent.start);
                        currentEvent.end = new Date(
                            start.getTime() + 60 * 60 * 1000
                        ).toISOString();
                    }
                    if (!currentEvent.location) {
                        currentEvent.location = "Location not specified";
                    }
                    if (!currentEvent.description) {
                        currentEvent.description = currentEvent.title;
                    }

                    events.push(currentEvent);
                    console.log("Added event:", currentEvent.title);
                } else {
                    console.log("Skipping incomplete event:", currentEvent);
                }
            }
            inEvent = false;
        } else if (inEvent) {
            // Parse different ICS fields
            if (line.startsWith("SUMMARY:")) {
                currentEvent.title = line
                    .substring(8)
                    .replace(/\\,/g, ",")
                    .replace(/\\;/g, ";")
                    .replace(/\\n/g, "\n");
            } else if (line.startsWith("DTSTART")) {
                const dateStr = extractDateFromLine(line);
                currentEvent.start = parseICSDate(dateStr);
            } else if (line.startsWith("DTEND")) {
                const dateStr = extractDateFromLine(line);
                currentEvent.end = parseICSDate(dateStr);
            } else if (line.startsWith("LOCATION:")) {
                currentEvent.location = line
                    .substring(9)
                    .replace(/\\,/g, ",")
                    .replace(/\\;/g, ";")
                    .replace(/\\n/g, "\n");
            } else if (line.startsWith("DESCRIPTION:")) {
                currentEvent.description = line
                    .substring(12)
                    .replace(/\\,/g, ",")
                    .replace(/\\;/g, ";")
                    .replace(/\\n/g, "\n");
            } else if (line.startsWith("UID:")) {
                currentEvent.uid = line.substring(4);
            }
        }
    }

    console.log(`Parsed ${events.length} events from ICS file`);
    return events;
}

// Helper function to extract date from ICS line
function extractDateFromLine(line) {
    // Handle different date formats: DTSTART:20250115T090000Z or DTSTART;VALUE=DATE:20250115
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) return "";

    let dateStr = line.substring(colonIndex + 1);

    // Remove timezone info for now
    if (dateStr.endsWith("Z")) {
        dateStr = dateStr.substring(0, dateStr.length - 1);
    }

    return dateStr;
}

function parseICSDate(dateStr) {
    console.log("Parsing date:", dateStr);

    // Handle different ICS date formats
    if (dateStr.length === 8) {
        // YYYYMMDD format
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const result = `${year}-${month}-${day}T00:00:00`;
        console.log("Parsed date (8 chars):", result);
        return result;
    } else if (dateStr.length === 15) {
        // YYYYMMDDTHHMMSS format
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const hour = dateStr.substring(9, 11);
        const minute = dateStr.substring(11, 13);
        const second = dateStr.substring(13, 15);
        const result = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
        console.log("Parsed date (15 chars):", result);
        return result;
    } else if (dateStr.length === 13) {
        // YYYYMMDDTHHMM format (no seconds)
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const hour = dateStr.substring(9, 11);
        const minute = dateStr.substring(11, 13);
        const result = `${year}-${month}-${day}T${hour}:${minute}:00`;
        console.log("Parsed date (13 chars):", result);
        return result;
    } else if (dateStr.includes("T")) {
        // Try to parse ISO-like format
        try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                const result = date.toISOString();
                console.log("Parsed date (ISO):", result);
                return result;
            }
        } catch (e) {
            console.log("Failed to parse as ISO date:", dateStr);
        }
    }

    console.log("Using original date string:", dateStr);
    return dateStr;
}

// Recommendation engine (prioritizes time-based matches)
function generateRecommendations(calendarEvents, availableEvents) {
    console.log("Generating recommendations with prioritization...");

    const recommendations = [];
    const addedEventIds = new Set(); // To prevent duplicate recommendations
    const freeSlots = findFreeSlots(calendarEvents); // This will now be accurate
    const MAX_RECOMMENDATIONS = 5;

    // --- STEP 1: Prioritize Time-Slot Matches First ---
    if (freeSlots.length > 0) {
        console.log(`Checking ${freeSlots.length} free slots for matches...`);

        for (const slot of freeSlots) {
            const slotStart = moment(slot.start);
            const slotEnd = moment(slot.end);
            const slotDuration = slot.duration;

            for (const event of availableEvents) {
                if (addedEventIds.has(event.id)) continue; // Skip if already added

                const eventStart = moment(`${event.date}T${event.time}:00`);
                const eventEnd = moment(eventStart).add(
                    event.duration,
                    "minutes"
                );

                // Check if event fits perfectly in free slot
                if (
                    eventStart.isSameOrAfter(slotStart) &&
                    eventEnd.isSameOrBefore(slotEnd) &&
                    event.duration <= slotDuration
                ) {
                    const alreadyInCalendar = calendarEvents.some(
                        (calEvent) =>
                            calEvent.title === event.title &&
                            moment(calEvent.start).isSame(eventStart)
                    );

                    if (!alreadyInCalendar) {
                        console.log(
                            `Found TIME MATCH: ${event.title} in slot ${slot.start}`
                        );
                        let confidence = calculateConfidence(slot, event);

                        // Give a huge boost to time-based matches
                        recommendations.push({
                            ...event,
                            recommendedFor: slot,
                            confidence: confidence + 1.0, // Add 1.0 to ensure it's prioritized
                        });
                        addedEventIds.add(event.id);
                    }
                }
            }
        }
    }

    // --- STEP 2: Fill remaining spots with General Recommendations ---
    if (recommendations.length < MAX_RECOMMENDATIONS) {
        console.log(
            "Finding general recommendations to fill remaining spots..."
        );
        const coursePatterns = analyzeCoursePatterns(calendarEvents);

        for (const event of availableEvents) {
            if (recommendations.length >= MAX_RECOMMENDATIONS) break;
            if (addedEventIds.has(event.id)) continue; // Skip if added by time-slot logic

            const confidence = calculateGeneralConfidence(
                coursePatterns,
                event
            );

            if (confidence > 0.3) {
                console.log(`Found GENERAL match: ${event.title}`);
                recommendations.push({
                    ...event,
                    recommendedFor: {
                        // Create a generic slot
                        start: event.date + "T" + event.time + ":00",
                        end: moment(`${event.date}T${event.time}:00`)
                            .add(event.duration, "minutes")
                            .format(),
                        duration: event.duration,
                    },
                    confidence: confidence, // Use its normal (lower) score
                });
                addedEventIds.add(event.id);
            }
        }
    }

    console.log(`Generated ${recommendations.length} total recommendations.`);

    // Sort by new confidence scores and return top 5
    return recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, MAX_RECOMMENDATIONS);
}

// NEW, smarter function to find all free slots
function findFreeSlots(events) {
    console.log("Using new free slot finder...");
    const freeSlots = [];
    const sortedEvents = events.sort(
        (a, b) => new Date(a.start) - new Date(b.start)
    );
    const today = moment().startOf("day");
    const daysToScan = 7; // Scan the next 7 days

    // Define the hours you want to be "available"
    const DAY_START_HOUR = 8; // 8:00 AM
    const DAY_END_HOUR = 21; // 9:00 PM
    const MIN_GAP_MINUTES = 30; // Minimum duration for a slot

    for (let i = 0; i < daysToScan; i++) {
        const currentDay = moment(today).add(i, "days");
        const dayStart = moment(currentDay).hour(DAY_START_HOUR);
        const dayEnd = moment(currentDay).hour(DAY_END_HOUR);

        // Get all events for this specific day
        const eventsOnThisDay = sortedEvents.filter((e) =>
            moment(e.start).isSame(currentDay, "day")
        );

        // Start tracking from the beginning of the "available" day
        let lastEventEnd = dayStart;

        if (eventsOnThisDay.length === 0) {
            // The whole day is free
            console.log(
                `Found full free day on: ${currentDay.format("YYYY-MM-DD")}`
            );
            freeSlots.push({
                start: dayStart.format(),
                end: dayEnd.format(),
                duration: dayEnd.diff(dayStart, "minutes"),
            });
            continue; // Go to the next day
        }

        // Loop through the day's events to find gaps
        for (const event of eventsOnThisDay) {
            const eventStart = moment(event.start);

            // Check for a gap between the last event and this one
            const gapDuration = eventStart.diff(lastEventEnd, "minutes");

            if (gapDuration >= MIN_GAP_MINUTES) {
                console.log(
                    `Found free slot: ${lastEventEnd.format()} to ${eventStart.format()}`
                );
                freeSlots.push({
                    start: lastEventEnd.format(),
                    end: eventStart.format(),
                    duration: gapDuration,
                });
            }

            // Update the end time
            const eventEnd = moment(event.end);
            if (eventEnd.isAfter(lastEventEnd)) {
                lastEventEnd = eventEnd;
            }
        }

        // Check for a final gap after the last event of the day
        const finalGapDuration = dayEnd.diff(lastEventEnd, "minutes");
        if (finalGapDuration >= MIN_GAP_MINUTES) {
            console.log(
                `Found free slot: ${lastEventEnd.format()} to ${dayEnd.format()}`
            );
            freeSlots.push({
                start: lastEventEnd.format(),
                end: dayEnd.format(),
                duration: finalGapDuration,
            });
        }
    }

    console.log(`Found ${freeSlots.length} total free slots.`);
    return freeSlots;
}

function calculateConfidence(slot, event) {
    let confidence = 0.5; // Base confidence

    // Prefer events that fit well in the slot
    const slotDuration = moment(slot.end).diff(moment(slot.start), "minutes");
    const fitRatio = event.duration / slotDuration;

    if (fitRatio > 0.8) confidence += 0.2;
    else if (fitRatio > 0.6) confidence += 0.1;

    // Prefer events with higher registration rates
    const registrationRate = event.registered / event.capacity;
    confidence += registrationRate * 0.3;

    return Math.min(confidence, 1.0);
}

function analyzeCoursePatterns(calendarEvents) {
    const patterns = {
        subjects: new Set(),
        locations: new Set(),
        timeSlots: new Set(),
        days: new Set(),
    };

    calendarEvents.forEach((event) => {
        // Extract subject from course title
        const titleParts = event.title.split(",");
        if (titleParts.length > 0) {
            const subject = titleParts[0].trim();
            patterns.subjects.add(subject);
        }

        // Extract location building
        if (event.location) {
            const locationParts = event.location.split(" - ");
            if (locationParts.length > 0) {
                patterns.locations.add(locationParts[0]);
            }
        }

        // Extract time patterns
        const startTime = moment(event.start);
        patterns.timeSlots.add(startTime.format("HH:mm"));
        patterns.days.add(startTime.format("dddd"));
    });

    return patterns;
}

function calculateGeneralConfidence(patterns, event) {
    let confidence = 0.4; // Base confidence for general recommendations

    // Boost confidence for academic events
    if (event.category === "Academic") confidence += 0.2;
    if (event.category === "Career") confidence += 0.15;
    if (event.category === "Workshop") confidence += 0.1;

    // Check if event location matches user's frequent locations
    if (event.location && patterns.locations.size > 0) {
        const eventLocation = event.location.split(" ")[0]; // Get building code
        if (patterns.locations.has(eventLocation)) {
            confidence += 0.1;
        }
    }

    // Boost for events that might interest engineering students
    if (
        event.title.toLowerCase().includes("programming") ||
        event.title.toLowerCase().includes("python") ||
        event.title.toLowerCase().includes("engineering")
    ) {
        confidence += 0.15;
    }

    return Math.min(confidence, 1.0);
}

// Serve static files from public directory - catch all routes
app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith("/api/")) {
        return next();
    }
    // Serve index.html for all other routes
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`UQ Connect server running on port ${PORT}`);
});
