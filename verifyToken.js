const { supabase } = require('../config/db');

exports.verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            console.error('[Auth Error]', error?.message || 'Invalid token');
            return res.status(403).json({ error: 'Token is invalid or expired' });
        }
        
        // Check if user is in students or faculties table to append role data
        const { data: studentData } = await supabase
            .from('students')
            .select('id, section')
            .eq('user_id', user.id)
            .single();
            
        if (studentData) {
            req.user = { id: user.id, email: user.email, role: 'student', section: studentData.section };
        } else {
            const { data: facultyData } = await supabase
                .from('faculties')
                .select('id')
                .eq('user_id', user.id)
                .single();
                
            if (facultyData) {
                const { data: secData } = await supabase.from('faculty_sections').select('section').eq('faculty_id', facultyData.id);
                const sections = (secData || []).map(s => s.section);
                req.user = { id: user.id, email: user.email, role: 'faculty', sections };
            } else {
                // FALLBACK: Use metadata if profile not in DB
                const meta = user.user_metadata;
                if (meta && meta.role) {
                    req.user = { 
                        id: user.id, 
                        email: user.email, 
                        role: meta.role,
                        section: meta.section || 'A1',
                        sections: meta.sections || []
                    };
                } else {
                    req.user = { id: user.id, email: user.email, role: 'unknown' };
                }
            }
        }

        next();
    } catch (err) {
        console.error('[Auth Middleware Exception]', err);
        return res.status(500).json({ error: 'Internal server error during authentication check' });
    }
};
