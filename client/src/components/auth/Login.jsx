import { useState, useRef, useEffect } from "react";
import "./auth.css";

const Login = ({ activeCard, setActiveCard, getMessage, sendMessage, onLogin }) => {
    /* Fields */
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    /* Server Notices */
    const [notice, setNotice] = useState("");
    const [noticeType, setNoticeType] = useState("");
    /* Card switching */
    const [lastActiveCard, setLastActiveCard] = useState(activeCard);
    /* Process messages - thank you 412 */
    const [lastMessage, setLastMessage] = useState(getMessage);
    /* Hyperlink to signup */
    const [showSignupLink, setShowSignupLink] = useState(false);
    /* Refernce to username input - needed to focus on switch */
    const usernameRef = useRef(null);
    /* Reference to notice element - focus when displayed */
    const noticeRef = useRef(null);


    /* Clear card when Signup becomes the active card */
    if (lastActiveCard !== activeCard) {
        setLastActiveCard(activeCard);
        if (activeCard === "signup") {
            setUsername("");
            setPassword("");
            setNotice("");
            setErrors({});
        }
    }

    /* Fill username sent from Signup */
    if (getMessage !== lastMessage) {
        setLastMessage(getMessage);
        if (getMessage?.to === "login") {
            setUsername(getMessage.username);
        }
    }

    /* Focus the username field after getMessage is updated and rendered */
    useEffect(() => {
        if (getMessage?.to === "login") {
            usernameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            usernameRef.current?.focus();
        }
    }, [getMessage]);

    useEffect(() => {
        if (notice !== "") {
            noticeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            noticeRef.current?.focus();
        }
    }, [notice]);

    /* Submit Form */
    const handleSubmit = async (event) => {
        event.preventDefault();

        /* Required fields empty - POST request still sent as per pa2 requirements */
        const fieldEmpty = {
            username: !username,
            password: !password
        };
        setErrors(fieldEmpty);

        try {
            /* POST Request */
            const response = await fetch("http://localhost:9000/api/users/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ username, password })
            });

            /* POST Response - always clear password & set server message */
            const data = await response.json();
            setPassword("");
            setNotice(data.message);
            setShowSignupLink(false);

            if (response.ok) {
                /* Success styling */
                setNoticeType("success");
                setErrors({});
                /* Tell the layout who logged in - the auth route then redirects to /projects */
                onLogin(data.user?.f_name || username);
            } else {
                /* Error styling */
                setNoticeType("error");
                /* Determine the nature of the error */
                if (data.message.toLowerCase().includes("user")) {
                    setErrors({ username: true });
                }
                if (data.message.toLowerCase().includes("does not exist")) {
                    setShowSignupLink(true);
                    setErrors((prev) => ({ ...prev, password: true }));
                }
                else if (data.message.toLowerCase().includes("pass")) {
                    setErrors((prev) => ({ ...prev, password: true }));
                }
            }
        }
        catch (error) {
            setNotice("Could not connect to the server");
            setNoticeType("error");
            setShowSignupLink(false);
            console.error(error);

        }
    };

    /* JSX */
    return (
        <div className="card">
            <h2>Log In
                <span className="subtitle">-If you're a returning user</span>
            </h2>
            <form onSubmit={handleSubmit} onFocus={() => setActiveCard("login")}>
                <input
                    ref={usernameRef}
                    type="text"
                    placeholder="Username"
                    value={username}
                    className={errors.username ? "error" : ""}
                    onChange={(event) => {
                        setUsername(event.target.value)
                        if (errors.username) setErrors((prev) => ({ ...prev, username: false }));
                    }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    className={errors.password ? "error" : ""}
                    onChange={(event) => {
                        setPassword(event.target.value)
                        if (errors.password) setErrors((prev) => ({ ...prev, password: false }));
                    }}
                />
                <button type="submit">Login</button>
            </form>
            {/* Overwrites message with a hyperlink to Signup */}
            {notice && (
                <p className={`notice ${noticeType}`} ref={noticeRef}>
                    {showSignupLink ? (
                        <>That user does not exist.{" "}
                            <a href="#signup"
                                className="notice-link"
                                onClick={(event) => {
                                    event.preventDefault();
                                    sendMessage({ to: "signup", username });
                                }}
                            >Did you mean to Signup?
                            </a>
                        </>
                    ) : (notice)}
                </p>
            )}
        </div>
    );
};

export default Login;