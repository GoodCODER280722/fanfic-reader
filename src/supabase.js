import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wsuifbuvipgjklsixclm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzdWlmYnV2aXBnamtsc2l4Y2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMDQ3NDIsImV4cCI6MjA5MTU4MDc0Mn0.DNm-AOB_v3xFcbBcYeOG7w1GoOhnNqHAlqaGU2MTTeA";

export const supabase = createClient(supabaseUrl, supabaseKey);
