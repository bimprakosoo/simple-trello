import React from "react";
import { Draggable } from "react-beautiful-dnd";

interface DraggableCardProps {
  draggableId: string;
  index: number;
  text: string;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ draggableId, index, text }) => {
  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            userSelect: 'none',
            padding: '16px',
            margin: '8px',
            backgroundColor: 'white',
            border: '1px solid gray',
            borderRadius: '4px',
            width: '100%',
            ...provided.draggableProps.style,
          }}
        >
          {text}
        </div>
      )}
    </Draggable>
  );
}

export default DraggableCard;