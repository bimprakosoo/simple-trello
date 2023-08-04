// pages/index.tsx
import React, {useState} from 'react';
import Board from '../src/components/Board';
import bg from '../assets/images/background.jpg'
import '../assets/css/style.css';
import Image from "next/image";

const HomePage: React.FC = () => {
  const [columns] = useState([]);

  return (
    <div className="bg-image-wrapper">
      <Image src={bg} quality="100" layout="fill" alt="bg-image"/>
      <div className="app-bar">
        <h1>Track Your Task</h1>
      </div>
      <div className="content-wrapper">
        <Board initialColumns={columns}/>
      </div>
    </div>
  );
};

export default HomePage;
