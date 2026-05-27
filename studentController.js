const { createClient } = require('@supabase/supabase-js');

const getUserClient = (req) => {
    const token = req.headers.authorization.split(' ')[1];
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    });
};

exports.getDashboard = async (req, res, next) => {
    try {
        const client = getUserClient(req);
        
        // Fetch student profile.
        let student, resources;
        const { data: studentProfile, error: stdErr } = await client.from('students').select('*').eq('user_id', req.user.id).single();
        
        if (stdErr || !studentProfile) {
            console.log(`[Student Dashboard] Profile missing for ${req.user.email}, using metadata fallback.`);
            student = { 
                id: null, 
                student_name: req.user.email.split('@')[0], 
                section: req.user.section || 'A1' 
            };
            // If no profile, we can't easily filter resources via RLS if it depends on the 'students' table.
            // But we can try a direct filter if resources table has section column.
            const { data: resData } = await client.from('resources').select('*').eq('section', student.section).order('created_at', { ascending: false });
            resources = resData || [];
        } else {
            student = studentProfile;
            const { data: resData } = await client.from('resources').select('*').order('created_at', { ascending: false });
            resources = resData || [];
        }

        res.json({
            student,
            resources
        });
    } catch (err) {
        next(err);
    }
};

exports.getAssignments = async (req, res, next) => {
    try {
        const client = getUserClient(req);
        
        let student;
        const { data: studentProfile, error: stdErr } = await client.from('students').select('id, section').eq('user_id', req.user.id).single();
        
        let assignments;
        if (stdErr || !studentProfile) {
            student = { id: null, section: req.user.section || 'A1' };
            const { data: assignData } = await client
                .from('assignments')
                .select(`*, faculties(faculty_name)`)
                .eq('section', student.section)
                .order('created_at', { ascending: false });
            assignments = assignData || [];
        } else {
            student = studentProfile;
            const { data: assignData } = await client
                .from('assignments')
                .select(`*, faculties(faculty_name)`)
                .order('created_at', { ascending: false });
            assignments = assignData || [];
        }

        res.json({ assignments });
    } catch (err) {
        next(err);
    }
};

exports.submitAssignment = async (req, res, next) => {
    try {
        const { assignment_id, content_url, submission_text } = req.body;
        if (!assignment_id) return res.status(400).json({ error: 'Assignment ID is required' });

        const client = getUserClient(req);
        
        const { data: student, error: stdErr } = await client.from('students').select('id').eq('user_id', req.user.id).single();
        if (stdErr || !student) return res.status(403).json({ error: 'Student profile not found. Please ensure your profile is created in the database before submitting.' });

        const { data: submission, error: subErr } = await client.from('submissions').upsert({
            assignment_id,
            student_id: student.id,
            content_url,
            submission_text,
            submitted_at: new Date().toISOString()
        }, { onConflict: 'assignment_id, student_id' }).select().single();

        if (subErr) return res.status(500).json({ error: subErr.message });

        res.status(201).json({ message: 'Assignment submitted successfully', submission });
    } catch (err) {
        next(err);
    }
};

exports.getSubmissions = async (req, res, next) => {
    try {
        const client = getUserClient(req);
        
        const { data: student, error: stdErr } = await client.from('students').select('id').eq('user_id', req.user.id).single();
        if (stdErr || !student) return res.status(403).json({ error: 'Student profile not found or access denied' });

        const { data: submissions, error: subErr } = await client
            .from('submissions')
            .select('*')
            .eq('student_id', student.id)
            .order('submitted_at', { ascending: false });

        if (subErr) return res.status(500).json({ error: subErr.message });

        res.json({ submissions: submissions || [] });
    } catch (err) {
        next(err);
    }
};

