import React from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import Column from './Column';

const Board: React.FC = () => {
  const handleDragEnd = (result: DropResult) => {
    // TODO:
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Column title="Todo"/>
      <Column title="Progress"/>
      <Column title="Done"/>
      </DragDropContext>
  );
};

export default Board;