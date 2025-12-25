import Logo from "@assets/logo.png"

type ResetPasswordEmailProps = {
  name?: string;
  url: string;
  token: string;
};

export const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({ name, url, token }) => {
    const resetPasswordURL = process.env.VITE_CALLBACK_URL;
    const fullResetURL = `${resetPasswordURL}/reset-password?token=${token}`;

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
                       /*  <img 
                            src={Logo} 
                            alt="Drip Tech Logo" 
                            style={{
                                height: "48px",
                                width: "auto"
                            }}
                        /> */
                    </div>
                    <h1 style={{ 
                        color: "#171717", 
                        margin: "0",
                        fontSize: "28px",
                        fontWeight: "700",
                        letterSpacing: "-0.025em"
                    }}>
                        Reset Your Password
                    </h1>
                    <p style={{ 
                        color: "#6b7280", 
                        margin: "8px 0 0 0",
                        fontSize: "16px",
                        fontWeight: "400"
                    }}>
                        Secure your account
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
                        We received a request to reset your password for your Drip Tech account. If you made this request, click the button below to create a new password.
                    </p>
                </div>

                {/* Reset Password Button */}
                <div style={{ 
                    textAlign: "center", 
                    marginBottom: "32px"
                }}>
                    <a 
                        href={fullResetURL}
                        style={{
                            display: "inline-block",
                            backgroundColor: "#008800",
                            color: "#ffffff",
                            padding: "16px 32px",
                            borderRadius: "12px",
                            textDecoration: "none",
                            fontSize: "16px",
                            fontWeight: "600",
                            boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)",
                            transition: "all 0.2s ease"
                        }}
                        onMouseOver={(e) => {
                            const target = e.currentTarget as any;
                            target.style.backgroundColor = "#b91c1c";
                            target.style.transform = "translateY(-1px)";
                            target.style.boxShadow = "0 6px 16px rgba(220, 38, 38, 0.3)";
                        }}
                        onMouseOut={(e) => {
                            const target = e.currentTarget as any;
                            target.style.backgroundColor = "#dc2626";
                            target.style.transform = "translateY(0)";
                            target.style.boxShadow = "0 4px 12px rgba(220, 38, 38, 0.25)";
                        }}
                        onFocus={(e) => {
                            const target = e.currentTarget as any;
                            target.style.backgroundColor = "#b91c1c";
                            target.style.transform = "translateY(-1px)";
                            target.style.boxShadow = "0 6px 16px rgba(220, 38, 38, 0.3)";
                        }}
                        onBlur={(e) => {
                            const target = e.currentTarget as any;
                            target.style.backgroundColor = "#dc2626";
                            target.style.transform = "translateY(0)";
                            target.style.boxShadow = "0 4px 12px rgba(220, 38, 38, 0.25)";
                        }}
                    >
                        Reset Password
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
                        {fullResetURL}
                    </div>
                </div>

                {/* Security Notice */}
                <div style={{ 
                    padding: "20px",
                    backgroundColor: "#fef2f2",
                    borderRadius: "12px",
                    border: "1px solid #fca5a5"
                }}>
                    <p style={{ 
                        fontSize: "14px", 
                        color: "#991b1b",
                        margin: "0 0 12px 0",
                        fontWeight: "500"
                    }}>
                        🔒 Security Notice: This password reset link will expire in 1 hour for your security.
                    </p>
                    <p style={{ 
                        fontSize: "14px", 
                        color: "#991b1b",
                        margin: "0",
                        fontWeight: "500"
                    }}>
                        If you didn't request a password reset, please ignore this email. Your account remains secure and no changes have been made.
                    </p>
                </div>

                {/* Additional Security Tips */}
                <div style={{ 
                    marginTop: "24px",
                    padding: "20px",
                    backgroundColor: "#f0f9ff",
                    borderRadius: "12px",
                    border: "1px solid #7dd3fc"
                }}>
                    <h3 style={{ 
                        fontSize: "16px", 
                        color: "#0c4a6e",
                        margin: "0 0 12px 0",
                        fontWeight: "600"
                    }}>
                        💡 Password Security Tips:
                    </h3>
                    <ul style={{ 
                        fontSize: "14px", 
                        color: "#0c4a6e",
                        margin: "0",
                        paddingLeft: "20px",
                        lineHeight: "1.5"
                    }}>
                        <li>Use a unique password that you don't use elsewhere</li>
                        <li>Include a mix of uppercase, lowercase, numbers, and symbols</li>
                        <li>Make it at least 12 characters long</li>
                        <li>Consider using a password manager</li>
                    </ul>
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
                            color: "#008800",
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
                        © 2025 Starter Template.
                    </p>
                </div>
            </div>
        </div>
    );
};

