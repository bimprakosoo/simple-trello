// pages/index.tsx
import React, {useState} from 'react';
import Board from '../src/components/Board';

const HomePage: React.FC = () => {
  const [columns] = useState([]);

  return (
    <div>
      <h1>Track Your Task</h1>
      <Board initialColumns={columns} />
    </div>
  );
};

export default HomePage;
