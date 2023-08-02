import React, {useEffect, useState, Fragment} from "react";
import "tailwindcss/tailwind.css";
import {DragDropContext, DropResult, Droppable} from "react-beautiful-dnd";
import dynamic from "next/dynamic";
import {updateColumnCards, addCard, fetchDataColumn} from "@/firebase/firebaseUtils";
import {Dialog, Transition} from "@headlessui/react";
import '../../assets/css/style.css';

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

const Board: React.FC<Props> = ({initialColumns}) => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newCardDescription, setNewCardDescription] = useState<string>('');

  const handleDragEnd = (result: DropResult) => {
    const {source, destination} = result;

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

  function closeModal() {
    setShowModal(false)
  }

  const handleModalInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewCardDescription(event.target.value);
  };

  const handleModalSubmit = () => {
    if (newCardDescription.trim() !== '') {
      const newCard: Card = {id: Date.now().toString(), text: newCardDescription};

      // Update the state to include the new card
      const todoColumn = columns[0];
      const updatedTodoColumn = {
        ...todoColumn,
        cards: Array.isArray(todoColumn.cards) ? [...todoColumn.cards, newCard] : [newCard],
      };
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
        {id: 'todo', title: 'Todo', cards: todoCards},
        {id: 'progress', title: 'Progress', cards: progressCards},
        {id: 'done', title: 'Done', cards: doneCards},
      ];
      setColumns(updatedColumns);
    };

    void fetchColumnsData();
  }, []);

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
          {columns?.map((column) => (
            <Droppable droppableId={column.id} key={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="custom-column">
                  <h3>{column.title}</h3>
                  {column?.cards?.map((card, index) => (
                    <DynamicDraggable key={card.id} draggableId={card.id} index={index} text={card.text} id={card.id}/>
                  ))}
                  {provided.placeholder}
                  {column.id === 'todo' && (
                    <button onClick={handleAddCard} style={{marginTop: '8px'}}>
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
      <Transition appear show={showModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25"/>
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Add New Task
                  </Dialog.Title>
                  <div className="mt-2">
                    <input type='text' value={newCardDescription} onChange={handleModalInputChange}
                           placeholder='Enter description...'
                           style={{marginBottom: '10px', width: '100%', padding: '8px', borderRadius: '4px',}}/>
                  </div>
                  <div className="mt-4 flex space-x-5">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleModalSubmit}>
                      Save
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}>
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

const DynamicDraggable = dynamic(() => import('./DraggableCard'), {
  ssr: false,
});

export default Board;