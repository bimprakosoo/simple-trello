import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';

interface DraggableCardProps {
  draggableId: string;
  index: number;
  text: string;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ draggableId, index, text }) => {
  const [cardText, setCardText] = useState(text);

  const handleChange = (event: React.ChangeEvent<HTMLDivElement>) => {
    setCardText(event.target.innerText);
  };

  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            userSelect: 'none',
            padding: '16px',
            margin: '8px',
            backgroundColor: snapshot.isDragging ? 'lightblue' : 'white',
            border: '1px solid gray',
            borderRadius: '4px',
            width: '100%',
            ...provided.draggableProps.style,
          }}
        >
          {cardText}
        </div>
      )}
    </Draggable>
  );
};

export default DraggableCard;