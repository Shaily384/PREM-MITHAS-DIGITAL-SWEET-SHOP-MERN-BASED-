import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

// ─── Reusable input ───────────────────────────────────────────────────────────
const Field = ({ label, type = "text", value, onChange, placeholder, required, children }) => (
  <div className="w-full flex flex-col gap-1.5">
    {label && (
      <label className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800
                   placeholder-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30
                   focus:border-amber-500 focus:bg-white transition-all duration-200"
      />
      {children}
    </div>
  </div>
);

// ─── 6-box OTP input ──────────────────────────────────────────────────────────
const OTPInput = ({ value, onChange }) => {
  const boxes = 6;
  const refs  = Array.from({ length: boxes }, () => React.createRef());

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const arr = value.split("");
    arr[i]    = val.slice(-1);
    onChange(arr.join(""));
    if (val && i < boxes - 1) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs[i - 1].current?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted.padEnd(6, ""));
      refs[Math.min(pasted.length, 5)].current?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center w-full">
      {Array.from({ length: boxes }).map((_, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-11 h-12 text-center text-lg font-bold border-2 border-stone-200 rounded-xl
                     bg-stone-50 text-stone-800 focus:outline-none focus:border-amber-500
                     focus:bg-white transition-all duration-200 caret-transparent"
        />
      ))}
    </div>
  );
};

// ─── Submit button ────────────────────────────────────────────────────────────
const Btn = ({ loading, label, loadingLabel }) => (
  <button
    disabled={loading}
    className="w-full bg-stone-800 hover:bg-amber-800 active:scale-[0.98] text-white font-bold
               py-3.5 rounded-xl transition-all duration-300 text-sm tracking-[0.12em]
               disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-stone-800/20 mt-1"
  >
    {loading ? (
      <span className="flex items-center justify-center gap-2">
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        {loadingLabel || "Please wait..."}
      </span>
    ) : label}
  </button>
);

// ─── Password strength bar ────────────────────────────────────────────────────
const StrengthBar = ({ password }) => {
  if (!password) return null;
  const strength = password.length >= 12 ? 4 : password.length >= 10 ? 3 : password.length >= 8 ? 2 : 1;
  const colors   = ["", "bg-red-400", "bg-amber-400", "bg-lime-400", "bg-green-500"];
  const labels   = ["", "Weak", "Fair", "Good", "Strong"];
  return (
    <div className="flex items-center gap-1.5 -mt-3">
      {[1, 2, 3, 4].map((n) => (
        <div key={n}
          className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= strength ? colors[strength] : "bg-stone-200"}`}
        />
      ))}
      <span className="text-[10px] text-stone-400 ml-1 w-10">{labels[strength]}</span>
    </div>
  );
};

// ─── Card header ──────────────────────────────────────────────────────────────
const Header = ({ badge, title, sub, center }) => (
  <div className={`mb-1 ${center ? "text-center" : ""}`}>
    <p className="text-[10px] tracking-[0.3em] text-amber-700 font-bold uppercase mb-1.5">{badge}</p>
    <h1 className="text-3xl font-bold text-stone-800" style={{ fontFamily: "Georgia, serif" }}>{title}</h1>
    {sub && <p className="text-stone-400 text-sm mt-1.5">{sub}</p>}
  </div>
);

// ─── Show/hide password toggle ────────────────────────────────────────────────
const EyeToggle = ({ show, toggle }) => (
  <button type="button" onClick={toggle}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400
               hover:text-amber-700 tracking-widest transition-colors">
    {show ? "HIDE" : "SHOW"}
  </button>
);

// ─── Lock icon for forgot password screens ────────────────────────────────────
const LockIcon = () => (
  <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto">
    <svg className="w-7 h-7 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  </div>
);

// ─── Main Login Page ──────────────────────────────────────────────────────────
const Login = () => {
  const [screen, setScreen] = useState("login");
  // screens: "login" | "signup" | "verify-otp" | "forgot"
  // inside "forgot": resetScreen = "email" | "otp"

  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  // Login / signup fields
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);

  // OTP verification
  const [otp,       setOtp]       = useState("");
  const [userId,    setUserId]    = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Forgot / reset password
  const [resetEmail,  setResetEmail]  = useState("");
  const [resetOtp,    setResetOtp]    = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetScreen, setResetScreen] = useState("email"); // "email" | "otp"
  const [showNewPw,   setShowNewPw]   = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => { if (token) navigate("/"); }, [token]);

  // Countdown for resend OTP button
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const go = (s) => { setOtp(""); setLoading(false); setScreen(s); };

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await axios.post(backendUrl + "/api/user/login", { email, password });
      if (r.data.success) {
        setToken(r.data.token);
        localStorage.setItem("token", r.data.token);
      } else if (r.data.needsVerification) {
        setUserId(r.data.userId);
        setCountdown(60);
        go("verify-otp");
        toast.info("Please verify your email to continue.");
      } else {
        toast.error(r.data.message);
      }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  // ── SIGN UP ────────────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await axios.post(backendUrl + "/api/user/register", { name, email, password, mobileNo });
      if (r.data.success) {
        setUserId(r.data.userId);
        setCountdown(60);
        go("verify-otp");
        toast.success(r.data.message);
      } else { toast.error(r.data.message); }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  // ── VERIFY OTP ─────────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.replace(/\s/g, "").length < 6) return toast.error("Enter all 6 digits.");
    setLoading(true);
    try {
      const r = await axios.post(backendUrl + "/api/user/verify-otp", { userId, otp });
      if (r.data.success) {
        setToken(r.data.token);
        localStorage.setItem("token", r.data.token);
        toast.success(r.data.message);
      } else { toast.error(r.data.message); }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      const r = await axios.post(backendUrl + "/api/user/resend-otp", { userId });
      if (r.data.success) { toast.success("New OTP sent!"); setCountdown(60); setOtp(""); }
      else toast.error(r.data.message);
    } catch (err) { toast.error(err.message); }
  };

  // ── FORGOT PASSWORD — step 1: enter email ─────────────────────────────────
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await axios.post(backendUrl + "/api/user/forgot-password", { email: resetEmail });
      if (r.data.success) { setResetScreen("otp"); toast.success(r.data.message); }
      else toast.error(r.data.message);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  // ── FORGOT PASSWORD — step 2: enter OTP + new password ───────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetOtp.replace(/\s/g, "").length < 6) return toast.error("Enter all 6 digits.");
    setLoading(true);
    try {
      const r = await axios.post(backendUrl + "/api/user/reset-password", {
        email: resetEmail, otp: resetOtp, newPassword,
      });
      if (r.data.success) {
        toast.success(r.data.message);
        setResetEmail(""); setResetOtp(""); setNewPassword(""); setResetScreen("email");
        go("login");
      } else { toast.error(r.data.message); }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-14 relative overflow-hidden">

      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-amber-100/50 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-stone-200/70 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl shadow-stone-300/40 border border-stone-100/80 p-8 sm:p-10">

          {/* ══ LOGIN ══ */}
          {screen === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <Header badge="Welcome Back" title="Sign In" sub="Enter your credentials to continue" />

              <Field label="Email Address" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />

              <Field label="Password" type={showPw ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required>
                <EyeToggle show={showPw} toggle={() => setShowPw(!showPw)} />
              </Field>

              <div className="flex justify-between text-xs text-stone-400 -mt-2">
                <button type="button"
                  onClick={() => { setResetScreen("email"); go("forgot"); }}
                  className="hover:text-amber-700 transition-colors font-semibold">
                  Forgot password?
                </button>
                <button type="button" onClick={() => go("signup")}
                  className="hover:text-amber-700 transition-colors font-semibold">
                  Create account →
                </button>
              </div>

              <Btn loading={loading} label="SIGN IN" loadingLabel="Signing in..." />
            </form>
          )}

          {/* ══ SIGN UP ══ */}
          {screen === "signup" && (
            <form onSubmit={handleSignup} className="flex flex-col gap-5">
              <Header badge="New Here?" title="Create Account" sub="Fill in your details to get started" />

              <Field label="Full Name" value={name}
                onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />

              <Field label="Email Address" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />

              {/* Contact number — saved in database */}
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase">
                  Contact Number
                </label>
                <div className="flex items-stretch border border-stone-200 bg-stone-50 rounded-xl overflow-hidden
                                focus-within:ring-2 focus-within:ring-amber-500/30 focus-within:border-amber-500
                                focus-within:bg-white transition-all duration-200">
                  <span className="flex items-center px-3 text-sm font-semibold text-stone-500 bg-stone-100 border-r border-stone-200 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit mobile number"
                    required
                    className="flex-1 px-3 py-3 bg-transparent text-stone-800 placeholder-stone-300 text-sm focus:outline-none"
                  />
                  {mobileNo.length === 10 && (
                    <span className="flex items-center pr-3 text-green-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>

              <Field label="Password" type={showPw ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required>
                <EyeToggle show={showPw} toggle={() => setShowPw(!showPw)} />
              </Field>

              <StrengthBar password={password} />

              <Btn loading={loading} label="SEND OTP & CONTINUE" loadingLabel="Sending OTP..." />

              <p className="text-center text-xs text-stone-400">
                Already have an account?{" "}
                <button type="button" onClick={() => go("login")}
                  className="text-amber-700 font-semibold hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* ══ OTP VERIFICATION ══ */}
          {screen === "verify-otp" && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5 items-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <Header badge="Almost There" title="Verify Email"
                sub={`A 6-digit OTP was sent to ${email}`} center />

              <OTPInput value={otp} onChange={setOtp} />

              <Btn loading={loading} label="VERIFY OTP" loadingLabel="Verifying..." />

              <p className="text-center text-xs text-stone-400">
                {countdown > 0 ? (
                  <>Resend OTP in <span className="font-bold text-amber-700">{countdown}s</span></>
                ) : (
                  <button type="button" onClick={handleResendOtp}
                    className="text-amber-700 font-semibold hover:underline">
                    Resend OTP
                  </button>
                )}
              </p>

              <button type="button" onClick={() => go("signup")}
                className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
                ← Back to Sign Up
              </button>
            </form>
          )}

          {/* ══ FORGOT PASSWORD — step 1: enter email ══ */}
          {screen === "forgot" && resetScreen === "email" && (
            <form onSubmit={handleForgotRequest} className="flex flex-col gap-5">
              <LockIcon />
              <Header badge="Forgot Password" title="Find Account"
                sub="Enter your email and we'll send a reset OTP" center />

              <Field label="Registered Email" type="email" value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)} placeholder="you@example.com" required />

              <Btn loading={loading} label="SEND RESET OTP" loadingLabel="Sending OTP..." />

              <button type="button" onClick={() => go("login")}
                className="text-center text-xs text-stone-400 hover:text-stone-600 transition-colors">
                ← Back to Sign In
              </button>
            </form>
          )}

          {/* ══ FORGOT PASSWORD — step 2: enter OTP + new password ══ */}
          {screen === "forgot" && resetScreen === "otp" && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
              <LockIcon />
              <Header badge="Reset Password" title="New Password"
                sub={`OTP sent to ${resetEmail}`} center />

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase text-center">
                  Enter OTP from Email
                </label>
                <OTPInput value={resetOtp} onChange={setResetOtp} />
              </div>

              <Field label="New Password" type={showNewPw ? "text" : "password"} value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" required>
                <EyeToggle show={showNewPw} toggle={() => setShowNewPw(!showNewPw)} />
              </Field>

              <StrengthBar password={newPassword} />

              <Btn loading={loading} label="RESET PASSWORD" loadingLabel="Resetting..." />

              <button type="button" onClick={() => setResetScreen("email")}
                className="text-center text-xs text-stone-400 hover:text-stone-600 transition-colors">
                ← Use a different email
              </button>
            </form>
          )}

        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-5 text-xs text-stone-400">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            SSL Secured
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            OTP Verified
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Free Email OTP
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;