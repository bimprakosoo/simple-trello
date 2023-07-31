import React, {useEffect, useState} from "react";
import { DragDropContext, DropResult, Droppable, Draggable } from "react-beautiful-dnd";
// import Column from "@/components/Column";
import dynamic from "next/dynamic";
import { db } from '../../firebaseConfig';

interface Card {
  id: string;
  text: string;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

interface Props {
  initialColumns: Column[];
}

const Board: React.FC<Props> = ({ initialColumns }) => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newCardDescription, setNewCardDescription] = useState<string>('');

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceColumnId = source.droppableId;
    const destinationColumnId = destination.droppableId;
    const draggedCardId = columns.find((column) => column.id === sourceColumnId)?.cards[source.index].id;

    if (!draggedCardId || !sourceColumnId || !destinationColumnId) {
      return;
    }

    // Move the card in the state
    const sourceColumn = columns.find((column) => column.id === sourceColumnId);
    const destinationColumn = columns.find((column) => column.id === destinationColumnId);
    const draggedCard = sourceColumn?.cards[source.index];

    if (!sourceColumn || !destinationColumn || !draggedCard) {
      return;
    }

    // Remove the card from the source column
    sourceColumn.cards.splice(source.index, 1);

    // Add the card to the destination column at the specified index
    if (!destinationColumn.cards) {
      destinationColumn.cards = [];
    }
    destinationColumn.cards.splice(destination.index, 0, draggedCard);

    setColumns([...columns]);

    // Update the card positions in Firebase
    const updatedTodoCards = columns.find((column) => column.id === 'todo')?.cards || [];
    const updatedProgressCards = columns.find((column) => column.id === 'progress')?.cards || [];
    const updatedDoneCards = columns.find((column) => column.id === 'done')?.cards || [];

    db.collection('columns')
      .doc('todo')
      .update({ cards: updatedTodoCards })
      .catch((error) => {
        console.error('Error updating todo document:', error);
      });

    db.collection('columns')
      .doc('progress')
      .update({ cards: updatedProgressCards })
      .catch((error) => {
        console.error('Error updating progress document:', error);
      });

    db.collection('columns')
      .doc('done')
      .update({ cards: updatedDoneCards })
      .catch((error) => {
        console.error('Error updating done document:', error);
      });
  };

  const handleAddCard = () => {
    setShowModal(true);
  }

  const handleModalInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewCardDescription(event.target.value);
  };

  const handleModalSubmit = () => {
    if (newCardDescription.trim() !== '') {
      const newCard: Card = { id: Date.now().toString(), text: newCardDescription };

      // Update the state to include the new card
      const updatedTodoColumn = { ...columns[0], cards: [...columns[0].cards, newCard] };
      const updatedColumns = [...columns];
      updatedColumns[0] = updatedTodoColumn;
      setColumns(updatedColumns);

      // Save the new card to Firestore
      db.collection('columns')
        .doc('todo')
        .set({ cards: updatedTodoColumn.cards }, { merge: true }) // Save the 'cards' array directly under the 'todo' document
        .catch((error) => {
          console.error('Error updating document:', error);
        });
    }

    setNewCardDescription('');
    setShowModal(false);
  };

  useEffect(() => {
    // Fetch the data from Firebase and update the state on the client-side
    async function fetchData() {
      try {
        const todoSnapshot = await db.collection('columns').doc('todo').get();
        const progressSnapshot = await db.collection('columns').doc('progress').get();
        const doneSnapshot = await db.collection('columns').doc('done').get();

        const todoCards = todoSnapshot.exists ? todoSnapshot.data()?.cards : [];
        const progressCards = progressSnapshot.exists ? progressSnapshot.data()?.cards : [];
        const doneCards = doneSnapshot.exists ? doneSnapshot.data()?.cards : [];

        const updatedColumns = [
          { id: 'todo', title: 'Todo', cards: todoCards },
          { id: 'progress', title: 'Progress', cards: progressCards },
          { id: 'done', title: 'Done', cards: doneCards },
        ];

        setColumns(updatedColumns);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          {columns?.map((column) => (
            <Droppable droppableId={column.id} key={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    border: '1px solid gray',
                    borderRadius: '4px',
                    padding: '8px',
                    margin: '8px',
                    minWidth: '200px',
                    minHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <h3>{column.title}</h3>
                  {column?.cards?.map((card, index) => (
                    <DynamicDraggable key={card.id} draggableId={card.id} index={index} text={card.text} id={card.id}/>
                  ))}
                  {provided.placeholder}
                  {column.id === 'todo' && (
                    <button onClick={handleAddCard} style={{ marginTop: '8px' }}>
                      + Add a card
                    </button>
                  )}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Modal */}
      {showModal && (
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
            <input
              type="text"
              value={newCardDescription}
              onChange={handleModalInputChange}
              placeholder="Enter description..."
              style={{ marginBottom: '10px', width: '100%', padding: '8px', borderRadius: '4px' }}
            />
            <button onClick={handleModalSubmit}>Add Card</button>
          </div>
        </div>
      )}
    </>
  );
};

export const getServerSideProps = async () => {
  try {
    // Fetch the data from Firebase
    const todoSnapshot = await db.collection('columns').doc('todo').get();
    const progressSnapshot = await db.collection('columns').doc('progress').get();
    const doneSnapshot = await db.collection('columns').doc('done').get();

    const todoCards = todoSnapshot.exists ? todoSnapshot.data()?.cards : [];
    const progressCards = progressSnapshot.exists ? progressSnapshot.data()?.cards : [];
    const doneCards = doneSnapshot.exists ? doneSnapshot.data()?.cards : [];

    const initialColumns = [
      { id: 'todo', title: 'Todo', cards: todoCards },
      { id: 'progress', title: 'Progress', cards: progressCards },
      { id: 'done', title: 'Done', cards: doneCards },
    ];

    return { props: { initialColumns } };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { props: { initialColumns: [] } };
  }
};

const DynamicDraggable = dynamic(() => import('./DraggableCard'), {
  ssr: false,
});

export default Board;