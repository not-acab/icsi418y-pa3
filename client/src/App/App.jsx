/* Browser router */
import { createBrowserRouter, RouterProvider } from "react-router";
/* Route paths and a data loader for project page */
import Projects, { loader as projectsLoader } from "../routes/Projects";
import Auth from "../routes/Auth";
/* Layout for the app (Header & Footer are persistent) */
import Layout from "./Layout";
/* Component to show while fetching data */
import Loading from "../components/Loading";

const router = createBrowserRouter([
    { path: "/",
        /* Always display the layout */
        Component: Layout,
        /* Nest routes as children of the layout */
        children: [
            /* Default route is the Auth page */
            { index: true, Component: Auth },
            /* Route for the Projects page */
            { path: "projects",
                Component: Projects,
                /* load project data before rendering */
                loader: projectsLoader,
                /* Show a loading component while fetching data */
                HydrateFallback: Loading
            }
        ]
    }
]);

/* Final app consists only of the router */
const App = () => <RouterProvider router={router} />;
export default App;
