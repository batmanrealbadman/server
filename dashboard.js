// dashboard.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";

// =====================
// SUPABASE CONFIG
// =====================
const SUPABASE_URL = "https://wrmzehgbqjpiiaazmmgh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndybXplaGdicWpwaWlhYXptbWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4Mjg4MjEsImV4cCI6MjA3MDQwNDgyMX0.9p5NdmJoUvRjPmApqZo1C7QZdfO1X9QCD72gD6fpr98";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndybXplaGdicWpwaWlhYXptbWdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDgyODgyMSwiZXhwIjoyMDcwNDA0ODIxfQ.iovak-N--LSdPk3M4LuxUe7yOcWkPvWRDih0nOOwYH0";

// Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const app = express();
app.use(cors({ origin: "https://research-x-i19v.vercel.app", credentials: true }));
app.use(bodyParser.json());

// =====================
// HELPER FUNCTIONS
// =====================

// Fetch user stats
async function getUserStats(userId) {
    const { data: uploads, error: uploadsError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId);

    const { data: downloads, error: downloadsError } = await supabase
        .from("downloads")
        .select("*")
        .eq("user_id", userId);

    const totalUploads = uploads ? uploads.length : 0;
    const totalDownloads = downloads ? downloads.length : 0;
    const earnings = totalDownloads * 0.10; // 10% per download

    return {
        totalUploads,
        totalDownloads,
        earnings
    };
}

// =====================
// ROUTES
// =====================

// User signup/login welcome
app.post("/welcome", async (req, res) => {
    const { email } = req.body;

    const { data: user, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, id")
        .eq("email", email)
        .single();

    if (error || !user) {
        return res.status(404).json({ message: "User not found" });
    }

    const stats = await getUserStats(user.id);

    res.json({
        welcomeMessage: `Welcome, ${user.first_name} ${user.last_name} 👋`,
        stats
    });
});

// Upload a project
app.post("/upload", async (req, res) => {
    const { user_id, title, description } = req.body;

    const { data, error } = await supabase
        .from("projects")
        .insert([{ user_id, title, description }])
        .select();

    if (error) return res.status(500).json(error);

    res.json({ message: "Project uploaded successfully", project: data[0] });
});

// Record a download
app.post("/download", async (req, res) => {
    const { user_id, project_id } = req.body;

    const { error } = await supabase
        .from("downloads")
        .insert([{ user_id, project_id }]);

    if (error) return res.status(500).json(error);

    res.json({ message: "Download recorded" });
});

// Update profile
app.post("/update-profile", async (req, res) => {
    const { user_id, first_name, last_name, profile_pic } = req.body;

    const { error } = await supabase
        .from("profiles")
        .update({ first_name, last_name, profile_pic })
        .eq("id", user_id);

    if (error) return res.status(500).json(error);

    res.json({ message: "Profile updated successfully" });
});

// Logout (frontend will just clear session)
app.post("/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Backend running on port ${PORT}`);
});
