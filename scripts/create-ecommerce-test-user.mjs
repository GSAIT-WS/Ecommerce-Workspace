/**
 * Creates (or resets) a Supabase Auth user for local/e2e testing.
 *
 * • With SUPABASE_SERVICE_ROLE_KEY: admin createUser, or reset password if email exists.
 * • With only VITE_SUPABASE_ANON_KEY: signUp (fails if user exists — add service role to reset).
 *
 * Usage: npm run create-test-user
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const nested = join(root, "crunchx-healthy-home");

const TEST_EMAIL = "ecommerce-test@crunchx.in";

function parseEnvText(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[key] = v;
  }
  return out;
}

/** Merge root .env then crunchx-healthy-home/.env (later wins). */
function loadEnv() {
  const paths = [join(root, ".env"), join(nested, ".env")];
  let merged = {};
  for (const p of paths) {
    if (existsSync(p)) {
      merged = { ...merged, ...parseEnvText(readFileSync(p, "utf8")) };
    }
  }
  return merged;
}

function randomPassword() {
  const a = crypto.randomBytes(12).toString("base64url");
  const b = crypto.randomBytes(4).toString("hex");
  return `CxTest-${a}-${b}!`;
}

const env = loadEnv();
const url = (env.VITE_SUPABASE_URL || env.SUPABASE_URL || "").trim();
const serviceKey = (env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const anonKey = (env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || "").trim();

if (!url || (!serviceKey && !anonKey)) {
  console.error(
    "Missing VITE_SUPABASE_URL (or SUPABASE_URL) and a key:\n" +
      "  • Prefer SUPABASE_SERVICE_ROLE_KEY (Dashboard → Settings → API) for create + password reset.\n" +
      "  • Or VITE_SUPABASE_ANON_KEY only: new user is created via signUp if the email is not taken.\n" +
      "    If the user already exists, add the service role key and run again to reset the password."
  );
  process.exit(1);
}

const password = randomPassword();

if (serviceKey) {
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password,
    email_confirm: true,
    user_metadata: { display_name: "E2E Test Customer" },
    app_metadata: { user_type: "ecommerce_customer" },
  });

  if (!createErr && created?.user) {
    printSuccess("Created Supabase Auth user (customer profile is created by DB trigger on signup).", password);
    process.exit(0);
  }

  const msg = createErr?.message || "";
  const duplicate =
    /already|registered|exists|duplicate/i.test(msg) || createErr?.status === 422;

  if (!duplicate) {
    console.error("createUser failed:", createErr);
    process.exit(1);
  }

  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (listErr) {
    console.error("listUsers failed:", listErr);
    process.exit(1);
  }

  const existing = list.users.find(
    (u) => (u.email || "").toLowerCase() === TEST_EMAIL.toLowerCase()
  );

  if (!existing) {
    console.error("User exists error but could not find user by email:", TEST_EMAIL);
    process.exit(1);
  }

  const { error: updErr } = await supabase.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
    app_metadata: { user_type: "ecommerce_customer" },
  });

  if (updErr) {
    console.error("updateUserById failed:", updErr);
    process.exit(1);
  }

  printSuccess("Test user already existed; password was reset.", password);
  process.exit(0);
}

/* Anon-only: signUp (works when Email provider allows sign-ups; confirm email may block until inbox click). */
const supabaseAnon = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: signData, error: signErr } = await supabaseAnon.auth.signUp({
  email: TEST_EMAIL,
  password,
  options: {
    data: { display_name: "E2E Test Customer" },
  },
});

if (signErr) {
  const dup = /already|registered|exists/i.test(signErr.message || "");
  if (dup) {
    console.error(
      `User ${TEST_EMAIL} already exists. Add SUPABASE_SERVICE_ROLE_KEY to .env and run:\n` +
        "  npm run create-test-user\n" +
        "to set a new password."
    );
  } else {
    console.error("signUp failed:", signErr.message || signErr);
  }
  process.exit(1);
}

if (!signData.user) {
  console.error("signUp returned no user.");
  process.exit(1);
}

printSuccess(
  "Created user via signUp (enable “Confirm email” off in Dashboard for instant password login, or confirm the signup email).",
  password
);

function printSuccess(note, pw) {
  console.log("\n" + note + "\n");
  console.log("Email:    ", TEST_EMAIL);
  console.log("Password: ", pw);
  console.log("\nUse these in Login → Internal / testing only.\n");
}
