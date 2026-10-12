import { useState, } from "react";
import reactLogo from "../assets/react.svg";
import mongoLogo from "../assets/mongodb.svg";
import Authenticate from "../pages/Authenticate";
import Projects from "../pages/Projects";
import "./App.css";

const App = () => {
    /* Login status */
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [user, setUser] = useState("Angel");

    /* JSX */
    return (
        <div className="page">
            <header className="page-header">
                <h1>Project 2 - Authentication</h1>
                {isLoggedIn ? <p>Welcome back, {user}!</p> : <p>Create an account or Sign in.</p>}
            </header>
            {isLoggedIn ? (<Projects user={user} />) : (
                <Authenticate
                    setIsLoggedIn={setIsLoggedIn}
                    setUser={setUser}
                />
            )}
            <footer className="tech-stack">
                <div className="tech-stack-row">
                    <img src={reactLogo} alt="" className="tech-stack-logo" />
                    <span>Built with React</span>
                </div>
                <div className="tech-stack-row">
                    <img src={mongoLogo} alt="" className="tech-stack-logo" />
                    <span>Powered by MongoDB</span>
                </div>
            </footer>
        </div>
    );
};

export default App;