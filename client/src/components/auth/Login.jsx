import { useState, useRef, useEffect } from "react";
import "./auth.css";

const Login = ({ activeCard, setActiveCard, getMessage, sendMessage, setIsLoggedIn }) => {
    /* Fields */
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    /* Messages */
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    /* Card switching */
    const [lastActiveCard, setLastActiveCard] = useState(activeCard);
    /* Process messages - thank you 412 */
    const [lastMessage, setLastMessage] = useState(getMessage);
    /* Hyperlink to signup */
    const [showSignupLink, setShowSignupLink] = useState(false);
    /* Refernce to username input - needed to focus on switch */
    const usernameRef = useRef(null);


    /* Clear card when Signup becomes the active card */
    if (lastActiveCard !== activeCard) {
        setLastActiveCard(activeCard);
        if (activeCard === "signup") {
            setUsername("");
            setPassword("");
            setMessage("");
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
            const response = await fetch("http://localhost:9000/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ username, password })
            });

            /* POST Response - always clear password & set server message */
            const data = await response.json();
            setPassword("");
            setMessage(data.message);
            setShowSignupLink(false);

            if (response.ok) {
                /* Success styling */
                setMessageType("success");
                setErrors({});
                /* Set isLoggedIn to true on successful login */
                setIsLoggedIn(true);
            } else {
                /* Error styling */
                setMessageType("error");
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
            setMessage("Could not connect to the server");
            setMessageType("error");
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
            {message && (
                <p className={`message ${messageType}`}>
                    {showSignupLink ? (
                        <>That user does not exist.{" "}
                            <a href="#signup"
                                className="message-link"
                                onClick={(event) => {
                                    event.preventDefault();
                                    sendMessage({ to: "signup", username });
                                }}
                            >Did you mean to Signup?
                            </a>
                        </>
                    ) : (message)}
                </p>
            )}
        </div>
    );
};

export default Login;