// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
//   useNavigate,
// } from "react-router-dom";
// import Login from "./Components/Login";
// import AdminPanel from "./Components/AdminPanel";
// import UserPanel from "./Components/UserPanel";
// import SignUp from "./Components/SignUp";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Default Route (Redirect to Login) */}
//         <Route path="/" element={<Navigate to="/login" />} />

//         {/* Login Route */}
//         <Route path="/login" element={<Login />} />

//         {/* AdminPanel Route */}
//         <Route path="/Admin" element={<AdminPanel />} />

//         {/* User Route */}
//         <Route path="/user" element={<UserPanel />} />

//         {/* Sign up Route */}
//         <Route path="/signUp" element={<SignUp />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Components/Login";
import AdminPanel from "./Components/AdminPanel";
import UserPanel from "./Components/UserPanel";
import SignUp from "./Components/SignUp";
import ProtectedRoute from "./ProtectedRoute";
import { UserProvider } from "./UserContext";
import ForgotPass from "./Components/ForgotPass";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Default Route (Redirect to Login) */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Sign up Route */}
          <Route path="/signUp" element={<SignUp />} />

          {/* Forgot Password Route*/}
          <Route path="/forgot" element={<ForgotPass />} />

          {/* Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <UserPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
