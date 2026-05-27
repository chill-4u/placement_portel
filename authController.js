const { supabase } = require('../config/db');
const { createClient } = require('@supabase/supabase-js');

exports.register = async (req, res, next) => {
    try {
        const { email, password, role, name, roll_no, section, designation, sections } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Email, password, and role are required' });
        }

        // 1. Register with Supabase Auth - pass metadata so our DB trigger can handle profile creation
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role,
                    name: name || 'Unknown',
                    roll_no: roll_no || 'Pending',
                    section: section || 'Pending',
                    sections: sections || []
                }
            }
        });

        if (authError) {
            return res.status(400).json({ error: authError.message });
        }

        const user = authData.user;
        
        if (!user) {
            return res.status(400).json({ error: 'Registration failed' });
        }

        if (!authData.session) {
            console.log(`[Register] User ${email} registered but needs email confirmation.`);
            return res.status(201).json({ 
                message: 'Registration successful! Please check your email to confirm your account before logging in.',
                needsConfirmation: true,
                user: { id: user.id, email: user.email, role } 
            });
        }

        res.status(201).json({ message: 'User registered successfully', user: { id: user.id, email: user.email, role } });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('[Login Error]', error.message, error.status);
            return res.status(401).json({ error: error.message });
        }

        // Fetch custom role
        let role = 'unknown';
        let section = null;
        let sections = [];
        let pId = null;

        const { data: student, error: studentError } = await supabase.from('students').select('id, section').eq('user_id', data.user.id).single();
        if (student) {
            role = 'student';
            section = student.section;
            pId = student.id;
        } else {
            const { data: faculty, error: facultyError } = await supabase.from('faculties').select('id').eq('user_id', data.user.id).single();
            if (faculty) {
                role = 'faculty';
                pId = faculty.id;
                const { data: secData } = await supabase.from('faculty_sections').select('section').eq('faculty_id', pId);
                sections = (secData || []).map(s => s.section);
            } else {
                // FALLBACK: If profile missing from DB tables, try to get from Auth Metadata
                console.log(`[Auth] Profile missing for ${email}, checking metadata fallback...`);
                const meta = data.user.user_metadata;
                if (meta && meta.role) {
                    role = meta.role;
                    section = meta.section || 'A1';
                    sections = meta.sections || [];
                }
            }
        }

        res.json({
            message: 'Login successful',
            token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                role,
                section,
                sections,
                profileId: pId
            }
        });
    } catch (err) {
        next(err);
    }
};
