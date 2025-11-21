import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ehwiycyhcsjedzjqjmro.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVod2l5Y3loY3NqZWR6anFqbXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDEwMDAsImV4cCI6MjA3OTIxNzAwMH0.sTpUsxJEpvA6u0H2_QUZb_u5sUvhFW7LVzNCO0QO3cA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testGetAllMembers() {
    console.log('Testing getAllMembers query...');

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*, watchlists(count), ratings(count)')
        .limit(50);

    if (error) {
        console.error('getAllMembers query failed:', JSON.stringify(error, null, 2));
    } else {
        console.log(`getAllMembers success. Found ${profiles.length} profiles.`);
        if (profiles.length > 0) {
            console.log('First profile sample:', profiles[0]);
        }
    }
}

testGetAllMembers();
