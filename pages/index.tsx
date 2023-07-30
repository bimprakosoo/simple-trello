// pages/index.tsx
import React from 'react';
import Board from '../src/components/Board';

const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to My Drag and Drop Todo List</h1>
      <Board />
    </div>
  );
};

export default HomePage;
