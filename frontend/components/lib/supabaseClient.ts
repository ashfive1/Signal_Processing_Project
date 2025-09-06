import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rubnblquqbejrvtjcblx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1Ym5ibHF1cWJlanJ2dGpjYmx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NDU1OTksImV4cCI6MjA3MjIyMTU5OX0.ur5HljesnUSRvucTfYIli5b3jXxKwvS08VUky58dV-k";


export const supabase = createClient(supabaseUrl, supabaseAnonKey);