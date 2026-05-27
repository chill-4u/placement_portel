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
        
        // Fetch faculty profile & their sections
        let faculty, sections;
        const { data: facultyProfile, error: facErr } = await client.from('faculties').select('id, faculty_name').eq('user_id', req.user.id).single();
        
        if (facErr || !facultyProfile) {
            console.log(`[Faculty Dashboard] Profile missing for ${req.user.email}, using metadata fallback.`);
            faculty = { id: null, faculty_name: req.user.email.split('@')[0] };
            sections = (req.user.sections && req.user.sections.length > 0) ? req.user.sections : ['A1'];
        } else {
            faculty = facultyProfile;
            const { data: sectionsData } = await client.from('faculty_sections').select('section').eq('faculty_id', faculty.id);
            sections = (sectionsData || []).map(s => s.section);
        }

        // Fetch resources uploaded by this faculty
        let resources = [];
        if (faculty.id) {
            const { data: resData } = await client.from('resources').select('*').eq('faculty_id', faculty.id);
            resources = resData || [];
        }

        res.json({
            faculty,
            sections,
            resources
        });
    } catch (err) {
        next(err);
    }
};

exports.uploadResource = async (req, res, next) => {
    try {
        const { title, description, content_url, section } = req.body;
        if (!title || !section) return res.status(400).json({ error: 'Title and target section are required' });

        const client = getUserClient(req);
        
        const { data: faculty } = await client.from('faculties').select('id').eq('user_id', req.user.id).single();
        if (!faculty) return res.status(403).json({ error: 'Faculty profile not found. Please ensure your profile is created in the database.' });

        // Insert resource.
        const { data: resource, error } = await client.from('resources').insert({
            faculty_id: faculty.id,
            title,
            description,
            content_url,
            section
        }).select().single();

        if (error) return res.status(500).json({ error: error.message });
        
        res.status(201).json({ message: 'Resource shared successfully', resource });
    } catch (err) {
        next(err);
    }
};

exports.getAssignments = async (req, res, next) => {
    try {
        const client = getUserClient(req);
        
        const { data: faculty, error: facErr } = await client.from('faculties').select('id').eq('user_id', req.user.id).single();
        if (facErr || !faculty) return res.status(403).json({ error: 'Faculty profile not found or access denied' });

        const { data: assignments, error: assignErr } = await client
            .from('assignments')
            .select('*')
            .eq('faculty_id', faculty.id)
            .order('created_at', { ascending: false });

        if (assignErr) return res.status(500).json({ error: assignErr.message });

        res.json({ assignments: assignments || [] });
    } catch (err) {
        next(err);
    }
};

exports.createAssignment = async (req, res, next) => {
    try {
        const { title, description, content_url, section, due_date } = req.body;
        if (!title || !section) return res.status(400).json({ error: 'Title and target section are required' });

        const client = getUserClient(req);
        
        const { data: faculty, error: facErr } = await client.from('faculties').select('id').eq('user_id', req.user.id).single();
        if (facErr || !faculty) return res.status(403).json({ error: 'Faculty context not found' });

        const { data: assignment, error: assignErr } = await client.from('assignments').insert({
            faculty_id: faculty.id,
            title,
            description,
            content_url,
            section,
            due_date: due_date || null
        }).select().single();

        if (assignErr) return res.status(500).json({ error: assignErr.message });

        res.status(201).json({ message: 'Assignment created successfully', assignment });
    } catch (err) {
        next(err);
    }
};

exports.getSubmissions = async (req, res, next) => {
    try {
        const client = getUserClient(req);
        
        const { data: faculty, error: facErr } = await client.from('faculties').select('id').eq('user_id', req.user.id).single();
        if (facErr || !faculty) return res.status(403).json({ error: 'Faculty context not found' });

        const { data: submissions, error: subErr } = await client
            .from('submissions')
            .select(`
                id,
                assignment_id,
                student_id,
                content_url,
                submission_text,
                submitted_at,
                assignments!inner(title, faculty_id),
                students!inner(student_name, roll_no, section)
            `)
            .eq('assignments.faculty_id', faculty.id)
            .order('submitted_at', { ascending: false });

        if (subErr) return res.status(500).json({ error: subErr.message });

        res.json({ submissions: submissions || [] });
    } catch (err) {
        next(err);
    }
};

