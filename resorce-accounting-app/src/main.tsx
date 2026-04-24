import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes, Router } from "react-router-dom";
import { Home } from './pages/Home';
import { Hardware } from './pages/Hardware';
import { Software } from './pages/Software';
import { User } from './pages/User';
import { Analytics } from './pages/Analytics';
import { SignUp } from './pages/SignUp';
import { SignInPage } from './components/pages/signin/SignInPage';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
      <Route
          path="/"
          element={<SignUp /> }
        />

<Route
          path="/signin"
          element={<SignInPage />}
        />

        <Route
          path="/home"
          element={<Home />}
        />

<Route
          path="/hardware"
          element={<Hardware />}
        />

<Route
          path="/software"
          element={<Software />}
        />

<Route
          path="/users"
          element={<User /> }
        />

<Route
          path="/analytics"
          element={<Analytics /> }
        />

      </Routes>
      
    </BrowserRouter>
  </StrictMode>
);
