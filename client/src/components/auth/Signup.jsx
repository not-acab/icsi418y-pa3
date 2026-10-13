import { useState, useRef, useEffect } from "react";
import "./auth.css";

const Signup = ({ activeCard, setActiveCard, getMessage, sendMessage }) => {
    /* Fields */
    const [username, setUsername] = useState("");
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    /* Server Notices */
    const [notice, setNotice] = useState("");
    const [noticeType, setNoticeType] = useState("");
    /* Card switching */
    const [lastActiveCard, setLastActiveCard] = useState(activeCard);
    /* Process messages - thank you 412 */
    const [lastMessage, setLastMessage] = useState(getMessage);
    /* Hyperlink to login */
    const [showLoginLink, setShowLoginLink] = useState(false);
    /* Refernce to username input - needed to focus on switch */
    const usernameRef = useRef(null);
    /* Reference to notice element - focus when displayed */
    const noticeRef = useRef(null);


    /* Clear card when typing in Login */
    if (lastActiveCard !== activeCard) {
        setLastActiveCard(activeCard);
        if (activeCard === "login") {
            setFirstName("");
            setLastName("");
            setUsername("");
            setPassword("");
            setErrors({});
            setNotice("");
        }
    }

    /* Fill username sent from Login */
    if (getMessage !== lastMessage) {
        setLastMessage(getMessage);
        if (getMessage?.to === "signup") {
            setUsername(getMessage.username);
        }
    }

    /* Focus the username field after getMessage is updated and rendered */
    useEffect(() => {
        if (getMessage?.to === "signup") {
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

    /* Submit form */
    const handleSubmit = async (event) => {
        event.preventDefault();

        /* Required fields empty - POST request still sent as per pa2 requirements */
        const fieldEmpty = {
            firstname: !firstname,
            lastname: !lastname,
            username: !username,
            password: !password
        };
        setErrors(fieldEmpty);

        try {
            /* POST Request */
            const response = await fetch ("http://localhost:9000/api/users", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ firstname, lastname, username, password })
            });

             /* POST Response - always clear password & set server message */
            const data = await response.json();
            setNotice(data.message);
            setPassword("");
            setShowLoginLink(false);

            if (response.ok) {
                /* Success stylings - clear inputs for extra user feedback */
                setNoticeType("success");
                setUsername("");
                setFirstName("");
                setLastName("");
                setErrors({});
            } else {
                /* Error Stylings */
                setNoticeType("error");
                if (data.message.toLowerCase().includes("exists")) {
                    /* User already exists - clear everything but the username and make all fields an error */
                    setShowLoginLink(true)
                    setErrors({ username: true, firstname:true, lastname:true, password:true })
                    setFirstName("");
                    setLastName("");
                }
            }
        }
        catch (error) {
            setNotice("Could not connect to server");
            setNoticeType("error");
            console.error(error);
        }
    };

    /* JSX */
    return (
        <div className="card">
            <h2>Sign Up
                <span className="subtitle">-If it's your first time here</span>
            </h2>
            <form onSubmit={handleSubmit} onFocus={() => setActiveCard("signup")}>
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
                    type="text"
                    placeholder="First Name"
                    value={firstname}
                    className={errors.firstname ? "error" : ""}
                    onChange={(event) => {
                        setFirstName(event.target.value);
                        if (errors.firstname) setErrors((prev) => ({ ...prev, firstname: false }));
                    }}
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastname}
                    className={errors.lastname ? "error" : ""}
                    onChange={(event) => {
                        setLastName(event.target.value);
                        if (errors.lastname) setErrors((prev) => ({ ...prev, lastname: false }));
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
                <button type="submit">Sign Up</button>
            </form>
            {/* Overwrites notice with a hyperlink to Login */}
            {notice && (
                <p className={`notice ${noticeType}`} ref={noticeRef}>
                    {showLoginLink ? (
                        <>That user already exists.{" "}
                            <a href="#login"
                                className="notice-link"
                                onClick={(event) => {
                                    event.preventDefault();
                                    sendMessage({ to: "login", username });
                                }}
                            >Did you mean to Login?
                            </a>
                        </>
                    ) : (notice)}
                </p>
            )}
        </div>
    );
};

export default Signup;