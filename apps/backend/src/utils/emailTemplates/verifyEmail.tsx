import React from "react";

type VerifyEmailProps = {
  name?: string;
  url: string;
  token: string
};

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ name, url, token }) => {
    const verifyEmailURL = process.env.VITE_VERIFY_EMAIL_URL;
    const callbackURL = process.env.VITE_CALLBACK_URL;
    const fullVerificationURL = `${verifyEmailURL}?token=${token}&callbackURL=${callbackURL}`;

    return (
        <div style={{ 
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
            backgroundColor: "#fafafa", 
            padding: "24px",
            lineHeight: "1.6"
        }}>
            <div style={{ 
                maxWidth: "600px", 
                margin: "0 auto", 
                backgroundColor: "#ffffff", 
                padding: "40px", 
                borderRadius: "16px", 
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid #f0f0f0"
            }}>
                {/* Header with Logo */}
                <div style={{ 
                    textAlign: "center", 
                    marginBottom: "32px",
                    paddingBottom: "24px",
                    borderBottom: "1px solid #f0f0f0"
                }}>
                    <div style={{
                        display: "inline-block",
                        marginBottom: "16px"
                    }}>
                        <img 
                            src="https://driptech.com/driptech.png" 
                            alt="Drip Tech Logo" 
                            style={{
                                height: "48px",
                                width: "auto"
                            }}
                        />
                    </div>
                    <h1 style={{ 
                        color: "#171717", 
                        margin: "0",
                        fontSize: "28px",
                        fontWeight: "700",
                        letterSpacing: "-0.025em"
                    }}>
                        Verify Your Email
                    </h1>
                    <p style={{ 
                        color: "#6b7280", 
                        margin: "8px 0 0 0",
                        fontSize: "16px",
                        fontWeight: "400"
                    }}>
                        Complete your account setup
                    </p>
                </div>

                {/* Greeting */}
                <div style={{ marginBottom: "32px" }}>
                    <p style={{ 
                        fontSize: "18px", 
                        color: "#374151",
                        margin: "0 0 16px 0",
                        fontWeight: "500"
                    }}>
                        {name ? `Hello ${name},` : "Hello there,"}
                    </p>
                    <p style={{ 
                        fontSize: "16px", 
                        color: "#6b7280",
                        margin: "0",
                        lineHeight: "1.6"
                    }}>
                        Thanks for signing up with Drip Tech! To complete your account setup and start shopping, please verify your email address by clicking the button below.
                    </p>
                </div>

                {/* Verification Button */}
                <div style={{ 
                    textAlign: "center", 
                    marginBottom: "32px"
                }}>
                    <a 
                        href={fullVerificationURL}
                        style={{
                            display: "inline-block",
                            backgroundColor: "#16a34a",
                            color: "#ffffff",
                            padding: "16px 32px",
                            borderRadius: "12px",
                            textDecoration: "none",
                            fontSize: "16px",
                            fontWeight: "600",
                            boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)",
                            transition: "all 0.2s ease"
                        }}
                        onMouseOver={(e) => {
                            const target = e.currentTarget as any;
                            target.style.backgroundColor = "#15803d";
                            target.style.transform = "translateY(-1px)";
                            target.style.boxShadow = "0 6px 16px rgba(22, 163, 74, 0.3)";
                        }}
                        onMouseOut={(e) => {
                            const target = e.currentTarget as any;
                            target.style.backgroundColor = "#16a34a";
                            target.style.transform = "translateY(0)";
                            target.style.boxShadow = "0 4px 12px rgba(22, 163, 74, 0.25)";
                        }}
                    >
                        Verify Email Address
                    </a>
                </div>

                {/* Full Link Display */}
                <div style={{ 
                    marginBottom: "32px",
                    padding: "20px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb"
                }}>
                    <p style={{ 
                        fontSize: "14px", 
                        color: "#6b7280",
                        margin: "0 0 12px 0",
                        fontWeight: "500"
                    }}>
                        Or copy and paste this link into your browser:
                    </p>
                    <div style={{
                        padding: "12px 16px",
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontFamily: "monospace",
                        fontSize: "13px",
                        color: "#374151",
                        wordBreak: "break-all",
                        lineHeight: "1.4"
                    }}>
                        {fullVerificationURL}
                    </div>
                </div>

                {/* Security Notice */}
                <div style={{ 
                    padding: "20px",
                    backgroundColor: "#fef3c7",
                    borderRadius: "12px",
                    border: "1px solid #f59e0b"
                }}>
                    <p style={{ 
                        fontSize: "14px", 
                        color: "#92400e",
                        margin: "0",
                        fontWeight: "500"
                    }}>
                        🔒 Security Note: This verification link will expire in 24 hours. If you didn't create this account, please ignore this email or contact our support team immediately.
                    </p>
                </div>

                {/* Footer */}
                <div style={{ 
                    marginTop: "40px",
                    paddingTop: "24px",
                    borderTop: "1px solid #f0f0f0",
                    textAlign: "center"
                }}>
                    <p style={{ 
                        fontSize: "14px", 
                        color: "#9ca3af",
                        margin: "0 0 8px 0"
                    }}>
                        Need help? Contact our{" "}
                        <a href="mailto:support@driptech.com" style={{ 
                            color: "#16a34a",
                            textDecoration: "none",
                            fontWeight: "500"
                        }}>
                            support team
                        </a>
                    </p>
                    <p style={{ 
                        fontSize: "12px", 
                        color: "#9ca3af",
                        margin: "0"
                    }}>
                        © 2025 Drip Tech. Premium Tech & Fashion.
                    </p>
                </div>
            </div>
        </div>
    );
};
