import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Workspace } from './pages/Workspace';
import { useAppStore } from './stores/appStore';

function App() {
  const theme = useAppStore(state => state.theme);
  const customCss = useAppStore(state => state.customCss);

  useEffect(() => {
    document.documentElement.classList.remove(
      'dark', 'theme-dark', 'theme-light', 'theme-obsidian', 
      'theme-dracula', 'theme-nord', 'theme-monokai', 
      'theme-github-dark', 'theme-solarized-dark', 
      'theme-gruvbox', 'theme-onedark'
    );
    if (theme !== 'theme-light') {
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  return (
    <>
      {customCss && <style id="custom-css-injector">{customCss}</style>}
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<Workspace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
