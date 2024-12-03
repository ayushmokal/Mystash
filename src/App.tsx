import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { ProtectedRoute } from './components/auth/protected-route';
import { AuthCallback } from './components/auth/auth-callback';
import { Home } from './pages/home';
import { Login } from './pages/login';
import { Register } from './pages/register';
import { ResetPassword } from './pages/reset-password';
import { UpdatePassword } from './pages/update-password';
import { Profile } from './pages/profile';
import { ErrorPage } from './pages/error';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="auth/callback" element={<AuthCallback />} />
        <Route path="auth/reset-password" element={<UpdatePassword />} />
        <Route path="error" element={<ErrorPage />} />
        <Route
          path=":username"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;