import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/index.scss';

import Main from './pages/Main';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Main />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;