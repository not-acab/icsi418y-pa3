import { useState, } from "react";
import Signup from "../components/auth/Signup";
import Login from "../components/auth/Login";
import "./Authenticate.css";

const Authenticate = ({ setIsLoggedIn, setUser }) => {
    /* Which card has foucs */
    const [activeCard, setActiveCard] = useState("");
    /* { to: "signup" | "login", username }: hand username to other card:  */
    const [message, setMessage] = useState(null);

    /* JSX */
    return (
        <div className="auth">
            <Login
                activeCard={activeCard}
                setActiveCard={setActiveCard}
                getMessage={message}
                sendMessage={setMessage}
                setIsLoggedIn={setIsLoggedIn}
                setUser={setUser}
            />
            <span className="auth-divider">-or-</span>
            <Signup
                activeCard={activeCard}
                setActiveCard={setActiveCard}
                getMessage={message}
                sendMessage={setMessage}
            />
        </div>
    );
};

export default Authenticate;