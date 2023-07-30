import React from "react";
import { Droppable } from "react-beautiful-dnd";
import Card from './Card';

interface ColumnProps {
  title: string;
}

const Column: React.FC<ColumnProps> = ({ title }) => {
  return (
  <div>
    <h2>{title}</h2>
    <Droppable droppableId={title.toLowerCase().replace(' ', '-')}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          <Card text="Example Card" index={0} />
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
  );
};

export default Column;