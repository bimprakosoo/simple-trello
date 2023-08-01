import React, {useEffect, useState} from "react";
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd";
import dynamic from "next/dynamic";
import { updateColumnCards, addCard, fetchDataColumn } from "@/firebase/firebaseUtils";

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
    void updateColumnCards('todo', columns.find((column) => column.id === 'todo')?.cards || []);
    void updateColumnCards('progress', columns.find((column) => column.id === 'progress')?.cards || []);
    void updateColumnCards('done', columns.find((column) => column.id === 'done')?.cards || []);
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

      void addCard(updatedTodoColumn);
    }

    setNewCardDescription('');
    setShowModal(false);
  };

  useEffect(() => {
    // Fetch the data from Firebase and update the state on the client-side
    const fetchColumnsData = async () => {
      const todoCards = await fetchDataColumn('todo');
      const progressCards = await fetchDataColumn('progress');
      const doneCards = await fetchDataColumn('done');

      const updatedColumns = [
        { id: 'todo', title: 'Todo', cards: todoCards },
        { id: 'progress', title: 'Progress', cards: progressCards },
        { id: 'done', title: 'Done', cards: doneCards },
      ];
      setColumns(updatedColumns);
    };

    void fetchColumnsData();
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

const DynamicDraggable = dynamic(() => import('./DraggableCard'), {
  ssr: false,
});

export default Board;