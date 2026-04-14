const SUPABASE_URL = "https://fvgwgiaergfukdotatmw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_cRycoa5jSVGcwc6ELRYNVA_nLGOiTKi";

function isSupabasePlaceholderValue(value) {
  return typeof value !== "string" || value.indexOf("PASTE_YOUR_") === 0;
}

const SUPABASE_CONFIGURED =
  typeof window.supabase !== "undefined" &&
  !isSupabasePlaceholderValue(SUPABASE_URL) &&
  !isSupabasePlaceholderValue(SUPABASE_PUBLISHABLE_KEY);

const supabaseClient = SUPABASE_CONFIGURED
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_PUBLISHABLE_KEY = SUPABASE_PUBLISHABLE_KEY;
window.SUPABASE_CONFIGURED = SUPABASE_CONFIGURED;
window.supabaseClient = supabaseClient;
