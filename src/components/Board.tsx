import React, {useState} from "react";
import { DragDropContext, DropResult, Droppable, Draggable } from "react-beautiful-dnd";
import Column from "@/components/Column";
import dynamic from "next/dynamic";

interface Card {
  id: string;
  text: string;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'Todo',
    cards: [{ id: '1', text: 'Card 1' }, { id: '2', text: 'Card 2' }, { id: '3', text: 'Card 3' }],
  },
  { id: 'progress', title: 'Progress', cards: [] },
  { id: 'done', title: 'Done', cards: [] },
  ];

const Board: React.FC = () => {
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

    const sourceColumn = columns.find((column) => column.id === source.droppableId);
    const destinationColumn = columns.find((column) => column.id === destination.droppableId);
    const draggedCard = sourceColumn?.cards[source.index];

    if (!sourceColumn || !destinationColumn || !draggedCard) {
      return;
    }

    sourceColumn.cards.splice(source.index, 1);

    destinationColumn.cards.splice(destination.index, 0, draggedCard);

    setColumns([...columns]);
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
      const todoColumnIndex = columns.findIndex((column) => column.id === 'todo');

      if (todoColumnIndex !== -1) {
        const updatedTodoColumn = {
          ...columns[todoColumnIndex],
          cards: [...columns[todoColumnIndex].cards, newCard],
        };

        const updatedColumns = [...columns];
        updatedColumns[todoColumnIndex] = updatedTodoColumn;

        setColumns(updatedColumns);
      }
    }

    setNewCardDescription('');
    setShowModal(false);
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          {columns.map((column) => (
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
                  {column.cards.map((card, index) => (
                    <DynamicDraggable key={card.id} draggableId={card.id} index={index} text={card.text} />
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

const DynamicDraggable = dynamic(() => import('./DraggableCard'), {
  ssr: false,
});

export default Board;