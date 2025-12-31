import React from "react";

type VerifyEmailProps = {
  name?: string;
  url: string;
  token: string
};

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ name, url, token }) => {
    const verifyEmailURL = import.meta.env.VITE_VERIFY_EMAIL_URL;
    const callbackURL = import.meta.env.VITE_CALLBACK_URL;

    console.log("urls", verifyEmailURL, callbackURL)
    return (
        <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f6f6f6", padding: "24px" }}>
            <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <h2 style={{ color: "#1890ff", marginBottom: "8px" }}>
                    Email verification Code
                </h2>
                <p style={{ fontSize: "16px", color: "#333" }}>
                    {name ? `Hello ${name},` : "Hello,"}
                </p>
                <p style={{ fontSize: "16px", color: "#333" }}>
                    Please follow the following link to verify your email:
                </p>  
                <div
                    style={{
                      margin: "24px 0",
                      padding: "16px",
                      backgroundColor: "#f0f5ff",
                      border: "1px dashed #91d5ff",
                      textAlign: "center",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      letterSpacing: "6px",
                      color: "#0050b3",
                    }}
                >
                    {verifyEmailURL + '?token=' + token + '&' + callbackURL}
                </div>

                <p style={{ fontSize: "14px", color: "#666" }}>
                    If you did not request verification, please ignore this email or contact support immediately.
                </p>

                <p style={{ fontSize: "14px", color: "#999", marginTop: "32px" }}>
                    — Refine + Vite + BETTER-AUTH
                </p>
            </div>
        </div>
    );
};
