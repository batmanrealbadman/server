const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// ✅ CORS: Only allow your Vercel frontend
app.use(cors({
    origin: 'https://research-x-i19v.vercel.app',
    credentials: true
}));

// ✅ Supabase credentials (hardcoded for now)
const SUPABASE_URL = "https://wrmzehgbqjpiiaazmmgh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndybXplaGdicWpwaWlhYXptbWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4Mjg4MjEsImV4cCI6MjA3MDQwNDgyMX0.9p5NdmJoUvRjPmApqZo1C7QZdfO1X9QCD72gD6fpr98";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndybXplaGdicWpwaWlhYXptbWdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDgyODgyMSwiZXhwIjoyMDcwNDA0ODIxfQ.iovak-N--LSdPk3M4LuxUe7yOcWkPvWRDih0nOOwYH0";

// ✅ Admin client (for signup)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ✅ Public client (for login)
const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ✅ SIGNUP ROUTE
app.post('/server/signup', async (req, res) => {
    const {
        firstName, middleName, surname,
        localGovt, institution, institutionCategory,
        department, supervisor, email, phone, password
    } = req.body;

    if (!email || !password || !firstName || !surname) {
        return res.status(400).json({ success: false, error: 'Required fields missing' });
    }

    try {
        const { error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                firstName,
                middleName,
                surname,
                localGovt,
                institution,
                institutionCategory,
                department,
                supervisor,
                phone
            }
        });

        if (error) return res.status(400).json({ success: false, error: error.message });

        return res.json({ success: true, message: 'Signup successful! Please log in.' });
    } catch (err) {
        console.error("Signup error:", err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

// ✅ LOGIN ROUTE
app.post('/server/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Missing email or password' });
    }

    try {
        const { data, error } = await supabasePublic.auth.signInWithPassword({
            email,
            password
        });

        if (error) return res.status(401).json({ success: false, error: error.message });

        return res.json({
            success: true,
            token: data.session.access_token,
            user: data.user
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

// ✅ Health check route (optional)
app.get('/', (req, res) => {
    res.send('Backend is running 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
