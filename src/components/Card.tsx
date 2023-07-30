import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

interface CardProps {
  text: string;
  index: number;
}

const Card: React.FC<CardProps> = ({ text, index }) => {
  return (
    <Draggable draggableId={`card-${text.toLowerCase().replace(' ', '-')}`} index={index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          {text}
        </div>
      )}
    </Draggable>
  );
};

export default Card;
