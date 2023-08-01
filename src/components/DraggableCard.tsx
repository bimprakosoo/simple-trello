import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { updateCardDescription } from "@/firebase/firebaseUtils";

interface DraggableCardProps {
  draggableId: string;
  index: number;
  text: string;
  id: string;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ draggableId, index, text, id }) => {
  const [cardText, setCardText] = useState(text);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLDivElement>) => {
    setCardText(event.target.innerText);
  };

  const openModal = () => {
    setIsEditing(true);
  };

  const closeModal = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateCardDescription({ id, draggableId, cardText }); // Call the function
      setIsEditing(false); // Close the modal after updating the description
    } catch (error) {
      console.error('Error updating card description:', error);
    }
  };

  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => (
        <>
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
            display: 'flex',
            justifyContent: 'space-between',
            ...provided.draggableProps.style,
          }}
        >
          <div onBlur={handleChange}>
            {cardText}
          </div>
          <button onClick={openModal}>Edit</button>
        </div>

        {/* Modal */}
        {isEditing && (
          <div
            style={{
              position: 'fixed',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                background: 'white',
                padding: '20px',
                borderRadius: '4px',
                width: '300px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h2>Edit Description</h2>
              <input type="text" value={cardText} onChange={(e) => setCardText(e.target.value)}
                     style={{ marginBottom: '10px', width: '100%', padding: '8px', borderRadius: '4px' }}/>
              <button onClick={handleSave}>Save</button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
      )}
    </>
  )}
</Draggable>
);
};

export default DraggableCard;