"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async() => {
    const {error} = await supabase.auth.signUp({
      email,
      password
    })

    if(error) {
      alert(error.message);
    } else {
      alert("Signup successful! Please check your email for confirmation.");
    }
  }


  const handleLogin = async() => {
    const {error} = await supabase.auth.signInWithPassword({email,password})

    if(error) {
      alert(error.message);
    }      
    else {
      alert("Login successful!");
      router.push("/app");
    }
}   
  
  return (
    <div style={{ padding: 24 }}>
      <h1>Login</h1>

      <div style={{ marginTop: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button onClick = { handleLogin} style={{ marginTop: 12 }}>
        Login
      </button> 
    <br></br>
      <button onClick={handleSignup}>
        Sign Up
      </button>

    </div>
  );
}