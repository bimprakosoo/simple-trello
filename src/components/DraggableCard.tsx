import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { db } from '../../firebaseConfig';

interface DraggableCardProps {
  draggableId: string;
  index: number;
  text: string;
  id: string;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ draggableId, index, text }) => {
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
      const todoDocRef = db.collection('columns').doc('todo');
      const progressDocRef = db.collection('columns').doc('progress');
      const doneDocRef = db.collection('columns').doc('done');

      // Use a Firestore transaction to update the card's description
      await db.runTransaction(async (transaction) => {
        // Fetch the current data of the documents
        const todoDoc = await transaction.get(todoDocRef);
        const progressDoc = await transaction.get(progressDocRef);
        const doneDoc = await transaction.get(doneDocRef);

        // Check if the card exists in the "cards" array
        const todoCards = todoDoc.exists ? todoDoc.data()?.cards : [];
        const progressCards = todoDoc.exists ? progressDoc.data()?.cards : [];
        const doneCards = todoDoc.exists ? doneDoc.data()?.cards : [];
        const todoCardIndex = todoCards.findIndex((card: DraggableCardProps) => card.id === draggableId);
        const progressCardIndex = progressCards.findIndex((card: DraggableCardProps) => card.id === draggableId);
        const doneCardIndex = doneCards.findIndex((card: DraggableCardProps) => card.id === draggableId);


        // Update the card's description if it exists in the "cards" array
        if (todoCardIndex !== -1) {
          const updatedTodoCards = [...todoCards];
          updatedTodoCards[todoCardIndex] = { ...updatedTodoCards[todoCardIndex], text: cardText };
          transaction.update(todoDocRef, { cards: updatedTodoCards });
        } else if (progressCardIndex !== -1) {
          const updatedProgressCards = [...progressCards];
          updatedProgressCards[progressCardIndex] = { ...updatedProgressCards[progressCardIndex], text: cardText };
          transaction.update(progressDocRef, { cards: updatedProgressCards });
        } else if (doneCardIndex !== -1) {
          const updatedDoneCards = [...doneCards];
          updatedDoneCards[doneCardIndex] = { ...updatedDoneCards[doneCardIndex], text: cardText };
          transaction.update(doneDocRef, { cards: updatedDoneCards });
        }
      });

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
          <div contentEditable={!isEditing} onBlur={handleChange}>
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